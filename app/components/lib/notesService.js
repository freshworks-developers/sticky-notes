export function getNotesEntity(client) {
  const entity = client.db.entity({ version: 'v1' });
  return entity.get('ticket_notes');
}

export async function fetchAllNotes(ticketNotes) {
  let result = await ticketNotes.getAll();
  let allRecords = result.records || [];

  while (result.links && result.links.next && result.links.next.marker) {
    result = await ticketNotes.getAll({
      next: { marker: result.links.next.marker }
    });
    allRecords = allRecords.concat(result.records || []);
  }

  return allRecords;
}

export async function fetchNotesForTicket(ticketNotes, ticketId) {
  const result = await ticketNotes.getAll({
    query: { ticket_id: String(ticketId) }
  });

  return result.records || [];
}

export async function fetchNoteForTicket(ticketNotes, ticketId) {
  const records = await fetchNotesForTicket(ticketNotes, ticketId);

  if (records.length === 0) {
    return null;
  }

  return records[0];
}

export async function saveNote(ticketNotes, payload) {
  const data = {
    ticket_id: String(payload.ticketId),
    note_content: payload.noteContent || '',
    note_color: payload.noteColor || 'yellow'
  };

  if (payload.displayId) {
    await ticketNotes.update(payload.displayId, data);
    return payload.displayId;
  }

  const result = await ticketNotes.create(data);
  return result.record.display_id;
}

export async function deleteNote(ticketNotes, displayId) {
  await ticketNotes.delete(displayId);
}

export function formatNoteDate(isoDate) {
  if (!isoDate) {
    return '';
  }

  try {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return isoDate;
  }
}
