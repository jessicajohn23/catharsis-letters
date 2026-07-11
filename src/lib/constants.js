// Cute stamps users can add to a letter. Keep the mood warm/soft.
export const STAMPS = [
  '💌', '🌸', '🎀', '🌷', '🧸', '🍡', '🍓', '🌻',
  '🦋', '⭐', '🌙', '☁️', '🍄', '🫧', '🩰', '🍒',
  '🌈', '🕊️', '🪐', '🍬', '🧁', '🪄', '🐚', '🌼'
]

// Letter background colors — soft pastel-forward but with a real range.
export const LETTER_COLORS = [
  { name: 'Blush', hex: '#FFD6E8' },
  { name: 'Lavender', hex: '#E4D6FF' },
  { name: 'Lilac', hex: '#D6C7FF' },
  { name: 'Cotton Candy', hex: '#FFC2E2' },
  { name: 'Periwinkle', hex: '#C7D2FF' },
  { name: 'Peach', hex: '#FFE0C7' },
  { name: 'Butter', hex: '#FFF3C4' },
  { name: 'Mint', hex: '#C7F5E0' },
  { name: 'Sky', hex: '#C7EAFF' },
  { name: 'Rose', hex: '#F7B8D0' },
  { name: 'Grape', hex: '#B79CE8' },
  { name: 'Bubblegum', hex: '#F15BB5' },
  { name: 'Deep Violet', hex: '#9B5DE5' },
  { name: 'Plum', hex: '#7A4CA0' },
  { name: 'Cream', hex: '#FDF4E3' },
  { name: 'Charcoal Paper', hex: '#3D2352' }
]

// 20 deterministic pixel-avatar presets: a base palette pair + pattern seed.
// PixelAvatar.jsx renders these procedurally so no image assets are needed.
export const AVATARS = Array.from({ length: 20 }).map((_, i) => ({
  id: `avatar_${i + 1}`,
  seed: i * 17 + 3, // arbitrary deterministic seed per avatar
  primary: [
    '#F15BB5', '#9B5DE5', '#FFC2E2', '#C7D2FF', '#7A4CA0',
    '#F7B8D0', '#B79CE8', '#D63A93', '#C9A2F0', '#5E2B97'
  ][i % 10],
  secondary: [
    '#FDF4FF', '#3D2352', '#FFE0C7', '#C7F5E0', '#1A1025'
  ][i % 5]
}))

// Picks a readable text color (dark ink or cream) based on the letter's background.
export function getReadableTextColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#3D2352' : '#FDF4FF'
}