export const NOTE_COLORS = [
  { id: 'yellow', label: 'Yellow', bg: '#fff176', ink: '#5d4e00' },
  { id: 'pink', label: 'Pink', bg: '#f8bbd0', ink: '#6d1b3b' },
  { id: 'green', label: 'Green', bg: '#c8e6c9', ink: '#1b5e20' },
  { id: 'blue', label: 'Blue', bg: '#bbdefb', ink: '#0d47a1' },
  { id: 'orange', label: 'Orange', bg: '#ffe0b2', ink: '#e65100' }
];

export const DEFAULT_NOTE_COLOR = 'yellow';

export function getColorById(colorId) {
  return NOTE_COLORS.find(function (color) {
    return color.id === colorId;
  }) || NOTE_COLORS[0];
}
