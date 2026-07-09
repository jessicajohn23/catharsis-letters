import { STAMPS, LETTER_COLORS } from '../lib/constants'

export default function StampAndColorPicker({
  color,
  onColorChange,
  stamp,
  onStampChange
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-pixel text-base mb-2">letter color</p>
        <div className="flex flex-wrap gap-2">
          {LETTER_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              title={c.name}
              onClick={() => onColorChange(c.hex)}
              className="w-8 h-8 border-2"
              style={{
                backgroundColor: c.hex,
                borderColor: color === c.hex ? '#3D2352' : 'transparent',
                boxShadow: color === c.hex ? '2px 2px 0px 0px #3D2352' : 'none'
              }}
              aria-label={c.name}
              aria-pressed={color === c.hex}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="font-pixel text-base mb-2">stamp (optional)</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onStampChange(null)}
            className={`w-9 h-9 pixel-border-sm border-2 flex items-center justify-center text-xs font-pixel ${
              !stamp ? 'bg-violet text-white' : 'bg-white'
            }`}
          >
            none
          </button>
          {STAMPS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStampChange(s)}
              className="w-9 h-9 border-2 flex items-center justify-center text-lg"
              style={{
                borderColor: stamp === s ? '#3D2352' : '#d1c4e0',
                background: stamp === s ? '#FFC2E2' : 'white'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
