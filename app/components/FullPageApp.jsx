import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FwButton,
  FwModal,
  FwModalContent,
  FwModalFooter,
  FwModalTitle,
  FwSpinner,
  FwTextarea
} from '@freshworks/crayons/react';
import ColorPicker from './ui/ColorPicker';
import StickyNoteCard from './ui/StickyNoteCard';
import { DEFAULT_NOTE_COLOR } from './lib/noteColors';
import { isSampleNote, notesForFullPageBoard } from './lib/sampleNotes';
import {
  deleteNote,
  fetchAllNotes,
  formatNoteDate,
  getNotesEntity,
  saveNote
} from './lib/notesService';

function rotationForIndex(index) {
  const rotations = [-2.5, 1.5, -1, 2, -1.8, 0.8];
  return rotations[index % rotations.length];
}

function applySampleState(records, hiddenSampleIds, sampleEdits) {
  return records
    .filter(function (record) {
      return !isSampleNote(record) || !hiddenSampleIds.includes(record.display_id);
    })
    .map(function (record) {
      if (!isSampleNote(record) || !sampleEdits[record.display_id]) {
        return record;
      }

      return {
        ...record,
        data: {
          ...record.data,
          ...sampleEdits[record.display_id]
        }
      };
    });
}

export default function FullPageApp({ client }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hiddenSampleIds, setHiddenSampleIds] = useState([]);
  const [sampleEdits, setSampleEdits] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editColor, setEditColor] = useState(DEFAULT_NOTE_COLOR);
  const [saving, setSaving] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const loadNotes = useCallback(async function () {
    setLoading(true);
    setError('');

    try {
      const ticketNotes = getNotesEntity(client);
      const allRecords = await fetchAllNotes(ticketNotes);
      setRecords(allRecords);
    } catch (loadError) {
      console.error('Failed to load notes', loadError);
      setError('Failed to load sticky notes.');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(function () {
    loadNotes();
  }, [loadNotes]);

  const displayRecords = useMemo(function () {
    return applySampleState(
      notesForFullPageBoard(records),
      hiddenSampleIds,
      sampleEdits
    );
  }, [records, hiddenSampleIds, sampleEdits]);

  const hasSavedNotes = records.length > 0;

  function openEditModal(record) {
    setSelectedRecord(record);
    setEditContent(record.data.note_content || '');
    setEditColor(record.data.note_color || DEFAULT_NOTE_COLOR);
    setEditModalOpen(true);
  }

  function openDeleteModal(record) {
    setSelectedRecord(record);
    setDeleteModalOpen(true);
  }

  async function handleEditSave() {

    if (!selectedRecord) {
      return;
    }

    if (isSampleNote(selectedRecord)) {
      setSampleEdits(function (prev) {
        return {
          ...prev,
          [selectedRecord.display_id]: {
            note_content: editContent,
            note_color: editColor
          }
        };
      });
      setEditModalOpen(false);
      setSelectedRecord(null);
      return;
    }

    setSaving(true);

    try {
      const ticketNotes = getNotesEntity(client);
      await saveNote(ticketNotes, {
        displayId: selectedRecord.display_id,
        ticketId: selectedRecord.data.ticket_id,
        noteContent: editContent,
        noteColor: editColor
      });

      setRecords(function (prev) {
        return prev.map(function (record) {
          if (record.display_id !== selectedRecord.display_id) {
            return record;
          }

          return {
            ...record,
            data: {
              ...record.data,
              note_content: editContent,
              note_color: editColor
            }
          };
        });
      });

      setEditModalOpen(false);
      setSelectedRecord(null);
    } catch (editError) {
      console.error('Failed to update note', editError);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {

    if (!selectedRecord) {
      return;
    }

    if (isSampleNote(selectedRecord)) {
      setHiddenSampleIds(function (prev) {
        return prev.concat(selectedRecord.display_id);
      });
      setDeleteModalOpen(false);
      setSelectedRecord(null);
      return;
    }

    const displayId = selectedRecord.display_id;

    try {
      const ticketNotes = getNotesEntity(client);
      await deleteNote(ticketNotes, displayId);
      setRecords(function (prev) {
        return prev.filter(function (record) {
          return record.display_id !== displayId;
        });
      });
      setDeleteModalOpen(false);
      setSelectedRecord(null);
    } catch (deleteError) {
      console.error('Failed to delete note', deleteError);
    }
  }

  const editingSample = selectedRecord ? isSampleNote(selectedRecord) : false;

  return (
    <div className="sn-board">
      <header className="sn-board__header">
        <div>
          <h1>Agent Huddle</h1>
          <p>
            {hasSavedNotes
              ? 'Your pinned notes plus sample previews from the huddle board'
              : 'Sample sticky notes — pin your own from any ticket sidebar'}
          </p>
        </div>
        <FwButton color="secondary" onFwClick={loadNotes} disabled={loading}>
          Refresh
        </FwButton>
      </header>

      {loading ? (
        <div className="sn-board__state">
          <FwSpinner size="large" />
          <p>Loading notes…</p>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="sn-board__state sn-board__state--error">
          <p>{error}</p>
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="sn-board__grid">
          {displayRecords.map(function (record, index) {
            const sample = isSampleNote(record);

            return (
              <StickyNoteCard
                key={record.display_id}
                noteContent={record.data.note_content}
                ticketId={record.data.ticket_id}
                colorId={record.data.note_color}
                createdAt={formatNoteDate(record.created_time)}
                rotation={rotationForIndex(index)}
                isSample={sample}
                onEdit={function () {
                  openEditModal(record);
                }}
                onDelete={function () {
                  openDeleteModal(record);
                }}
              />
            );
          })}
        </div>
      ) : null}

      <FwModal
        isOpen={editModalOpen}
        onFwClose={function () {
          setEditModalOpen(false);
        }}
      >
        <FwModalTitle>{editingSample ? 'Edit sample note' : 'Edit sticky note'}</FwModalTitle>
        <FwModalContent>
          <ColorPicker selectedColorId={editColor} onChange={setEditColor} />
          <FwTextarea
            label="Note content"
            rows={6}
            value={editContent}
            onFwInput={function (event) {
              setEditContent(event.detail.value);
            }}
          />
          {saving ? <FwSpinner size="small" /> : null}
        </FwModalContent>
        <FwModalFooter>
          <FwButton color="secondary" onFwClick={function () { setEditModalOpen(false); }}>
            Cancel
          </FwButton>
          <FwButton color="primary" onFwClick={handleEditSave} loading={saving}>
            Save
          </FwButton>
        </FwModalFooter>
      </FwModal>

      <FwModal
        isOpen={deleteModalOpen}
        onFwClose={function () {
          setDeleteModalOpen(false);
        }}
      >
        <FwModalTitle>Remove sticky note</FwModalTitle>
        <FwModalContent>
          <p>
            {selectedRecord && isSampleNote(selectedRecord)
              ? 'Remove this sample note from the board?'
              : 'Delete this note from ticket #' + (selectedRecord ? selectedRecord.data.ticket_id : '') + '?'}
          </p>
        </FwModalContent>
        <FwModalFooter>
          <FwButton color="secondary" onFwClick={function () { setDeleteModalOpen(false); }}>
            Cancel
          </FwButton>
          <FwButton color="danger" onFwClick={handleDeleteConfirm}>
            Delete
          </FwButton>
        </FwModalFooter>
      </FwModal>
    </div>
  );
}
