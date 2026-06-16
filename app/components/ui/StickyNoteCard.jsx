import { FwIcon } from '@freshworks/crayons/react';
import { getColorById } from '../lib/noteColors';

function PinIcon() {
  return (
    <div className="sn-pin" aria-hidden="true">
      <span className="sn-pin__shadow" />
      <span className="sn-pin__head" />
      <span className="sn-pin__needle" />
    </div>
  );
}

export default function StickyNoteCard({
  noteContent,
  ticketId,
  colorId,
  createdAt,
  rotation = 0,
  compact = false,
  isSample = false,
  onEdit,
  onDelete
}) {
  const color = getColorById(colorId);
  const trimmed = (noteContent || '').trim();
  const showActions = !compact && (onEdit || onDelete);

  return (
    <article
      className={'sn-note-card' + (compact ? ' sn-note-card--compact' : '')}
      style={{
        backgroundColor: color.bg,
        color: color.ink,
        transform: 'rotate(' + rotation + 'deg)'
      }}
    >
      <PinIcon />

      {showActions ? (
        <div className="sn-note-card__toolbar">
          {onEdit ? (
            <button
              type="button"
              className="sn-note-card__icon-btn"
              aria-label="Edit note"
              title="Edit"
              onClick={onEdit}
            >
              <FwIcon name="edit" size={14} />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              className="sn-note-card__icon-btn sn-note-card__icon-btn--danger"
              aria-label="Delete note"
              title="Delete"
              onClick={onDelete}
            >
              <FwIcon name="delete" size={14} />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="sn-note-card__meta">
        <span className="sn-note-card__ticket">Ticket #{ticketId || '—'}</span>
        {isSample ? <span className="sn-note-card__sample">Sample</span> : null}
        {createdAt ? <span className="sn-note-card__date">{createdAt}</span> : null}
      </div>

      <div className="sn-note-card__body">
        {trimmed ? trimmed : <span className="sn-note-card__empty">Empty note</span>}
      </div>
    </article>
  );
}
