// Renders a symmetric 5x5 pixel-art blob (like a mini identicon) from a seed.
// This gives us 20 distinct, cute, deterministic "profile pictures" with
// zero external image assets - fully anonymous and consistent every render.

function seededPattern(seed) {
  // simple deterministic pseudo-random generator
  let s = seed
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  const grid = []
  for (let row = 0; row < 5; row++) {
    const rowCells = []
    for (let col = 0; col < 3; col++) {
      rowCells.push(rand() > 0.55)
    }
    // mirror columns 0,1 -> 4,3 for symmetry, col 2 is center
    grid.push([...rowCells, rowCells[1], rowCells[0]])
  }
  return grid
}

export default function PixelAvatar({ avatar, size = 56, className = '' }) {
  const grid = seededPattern(avatar.seed)
  const cell = size / 5

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect width={size} height={size} fill={avatar.secondary} />
      {grid.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell}
              y={r * cell}
              width={cell}
              height={cell}
              fill={avatar.primary}
            />
          ) : null
        )
      )}
    </svg>
  )
}
