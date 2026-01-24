(function () {
  const appState = {
    client: null,
    ticketNotes: null,
    currentRecordId: null
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    try {
      appState.client = await app.initialized();
      const entity = appState.client.db.entity({ version: "v1" });
      appState.ticketNotes = entity.get("ticket_notes");

      appState.client.events.on('app.activated', loadExistingNote);
      document.getElementById('stickButton').addEventListener('click', saveNote);
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  async function loadExistingNote() {
    try {
      const ticketData = await appState.client.data.get('ticket');
      const ticketId = String(ticketData.ticket.id);

      const result = await appState.ticketNotes.getAll({
        query: { ticket_id: ticketId }
      });

      if (result.records && result.records.length > 0) {
        appState.currentRecordId = result.records[0].display_id;
        const noteContent = result.records[0].data.note_content;
        if (noteContent) {
          document.getElementById('remindersTextarea').value = noteContent;
        }
      }
    } catch (error) {
      console.log('No existing note found:', error);
    }
  }

  async function saveNote() {
    try {
      const ticketData = await appState.client.data.get('ticket');
      const ticketId = String(ticketData.ticket.id);
      const noteContent = document.getElementById('remindersTextarea').value;

      if (appState.currentRecordId) {
        await appState.ticketNotes.update(appState.currentRecordId, {
          ticket_id: ticketId,
          note_content: noteContent
        });
      } else {
        const result = await appState.ticketNotes.create({
          ticket_id: ticketId,
          note_content: noteContent
        });
        appState.currentRecordId = result.record.display_id;
      }

      await appState.client.interface.trigger("showNotify", {
        type: "success",
        message: "Note pinned to ticket!"
      });
    } catch (error) {
      console.error('Error saving note:', error);
      await appState.client.interface.trigger("showNotify", {
        type: "error",
        message: "Failed to save note. Please try again."
      });
    }
  }
})();
