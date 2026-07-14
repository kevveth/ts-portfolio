/** Pure, deterministic motion and field math for the bounded hero arena. */

export type BlobCenter = {
	x: number;
	y: number;
	radius: number;
	stretchX: number;
	stretchY: number;
};

export type ReflectedPosition = {
	position: number;
	velocity: number;
	minImpact: number;
	maxImpact: number;
};

const IMPACT_SECONDS = 0.28;

const BLOB_DEFS = [
	{ x: 0.2, y: 0.28, vx: 0.09, vy: 0.075, radius: 0.2 },
	{ x: 0.76, y: 0.7, vx: -0.075, vy: 0.1, radius: 0.15 },
	{ x: 0.68, y: 0.25, vx: 0.105, vy: -0.065, radius: 0.17 },
	{ x: 0.28, y: 0.72, vx: -0.12, vy: -0.09, radius: 0.13 },
	{ x: 0.48, y: 0.52, vx: 0.07, vy: -0.11, radius: 0.19 },
	{ x: 0.86, y: 0.46, vx: -0.1, vy: 0.07, radius: 0.14 },
] as const;

export const BLOB_COUNT = BLOB_DEFS.length;
export const COLOR_COUNT = 2;

export type PointerPosition = {
	x: number;
	y: number;
	active: boolean;
};

/**
 * Reflect a point between two walls without retaining mutable simulation state.
 * Impact values ease from 1 to 0 after a collision and identify its wall.
 */
export function reflectPosition(
	initial: number,
	velocity: number,
	timeSeconds: number,
	min: number,
	max: number,
): ReflectedPosition {
	const span = max - min;
	if (span <= 0 || velocity === 0) {
		return {
			position: (min + max) / 2,
			velocity: 0,
			minImpact: 0,
			maxImpact: 0,
		};
	}
	const distance = initial - min + velocity * timeSeconds;
	const cycle = span * 2;
	const wrapped = ((distance % cycle) + cycle) % cycle;
	const outbound = wrapped <= span;
	const position = min + (outbound ? wrapped : cycle - wrapped);
	const currentVelocity =
		(outbound ? 1 : -1) * Math.abs(velocity) * Math.sign(velocity);
	const distanceFromHit = Math.min(
		wrapped,
		Math.abs(span - wrapped),
		cycle - wrapped,
	);
	const impact = Math.max(
		0,
		1 - distanceFromHit / (Math.abs(velocity) * IMPACT_SECONDS),
	);
	const nearest = wrapped < span / 2 || wrapped > span * 1.5 ? "min" : "max";
	return {
		position,
		velocity: currentVelocity,
		minImpact: nearest === "min" ? impact : 0,
		maxImpact: nearest === "max" ? impact : 0,
	};
}

export function getBlobCenters(
	timeSeconds: number,
	width: number,
	height: number,
): BlobCenter[] {
	const scale = Math.min(width, height);
	return BLOB_DEFS.map((def) => {
		const radius = scale * def.radius;
		const speedY = def.vy * height;
		const motionStretch =
			1 + Math.min(Math.abs(speedY) / Math.max(height, 1), 0.1);
		// Bounds reserve the largest possible deformation, keeping influence contained.
		const minX = radius * 1.12;
		const maxX = width - minX;
		const minY = radius * (motionStretch + 0.12);
		const maxY = height - minY;
		const xMotion = reflectPosition(
			minX + def.x * (maxX - minX),
			def.vx * width,
			timeSeconds,
			minX,
			maxX,
		);
		const yMotion = reflectPosition(
			minY + def.y * (maxY - minY),
			speedY,
			timeSeconds,
			minY,
			maxY,
		);
		const horizontalImpact = Math.max(xMotion.minImpact, xMotion.maxImpact);
		const verticalImpact = Math.max(yMotion.minImpact, yMotion.maxImpact);
		return {
			x: xMotion.position,
			y: yMotion.position,
			radius,
			stretchX: 1 + horizontalImpact * 0.12 - verticalImpact * 0.1,
			stretchY: motionStretch - horizontalImpact * 0.1 + verticalImpact * 0.12,
		};
	});
}

/**
 * Draw nearby blobs toward the pointer without mutating the deterministic
 * baseline motion. The falloff keeps the field calm away from the cursor.
 */
export function attractBlobCenters(
	centers: readonly BlobCenter[],
	pointer: PointerPosition,
	maxDistance: number,
	strength = 0.1,
): readonly BlobCenter[] {
	if (!pointer.active || maxDistance <= 0 || strength <= 0) return centers;

	return centers.map((center) => {
		const dx = pointer.x - center.x;
		const dy = pointer.y - center.y;
		const distance = Math.hypot(dx, dy);
		const influence = Math.max(0, 1 - distance / maxDistance);
		const eased = influence * influence * strength;
		return {
			...center,
			x: center.x + dx * eased,
			y: center.y + dy * eased,
			stretchX: center.stretchX + influence * 0.045,
			stretchY: center.stretchY + influence * 0.045,
		};
	});
}

/** A slowly travelling diagonal wave used as the two-color mix per pixel. */
export function gradientMix(
	x: number,
	y: number,
	timeSeconds: number,
	width: number,
	height: number,
): number {
	const nx = width > 0 ? x / width : 0;
	const ny = height > 0 ? y / height : 0;
	return (
		0.5 +
		Math.sin((nx * 1.45 + ny * 0.85 + timeSeconds * 0.045) * Math.PI * 2) * 0.5
	);
}

/** Smooth alpha ramp for the visible edge of the metaball field. */
export function smoothFieldAlpha(
	value: number,
	threshold: number,
	feather = 0.7,
): number {
	if (value <= threshold) return 0;
	const t = Math.min(1, (value - threshold) / Math.max(feather, 0.001));
	return t * t * (3 - 2 * t);
}

export function sampleField(
	x: number,
	y: number,
	centers: readonly BlobCenter[],
): number {
	let sum = 0;
	for (const c of centers) {
		const dx = (x - c.x) / c.stretchX;
		const dy = (y - c.y) / c.stretchY;
		sum += (c.radius * c.radius) / (dx * dx + dy * dy + 1);
	}
	return sum;
}
