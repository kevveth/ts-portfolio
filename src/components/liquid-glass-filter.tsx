/**
 * Inline SVG filter for the liquid glass rim distortion.
 *
 * Applied to .btn-glass::before via `filter: url(#liquid-glass)`.
 * The pseudo-element paints a bright specular rim gradient; this filter
 * distorts the rim edges with fractal noise for an organic "liquid" feel.
 *
 * Pipeline is minimal by design — the CSS handles blur, brightness, and
 * layering. This filter only adds edge warping to the specular rim.
 */
export function LiquidGlassFilter() {
	return (
		<svg
			aria-hidden="true"
			style={{ position: "absolute", width: 0, height: 0 }}
		>
			<filter
				id="liquid-glass"
				x="-30%"
				y="-30%"
				width="160%"
				height="160%"
				colorInterpolationFilters="sRGB"
			>
				{/* Multi-scale turbulence for organic edge noise */}
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.05 0.08"
					numOctaves="4"
					seed="3"
					result="noise"
				/>

				{/* Displace the rim gradient by noise.
				    R channel = horizontal, G channel = vertical.
				    Scale 35 = moderate wobble at edges. */}
				<feDisplacementMap
					in="SourceGraphic"
					in2="noise"
					scale="35"
					xChannelSelector="R"
					yChannelSelector="G"
				/>
			</filter>
		</svg>
	);
}
