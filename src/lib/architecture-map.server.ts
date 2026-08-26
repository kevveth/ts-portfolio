import "@tanstack/react-start/server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export type ArchitectureModule = {
	area: string;
	dependencies: string[];
	dependents: string[];
	description: string;
	exports: string[];
	externalDependencies: string[];
	generated: boolean;
	id: string;
	kind: string;
	lineCount: number;
	name: string;
	source: string;
};

export type ArchitectureArea = {
	dependencies: string[];
	description: string;
	id: string;
	moduleCount: number;
	name: string;
};

export type ArchitectureMap = {
	areas: ArchitectureArea[];
	generatedAt: string;
	modules: ArchitectureModule[];
	repository: string;
};

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const FROM_IMPORT_PATTERN = /\bfrom\s+["']([^"']+)["']/g;
const SIDE_EFFECT_IMPORT_PATTERN = /\bimport\s*["']([^"']+)["']/g;
const EXPORT_DECLARATION_PATTERN =
	/\bexport\s+(?:declare\s+)?(?:default\s+)?(?:async\s+)?(?:type|interface|const|let|var|function|class|enum)\s+([A-Za-z_$][\w$]*)/g;
const EXPORT_LIST_PATTERN = /\bexport\s*{([^}]+)}/g;

async function findSourceFiles(directory: string): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const entryPath = path.join(directory, entry.name);
			if (entry.isDirectory()) return findSourceFiles(entryPath);
			if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) return [entryPath];
			return [];
		}),
	);

	return files.flat();
}

function toRepositoryPath(repositoryRoot: string, filePath: string): string {
	return path.relative(repositoryRoot, filePath).split(path.sep).join("/");
}

function getArea(filePath: string): string {
	const [, firstSegment] = filePath.split("/");
	return firstSegment && SOURCE_EXTENSIONS.has(path.extname(firstSegment))
		? "application"
		: (firstSegment ?? "application");
}

function getKind(filePath: string): string {
	if (filePath.endsWith(".test.ts") || filePath.endsWith(".test.tsx")) {
		return "test";
	}
	if (filePath.includes("/components/ui/")) return "primitive";
	if (filePath.includes("/components/")) return "component";
	if (filePath.includes("/routes/")) return "route";
	if (filePath.includes("/content/")) return "content";
	if (filePath.includes("/lib/")) return "library";
	if (filePath.includes("/test/")) return "test-support";
	if (filePath.endsWith(".d.ts")) return "declaration";
	return "application";
}

function describeModule(filePath: string, kind: string): string {
	const name = path.basename(filePath).replace(/\.(test\.)?(ts|tsx)$/, "");
	const descriptions: Record<string, string> = {
		application: `Application entry or configuration module for ${name}.`,
		component: `Application UI component centered on ${name}.`,
		content: `Typed portfolio content and content-facing behavior for ${name}.`,
		declaration: "Type declarations used by the application build.",
		library: `Shared application logic or browser integration for ${name}.`,
		primitive: `Reusable low-level UI primitive for ${name}.`,
		route: `TanStack route boundary for ${name}.`,
		test: `Behavioral checks colocated with ${name}.`,
		"test-support": `Shared test setup or rendering support for ${name}.`,
	};

	return descriptions[kind] ?? `Source module for ${name}.`;
}

function readImportSpecifiers(source: string): string[] {
	const specifiers = new Set<string>();
	for (const match of source.matchAll(FROM_IMPORT_PATTERN)) {
		if (match[1]) specifiers.add(match[1]);
	}
	for (const match of source.matchAll(SIDE_EFFECT_IMPORT_PATTERN)) {
		if (match[1]) specifiers.add(match[1]);
	}
	return [...specifiers];
}

function readExports(source: string): string[] {
	const exports = new Set<string>();
	for (const match of source.matchAll(EXPORT_DECLARATION_PATTERN)) {
		if (match[1]) exports.add(match[1]);
	}

	for (const match of source.matchAll(EXPORT_LIST_PATTERN)) {
		for (const exportName of (match[1] ?? "").split(",")) {
			const normalized = exportName
				.trim()
				.split(/\s+as\s+/)
				.at(-1)
				?.trim();
			if (normalized) exports.add(normalized);
		}
	}

	return [...exports].sort();
}

function resolveLocalImport(
	modulePath: string,
	specifier: string,
	knownPaths: Set<string>,
): string | null {
	const withoutQuery = specifier.split("?")[0] ?? specifier;
	let basePath: string;
	if (withoutQuery.startsWith("#/")) {
		basePath = `src/${withoutQuery.slice(2)}`;
	} else if (withoutQuery.startsWith(".")) {
		basePath = path.posix.normalize(
			path.posix.join(path.posix.dirname(modulePath), withoutQuery),
		);
	} else {
		return null;
	}

	const extension = path.posix.extname(basePath);
	const candidates = extension
		? [basePath]
		: [
				basePath,
				`${basePath}.ts`,
				`${basePath}.tsx`,
				`${basePath}/index.ts`,
				`${basePath}/index.tsx`,
			];

	return candidates.find((candidate) => knownPaths.has(candidate)) ?? null;
}

function makeAreaSummary(
	area: string,
	modules: ArchitectureModule[],
): Omit<ArchitectureArea, "dependencies"> {
	const descriptions: Record<string, string> = {
		application:
			"Application bootstrap, generated routing, and global declarations.",
		components:
			"Reusable presentation and interaction modules used by route boundaries.",
		content: "Typed portfolio data and the functions that expose it to the UI.",
		lib: "Shared behavior that is independent of any single route or component.",
		routes:
			"TanStack Start delivery boundaries that compose content and components.",
		test: "Shared test infrastructure used by colocated behavioral checks.",
	};

	return {
		description:
			descriptions[area] ?? `Source modules grouped under src/${area}.`,
		id: `area:${area}`,
		moduleCount: modules.length,
		name:
			area === "application"
				? "Application"
				: `${area[0]?.toUpperCase() ?? ""}${area.slice(1)}`,
	};
}

function groupModulesByArea(
	modules: ArchitectureModule[],
): Map<string, ArchitectureModule[]> {
	const modulesByArea = new Map<string, ArchitectureModule[]>();
	for (const module of modules) {
		const areaModules = modulesByArea.get(module.area) ?? [];
		areaModules.push(module);
		modulesByArea.set(module.area, areaModules);
	}
	return modulesByArea;
}

export async function buildArchitectureMap(
	repositoryRoot = process.cwd(),
): Promise<ArchitectureMap> {
	const sourceRoot = path.join(repositoryRoot, "src");
	const filePaths = (await findSourceFiles(sourceRoot))
		.map((filePath) => toRepositoryPath(repositoryRoot, filePath))
		.sort();
	const knownPaths = new Set(filePaths);
	const modules: ArchitectureModule[] = [];

	for (const filePath of filePaths) {
		const source = await readFile(path.join(repositoryRoot, filePath), "utf8");
		const kind = getKind(filePath);
		const importSpecifiers = readImportSpecifiers(source);
		const dependencies = importSpecifiers
			.map((specifier) => resolveLocalImport(filePath, specifier, knownPaths))
			.filter((dependency): dependency is string => dependency !== null);
		const externalDependencies = importSpecifiers.filter(
			(specifier) => !specifier.startsWith(".") && !specifier.startsWith("#/"),
		);

		modules.push({
			area: getArea(filePath),
			dependencies: [...new Set(dependencies)].sort(),
			dependents: [],
			description: describeModule(filePath, kind),
			exports: readExports(source),
			externalDependencies: [...new Set(externalDependencies)].sort(),
			generated: filePath.endsWith("routeTree.gen.ts"),
			id: filePath,
			kind,
			lineCount: source.split("\n").length,
			name: path.basename(filePath).replace(/\.(ts|tsx)$/, ""),
			source,
		});
	}

	const modulesById = new Map(modules.map((module) => [module.id, module]));
	for (const module of modules) {
		for (const dependency of module.dependencies) {
			modulesById.get(dependency)?.dependents.push(module.id);
		}
	}
	for (const module of modules) module.dependents.sort();

	const modulesByArea = groupModulesByArea(modules);
	const areas = [...modulesByArea.entries()]
		.map(([area, areaModules]): ArchitectureArea => {
			const crossAreaDependencies = new Set<string>();
			for (const module of areaModules) {
				for (const dependency of module.dependencies) {
					const dependencyArea = modulesById.get(dependency)?.area;
					if (dependencyArea && dependencyArea !== area) {
						crossAreaDependencies.add(dependencyArea);
					}
				}
			}
			return {
				...makeAreaSummary(area, areaModules),
				dependencies: [...crossAreaDependencies].sort(),
			};
		})
		.sort((left, right) => left.name.localeCompare(right.name));

	return {
		areas,
		generatedAt: new Date().toISOString(),
		modules,
		repository: path.basename(repositoryRoot),
	};
}
