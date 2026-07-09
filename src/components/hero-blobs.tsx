import { useEffect, useRef } from "react";
import {
	dominantColorIndex,
	getBlobCenters,
	POSTERIZE_BANDS,
	posterizeField,
	sampleField,
} from "#/lib/hero-blobs";

const BUFFER_WIDTH = 96;
const MIN_BUFFER_HEIGHT = 24;
const MAX_BUFFER_HEIGHT = 200;
const FIELD_THRESHOLD = 6;
const COLOR_COUNT = 3;
/** ~12fps — cheap, and the stepped cadence reinforces the retro/chunky motion rather than fighting it. */
const FRAME_INTERVAL_MS = 80;

type ResolvedColor = [r: number, g: number, b: number, a: number];

/**
 * Resolves a CSS color (including color-mix()/oklab, which canvas fillStyle
 * can't be string-compared against) to concrete sRGB bytes via a 1x1 canvas
 * round-trip — the same technique the verify-contrast skill uses to read
 * real composited pixels instead of parsing CSS strings.
 */
function resolveCssColor(colorString: string): ResolvedColor {
	const probe = document.createElement("canvas");
	probe.width = 1;
	probe.height = 1;
	const ctx = probe.getContext("2d");
	if (!ctx) return [0, 0, 0, 0];
	ctx.clearRect(0, 0, 1, 1);
	ctx.fillStyle = colorString;
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
	return [r, g, b, a / 255];
}

function readBlobColors(): ResolvedColor[] {
	const style = getComputedStyle(document.documentElement);
	const colors: ResolvedColor[] = [];
	for (let i = 1; i <= COLOR_COUNT; i++) {
		colors.push(
			resolveCssColor(style.getPropertyValue(`--hero-blob-${i}`).trim()),
		);
	}
	return colors;
}

function drawFrame(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	timeSeconds: number,
	colors: readonly ResolvedColor[],
) {
	const centers = getBlobCenters(timeSeconds, width, height);
	const image = ctx.createImageData(width, height);
	const data = image.data;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4;
			const field = posterizeField(sampleField(x, y, centers), FIELD_THRESHOLD);
			if (field < 0) continue;
			const colorIndex = dominantColorIndex(x, y, centers) % colors.length;
			const [r, g, b, a] = colors[colorIndex];
			const bandIntensity = (field + 1) / POSTERIZE_BANDS;
			data[idx] = r;
			data[idx + 1] = g;
			data[idx + 2] = b;
			data[idx + 3] = Math.round(a * bandIntensity * 255);
		}
	}

	ctx.putImageData(image, 0, 0);
}

/**
 * Ambient "lava lamp" background for the hero — a metaball field rendered at
 * low resolution and upscaled with `image-rendering: pixelated` for a
 * chunky/retro look rather than a smooth gradient mesh. Client-only: the
 * canvas is empty markup on the server, all drawing happens in an effect
 * after mount so this never affects SSR/hydration.
 */
export function HeroBlobs() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		// Reduced transparency drops straight to the flat CSS fallback (see
		// .hero-blobs-fallback in styles.css) — don't even mount the canvas
		// drawing, matching how .btn-glass fully removes its material rather
		// than just dimming it under this preference.
		if (window.matchMedia("(prefers-reduced-transparency: reduce)").matches)
			return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let colors = readBlobColors();
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		const sizeBuffer = () => {
			const rect = canvas.getBoundingClientRect();
			const aspect = rect.width > 0 ? rect.height / rect.width : 0.5;
			const height = Math.min(
				MAX_BUFFER_HEIGHT,
				Math.max(MIN_BUFFER_HEIGHT, Math.round(BUFFER_WIDTH * aspect)),
			);
			if (canvas.width !== BUFFER_WIDTH || canvas.height !== height) {
				canvas.width = BUFFER_WIDTH;
				canvas.height = height;
			}
		};

		const startTime = performance.now();
		let rafId: number | null = null;
		let lastDrawTime = 0;

		const render = (now: number) => {
			if (now - lastDrawTime >= FRAME_INTERVAL_MS) {
				lastDrawTime = now;
				drawFrame(
					ctx,
					canvas.width,
					canvas.height,
					(now - startTime) / 1000,
					colors,
				);
			}
			rafId = requestAnimationFrame(render);
		};

		// Two independent gates — the loop only runs while both are true.
		// Reduced-motion never joins this dance at all: it draws one frame
		// below and stays there permanently (Apple/WCAG 2.3.1 precedent
		// already established for .btn-glass — see styles.css:434-455).
		let isIntersecting = false;
		let isPageVisible = !document.hidden;

		const syncRunning = () => {
			if (prefersReducedMotion) return;
			const shouldRun = isIntersecting && isPageVisible;
			if (shouldRun && rafId === null) {
				lastDrawTime = 0;
				rafId = requestAnimationFrame(render);
			} else if (!shouldRun && rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		};

		sizeBuffer();
		drawFrame(ctx, canvas.width, canvas.height, 0, colors);

		const resizeObserver = new ResizeObserver(() => {
			sizeBuffer();
			if (rafId === null) {
				drawFrame(
					ctx,
					canvas.width,
					canvas.height,
					(performance.now() - startTime) / 1000,
					colors,
				);
			}
		});
		resizeObserver.observe(canvas);

		const themeObserver = new MutationObserver(() => {
			colors = readBlobColors();
			if (rafId === null) {
				drawFrame(
					ctx,
					canvas.width,
					canvas.height,
					(performance.now() - startTime) / 1000,
					colors,
				);
			}
		});
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		const intersectionObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					isIntersecting = entry.isIntersecting;
				}
				syncRunning();
			},
			{ threshold: 0 },
		);
		intersectionObserver.observe(canvas);

		const handleVisibilityChange = () => {
			isPageVisible = !document.hidden;
			syncRunning();
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			if (rafId !== null) cancelAnimationFrame(rafId);
			resizeObserver.disconnect();
			themeObserver.disconnect();
			intersectionObserver.disconnect();
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);

	return (
		<>
			<canvas
				aria-hidden
				ref={canvasRef}
				className="hero-blobs absolute inset-0 -z-20"
			/>
			{/* Shown only under prefers-reduced-transparency: reduce — see styles.css */}
			<div aria-hidden className="hero-blobs-fallback absolute inset-0 -z-20" />
		</>
	);
}
