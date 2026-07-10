import { useEffect, useRef } from "react";
import {
	blendColors,
	COLOR_COUNT,
	getBlobCenters,
	POSTERIZE_BANDS,
	posterizeField,
	sampleField,
} from "#/lib/hero-blobs";

const BUFFER_WIDTH = 160;
const MIN_BUFFER_HEIGHT = 40;
const MAX_BUFFER_HEIGHT = 320;
const FIELD_THRESHOLD = 1.0;
/** ~20fps — smoother than the old 12.5fps, still cheap at 160px buffer width. */
const FRAME_INTERVAL_MS = 50;

type ResolvedColor = [r: number, g: number, b: number, a: number];

/**
 * Resolves a CSS color (including color-mix()/oklab, which canvas fillStyle
 * can't be string-compared against) to concrete sRGB bytes via a 1x1 canvas
 * round-trip.
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
) {
	// Re-read colors every frame — trivially cheap (5×1px canvas probes at
	// 20fps) and ensures HMR CSS updates are picked up without a full reload.
	const colors = readBlobColors();
	const centers = getBlobCenters(timeSeconds, width, height);
	const image = ctx.createImageData(width, height);
	const data = image.data;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4;
			const field = posterizeField(sampleField(x, y, centers), FIELD_THRESHOLD);
			if (field < 0) continue;

			const weights = blendColors(x, y, centers, colors.length);

			// Weighted blend: each color contributes proportionally to its
			// blob's influence at this pixel. Overlap zones get smooth
			// warm-to-cool transitions instead of hard Voronoi edges.
			let r = 0;
			let g = 0;
			let b = 0;
			let a = 0;
			for (let ci = 0; ci < colors.length; ci++) {
				const w = weights[ci];
				if (w < 0.001) continue;
				const [cr, cg, cb, ca] = colors[ci];
				r += cr * w;
				g += cg * w;
				b += cb * w;
				a += ca * w;
			}

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
 * chunky/retro look. Six blobs with weighted color blending and noise-based
 * jitter produce organic lava-like motion. Client-only: the canvas is empty
 * markup on the server.
 */
export function HeroBlobs() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		if (window.matchMedia("(prefers-reduced-transparency: reduce)").matches)
			return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

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
				drawFrame(ctx, canvas.width, canvas.height, (now - startTime) / 1000);
			}
			rafId = requestAnimationFrame(render);
		};

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
		drawFrame(ctx, canvas.width, canvas.height, 0);

		const resizeObserver = new ResizeObserver(() => {
			sizeBuffer();
			if (rafId === null) {
				drawFrame(
					ctx,
					canvas.width,
					canvas.height,
					(performance.now() - startTime) / 1000,
				);
			}
		});
		resizeObserver.observe(canvas);

		// Theme observer: dark/light class toggle on <html> triggers repaint.
		// Colors are re-read in drawFrame each frame anyway, so HMR updates
		// to CSS custom properties are picked up without extra observers.
		const themeObserver = new MutationObserver(() => {
			if (rafId === null) {
				drawFrame(
					ctx,
					canvas.width,
					canvas.height,
					(performance.now() - startTime) / 1000,
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
			<div aria-hidden className="hero-blobs-fallback absolute inset-0 -z-20" />
		</>
	);
}
