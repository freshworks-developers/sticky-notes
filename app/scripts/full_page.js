(function () {
  const appState = {
    client: null,
    ticketNotes: null,
    records: [],
    selectedRecord: null
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    try {
      appState.client = await app.initialized();
      const entity = appState.client.db.entity({ version: "v1" });
      appState.ticketNotes = entity.get("ticket_notes");

      document.getElementById('edit-modal').addEventListener('fwSubmit', saveEditedNote);
      document.getElementById('delete-modal').addEventListener('fwSubmit', confirmDelete);

      appState.client.events.on('app.activated', loadAllNotes);
    } catch (error) {
      console.error('Error initializing app:', error);
      showError('Failed to initialize app');
    }
  }

  function showToast(message) {
    const toast = document.getElementById('custom-toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  async function fetchAllRecords() {
    let result = await appState.ticketNotes.getAll();
    let allRecords = result.records || [];

    while (result.links?.next?.marker) {
      result = await appState.ticketNotes.getAll({
        next: { marker: result.links.next.marker }
      });
      allRecords = allRecords.concat(result.records || []);
    }

    return allRecords;
  }

  async function loadAllNotes(showLoadingState) {
    try {
      if (showLoadingState !== false) {
        showLoading(true);
      }
      
      appState.records = await fetchAllRecords();

      if (appState.records.length === 0) {
        showEmptyState();
        return;
      }

      displayTable(appState.records);
    } catch (error) {
      console.error('Error loading notes:', error);
      showError('Failed to load notes');
    }
  }

  function createTableRow(record, index) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.data.ticket_id || 'N/A'}</td>
      <td class="note-cell">${truncateText(record.data.note_content || '', 100)}</td>
      <td>${formatDate(record.created_time)}</td>
      <td class="actions-cell"></td>
    `;

    const actionsCell = row.querySelector('.actions-cell');
    
    const editBtn = document.createElement('fw-button');
    editBtn.size = 'small';
    editBtn.color = 'secondary';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => openEditModal(index);
    
    const deleteBtn = document.createElement('fw-button');
    deleteBtn.size = 'small';
    deleteBtn.color = 'danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => openDeleteModal(index);

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
    return row;
  }

  function displayTable(records) {
    showLoading(false);
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';

    records.forEach((record, index) => {
      const row = createTableRow(record, index);
      tableBody.appendChild(row);
    });

    document.getElementById('table-container').style.display = 'block';
  }

  function openEditModal(index) {
    appState.selectedRecord = appState.records[index];
    document.getElementById('edit-textarea').value = appState.selectedRecord.data.note_content || '';
    document.getElementById('edit-modal').open();
  }

  function openDeleteModal(index) {
    appState.selectedRecord = appState.records[index];
    document.getElementById('delete-modal').open();
  }

  async function saveEditedNote(event) {
    if (event) event.stopPropagation();
    
    const record = appState.selectedRecord;
    if (!record) return;

    const newContent = document.getElementById('edit-textarea').value;
    const displayId = record.display_id;
    const ticketId = record.data.ticket_id;

    appState.selectedRecord = null;
    document.getElementById('edit-modal').close();

    try {
      await appState.ticketNotes.update(displayId, {
        ticket_id: ticketId,
        note_content: newContent
      });
    } catch (error) {
      console.error('Error updating note:', error);
    }

    const idx = appState.records.findIndex(r => r.display_id === displayId);
    if (idx !== -1) {
      appState.records[idx].data.note_content = newContent;
    }
    
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    appState.records.forEach((rec, index) => {
      tableBody.appendChild(createTableRow(rec, index));
    });
    
    showToast('Note updated!');
  }

  async function confirmDelete(event) {
    if (event) event.stopPropagation();
    
    const record = appState.selectedRecord;
    if (!record) return;

    const displayId = record.display_id;
    appState.selectedRecord = null;
    document.getElementById('delete-modal').close();

    try {
      await appState.ticketNotes.delete(displayId);
    } catch (error) {
      console.error('Error deleting note:', error);
    }

    appState.records = appState.records.filter(r => r.display_id !== displayId);
    
    if (appState.records.length === 0) {
      showEmptyState();
    } else {
      const tableBody = document.getElementById('table-body');
      tableBody.innerHTML = '';
      appState.records.forEach((rec, index) => {
        tableBody.appendChild(createTableRow(rec, index));
      });
    }
    
    showToast('Note deleted!');
  }

  function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  function formatDate(isoDate) {
    if (!isoDate) return 'N/A';
    try {
      return new Date(isoDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return isoDate;
    }
  }

  function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
    document.getElementById('table-container').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
  }

  function showEmptyState() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('table-container').style.display = 'none';
    document.getElementById('empty-state').style.display = 'flex';
  }

  function showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('empty-state').innerHTML = `<h3>⚠️ Error</h3><p>${message}</p>`;
    document.getElementById('empty-state').style.display = 'flex';
  }
})();
