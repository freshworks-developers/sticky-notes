import { useCallback, useEffect, useState } from 'react';
import { FwButton, FwSpinner, FwTextarea } from '@freshworks/crayons/react';
import '../bootstrap/crayonsInit';
import { DEFAULT_NOTE_COLOR } from '../lib/noteColors';
import {
  fetchNoteForTicket,
  getNotesEntity,
  saveNote
} from '../lib/notesService';
import ColorPicker from '../ui/ColorPicker';
import StickyNoteCard from '../ui/StickyNoteCard';
import { useAppLifecycle } from './PlaceholderWrapper';

function notify(client, type, message) {
  return client.interface.trigger('showNotify', {
    type: type,
    title: type === 'success' ? 'Sticky note' : 'Sticky note error',
    message: message
  });
}

export default function TicketSidebarApp() {
  const { client, isInitialized } = useAppLifecycle();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [displayId, setDisplayId] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState(DEFAULT_NOTE_COLOR);

  const loadNote = useCallback(async function () {
    if (!client) {
      return;
    }

    setLoading(true);

    try {
      const ticketData = await client.data.get('ticket');
      const currentTicketId = String(ticketData.ticket.id);
      const ticketNotes = getNotesEntity(client);
      const existing = await fetchNoteForTicket(ticketNotes, currentTicketId);

      setTicketId(currentTicketId);
      setDisplayId(existing ? existing.display_id : null);
      setNoteContent(existing && existing.data ? existing.data.note_content || '' : '');
      setNoteColor(
        existing && existing.data ? existing.data.note_color || DEFAULT_NOTE_COLOR : DEFAULT_NOTE_COLOR
      );

      try {
        client.instance.resize({ height: '520px' });
      } catch (resizeError) {
        console.warn(resizeError);
      }
    } catch (error) {
      console.error('Failed to load sticky note', error);
      await notify(client, 'danger', 'Could not load the note for this ticket.');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(function () {
    if (isInitialized && client) {
      loadNote();
    }
  }, [isInitialized, client, loadNote]);

  async function handleSave() {
    if (!client || !ticketId) {
      return;
    }

    const trimmed = noteContent.trim();

    if (!trimmed) {
      await notify(client, 'danger', 'Write something before saving the note.');
      return;
    }

    setSaving(true);
    const isUpdate = Boolean(displayId);

    try {
      const ticketNotes = getNotesEntity(client);
      const savedId = await saveNote(ticketNotes, {
        displayId: displayId,
        ticketId: ticketId,
        noteContent: trimmed,
        noteColor: noteColor
      });

      setDisplayId(savedId);
      await notify(
        client,
        'success',
        isUpdate ? 'Sticky note updated.' : 'Sticky note pinned to this ticket!'
      );
    } catch (error) {
      console.error('Failed to save sticky note', error);
      await notify(client, 'danger', 'Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="sn-sidebar sn-sidebar--loading">
        <FwSpinner size="small" />
        <span>Loading note…</span>
      </div>
    );
  }

  return (
    <div className="sn-sidebar">
      <header className="sn-sidebar__header">
        <h4 className="sn-sidebar__title">Sticky Note</h4>
        <span className="sn-sidebar__ticket">Ticket #{ticketId}</span>
      </header>

      <StickyNoteCard
        compact
        noteContent={noteContent || 'Your note preview appears here…'}
        ticketId={ticketId}
        colorId={noteColor}
        rotation={-1.5}
      />

      <ColorPicker selectedColorId={noteColor} onChange={setNoteColor} compact />

      <FwTextarea
        label="Internal reminder"
        placeholder="Jot down shift handoff context, follow-ups, or heads-up notes…"
        rows={6}
        value={noteContent}
        onFwInput={function (event) {
          setNoteContent(event.detail.value);
        }}
      />

      <FwButton color="primary" expand onFwClick={handleSave} loading={saving}>
        {saving ? 'Saving…' : displayId ? 'Update note 📌' : 'Pin it! 📌'}
      </FwButton>
    </div>
  );
}
