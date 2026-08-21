// A fixed, subtle animated film-grain texture sitting above all content.
// Pure SVG/CSS — no image assets, negligible performance cost.
export default function GrainOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[90] opacity-[0.035] mix-blend-multiply" aria-hidden="true">
      <svg className="h-full w-full grain-animate" xmlns="http://www.w3.org/2000/svg">
        <filter id="grainFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grainFilter)" />
      </svg>
    </div>
  )
}
