/**
 * Inline SVG filter definition for Liquid Glass buttons. Injected once in
 * __root.tsx so every `.btn-glass` on the page shares the same filter graph.
 *
 * The filter is fully procedural — no external raster assets. It works at any
 * element size because it operates on SourceGraphic / SourceAlpha relative to
 * the filter region, not on fixed-dimension feImage maps.
 *
 * Pipeline:
 *   1. SourceGraphic → slight blur (softens input)
 *   2. SourceAlpha → dilate + erode → edge mask (only the perimeter)
 *   3. feTurbulence → organic noise, masked by edge mask
 *   4. feDisplacementMap → warp blurred source by edge noise (refraction)
 *   5. feColorMatrix → saturate the displaced result (vibrant glass)
 *   6. edge mask → blur → feComposite(in) with saturated → specular rim
 *   7. feBlend(specular, displaced) → final output
 *
 * Fallback browsers that don't support url() in backdrop-filter see only the
 * CSS blur fallback in styles.css. The filter ID is a stable contract — see
 * src/lib/glass-filter.test.ts.
 */
export function LiquidGlassFilter() {
	return (
		<svg
			aria-hidden="true"
			style={{ position: "absolute", width: 0, height: 0 }}
		>
			<filter
				id="liquid-glass"
				x="-20%"
				y="-20%"
				width="140%"
				height="140%"
				colorInterpolationFilters="sRGB"
			>
				{/* 1. Soften the source graphic */}
				<feGaussianBlur
					in="SourceGraphic"
					stdDeviation="0.8"
					result="blurred-source"
				/>

				{/* 2. Edge mask from alpha channel */}
				<feMorphology
					in="SourceAlpha"
					operator="dilate"
					radius="4"
					result="dilated"
				/>
				<feMorphology
					in="dilated"
					operator="erode"
					radius="3"
					result="edge-mask"
				/>

				{/* 3. Turbulence constrained to edges */}
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.04"
					numOctaves="3"
					seed="2"
					result="noise"
				/>
				<feComposite
					in="noise"
					in2="edge-mask"
					operator="in"
					result="edge-noise"
				/>

				{/* 4. Refraction: displace the blurred background by edge noise */}
				<feDisplacementMap
					in="blurred-source"
					in2="edge-noise"
					scale="45"
					xChannelSelector="R"
					yChannelSelector="G"
					result="displaced"
				/>

				{/* 5. Saturate the displaced result */}
				<feColorMatrix
					in="displaced"
					type="saturate"
					values="1.4"
					result="displaced-saturated"
				/>

				{/* 6. Specular rim: soften edge mask and use as highlight mask */}
				<feGaussianBlur in="edge-mask" stdDeviation="2" result="rim-soft" />
				<feColorMatrix
					in="rim-soft"
					type="matrix"
					values="1.8 0 0 0 0  0 1.8 0 0 0  0 0 1.8 0 0  0 0 0 1 0"
					result="rim-bright"
				/>
				<feComposite
					in="displaced-saturated"
					in2="rim-bright"
					operator="in"
					result="specular"
				/>

				{/* 7. Blend specular rim over displaced base */}
				<feBlend in="specular" in2="displaced" mode="screen" result="final" />
			</filter>
		</svg>
	);
}
