import { NOTE_COLORS } from '../lib/noteColors';

export default function ColorPicker({ selectedColorId, onChange, compact }) {
  return (
    <div className={'sn-color-picker' + (compact ? ' sn-color-picker--compact' : '')}>
      {!compact && <span className="sn-color-picker__label">Pick a color</span>}
      <div className="sn-color-picker__swatches" role="radiogroup" aria-label="Note color">
        {NOTE_COLORS.map(function (color) {
          const isSelected = color.id === selectedColorId;

          return (
            <button
              key={color.id}
              type="button"
              className={'sn-color-swatch' + (isSelected ? ' sn-color-swatch--selected' : '')}
              style={{ backgroundColor: color.bg }}
              aria-label={color.label}
              aria-checked={isSelected}
              role="radio"
              onClick={function () {
                onChange(color.id);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
