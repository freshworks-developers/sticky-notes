import { describe, expect, test, vi } from 'vitest';
import { DEFAULT_NOTE_COLOR, getColorById, NOTE_COLORS } from '../app/components/lib/noteColors.js';
import {
  fetchNoteForTicket,
  fetchNotesForTicket,
  formatNoteDate,
  saveNote
} from '../app/components/lib/notesService.js';
import { notesForFullPageBoard, SAMPLE_NOTES } from '../app/components/lib/sampleNotes.js';

describe('noteColors', function () {
  test('exposes five sticky note colors', function () {
    expect(NOTE_COLORS).toHaveLength(5);
  });

  test('returns default color for unknown ids', function () {
    expect(getColorById('unknown').id).toBe(DEFAULT_NOTE_COLOR);
  });
});

describe('notesService', function () {
  test('fetchNotesForTicket returns all matching records', async function () {
    const ticketNotes = {
      getAll: vi.fn().mockResolvedValue({
        records: [
          { display_id: '1', data: { ticket_id: '42', note_content: 'First' } },
          { display_id: '2', data: { ticket_id: '42', note_content: 'Second' } }
        ]
      })
    };

    const records = await fetchNotesForTicket(ticketNotes, '42');
    expect(records).toHaveLength(2);
  });

  test('fetchNoteForTicket returns first matching record', async function () {
    const ticketNotes = {
      getAll: vi.fn().mockResolvedValue({
        records: [{ display_id: '1', data: { ticket_id: '42', note_content: 'Hello' } }]
      })
    };

    const record = await fetchNoteForTicket(ticketNotes, '42');
    expect(record.data.note_content).toBe('Hello');
  });

  test('saveNote creates a new record when no display id is provided', async function () {
    const ticketNotes = {
      create: vi.fn().mockResolvedValue({ record: { display_id: 'abc123' } })
    };

    const displayId = await saveNote(ticketNotes, {
      ticketId: '7',
      noteContent: 'Shift handoff',
      noteColor: 'pink'
    });

    expect(displayId).toBe('abc123');
    expect(ticketNotes.create).toHaveBeenCalledWith({
      ticket_id: '7',
      note_content: 'Shift handoff',
      note_color: 'pink'
    });
  });

  test('formatNoteDate returns readable text', function () {
    expect(formatNoteDate('2026-06-17T00:00:00.000Z')).toMatch(/Jun/);
  });
});

describe('sampleNotes', function () {
  test('exposes six sample notes for the full-page board', function () {
    expect(SAMPLE_NOTES).toHaveLength(6);
  });

  test('always includes sample notes on the full-page board', function () {
    expect(notesForFullPageBoard([])).toEqual(SAMPLE_NOTES);
    expect(notesForFullPageBoard([{ display_id: 'real-1', data: { ticket_id: '35' } }])).toHaveLength(
      SAMPLE_NOTES.length + 1
    );
  });
});
