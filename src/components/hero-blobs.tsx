import { useEffect, useRef } from "react";
import {
	attractBlobCenters,
	COLOR_COUNT,
	getBlobCenters,
	gradientMix,
	sampleField,
	smoothFieldAlpha,
} from "#/lib/hero-blobs";

const BUFFER_WIDTH = 240;
const MIN_BUFFER_HEIGHT = 72;
const MAX_BUFFER_HEIGHT = 420;
const FIELD_THRESHOLD = 0.86;
/** 30fps keeps the field fluid without spending a full animation frame on it. */
const FRAME_INTERVAL_MS = 1000 / 30;

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
			resolveCssColor(style.getPropertyValue(`--hero-color-${i}`).trim()),
		);
	}
	return colors;
}

function drawFrame(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	timeSeconds: number,
	pointer: { x: number; y: number; active: boolean },
	colors: readonly ResolvedColor[],
) {
	const centers = attractBlobCenters(
		getBlobCenters(timeSeconds, width, height),
		pointer,
		Math.min(width, height) * 0.72,
	);
	const image = ctx.createImageData(width, height);
	const data = image.data;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4;
			const alpha = smoothFieldAlpha(
				sampleField(x, y, centers),
				FIELD_THRESHOLD,
			);
			if (alpha <= 0) continue;

			const mix = gradientMix(x, y, timeSeconds, width, height);
			const [ar, ag, ab, aa] = colors[0];
			const [br, bg, bb, ba] = colors[1];
			data[idx] = ar + (br - ar) * mix;
			data[idx + 1] = ag + (bg - ag) * mix;
			data[idx + 2] = ab + (bb - ab) * mix;
			data[idx + 3] = Math.round((aa + (ba - aa) * mix) * alpha * 255);
		}
	}

	ctx.putImageData(image, 0, 0);
}

/**
 * Ambient "lava lamp" background for the hero — a metaball field rendered at
 * a modest backing resolution and softly upscaled. Six blobs ricochet
 * within radius-aware bounds while a two-color gradient travels through the
 * complete field. Client-only: the canvas is empty markup on the server.
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
		let colors = readBlobColors();

		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const finePointer = window.matchMedia(
			"(hover: hover) and (pointer: fine)",
		).matches;
		const pointer = { x: 0, y: 0, active: false };
		const pointerTarget = { x: 0, y: 0, active: false };

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
				pointer.x += (pointerTarget.x - pointer.x) * 0.12;
				pointer.y += (pointerTarget.y - pointer.y) * 0.12;
				pointer.active = pointerTarget.active;
				drawFrame(
					ctx,
					canvas.width,
					canvas.height,
					(now - startTime) / 1000,
					pointer,
					colors,
				);
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
		drawFrame(ctx, canvas.width, canvas.height, 0, pointer, colors);

		const arena = canvas.closest<HTMLElement>(".hero-arena");
		const handlePointerMove = (event: PointerEvent) => {
			if (!finePointer) return;
			const rect = canvas.getBoundingClientRect();
			pointerTarget.x =
				((event.clientX - rect.left) / rect.width) * canvas.width;
			pointerTarget.y =
				((event.clientY - rect.top) / rect.height) * canvas.height;
			pointerTarget.active = true;
		};
		const handlePointerLeave = () => {
			pointerTarget.active = false;
		};
		arena?.addEventListener("pointermove", handlePointerMove);
		arena?.addEventListener("pointerleave", handlePointerLeave);

		const resizeObserver = new ResizeObserver(() => {
			sizeBuffer();
			if (rafId === null) {
				drawFrame(
					ctx,
					canvas.width,
					canvas.height,
					(performance.now() - startTime) / 1000,
					pointer,
					colors,
				);
			}
		});
		resizeObserver.observe(canvas);

		// Theme changes are the only production event that changes the palette.
		// Resolve the CSS colors once per theme instead of creating probe canvases
		// during every animation frame.
		const themeObserver = new MutationObserver(() => {
			colors = readBlobColors();
			if (rafId === null) {
				drawFrame(
					ctx,
					canvas.width,
					canvas.height,
					(performance.now() - startTime) / 1000,
					pointer,
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
			arena?.removeEventListener("pointermove", handlePointerMove);
			arena?.removeEventListener("pointerleave", handlePointerLeave);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);

	return (
		<>
			<canvas
				aria-hidden
				ref={canvasRef}
				className="hero-blobs absolute inset-0"
			/>
			<div aria-hidden className="hero-blobs-fallback absolute inset-0" />
		</>
	);
}
