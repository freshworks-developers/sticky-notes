export const SAMPLE_NOTES = [
  {
    display_id: 'sample-1',
    isSample: true,
    created_time: '2026-06-14T09:30:00.000Z',
    data: {
      ticket_id: '101',
      note_content: 'Customer prefers email updates only — avoid phone unless P1.',
      note_color: 'yellow'
    }
  },
  {
    display_id: 'sample-2',
    isSample: true,
    created_time: '2026-06-15T11:15:00.000Z',
    data: {
      ticket_id: '248',
      note_content: 'Shift handoff: waiting on billing team to confirm credit memo.',
      note_color: 'pink'
    }
  },
  {
    display_id: 'sample-3',
    isSample: true,
    created_time: '2026-06-15T14:00:00.000Z',
    data: {
      ticket_id: '512',
      note_content: 'VIP account — loop in CSM before closing as resolved.',
      note_color: 'green'
    }
  },
  {
    display_id: 'sample-4',
    isSample: true,
    created_time: '2026-06-16T08:45:00.000Z',
    data: {
      ticket_id: '903',
      note_content: 'Repro steps confirmed on Safari 17. Escalation doc attached.',
      note_color: 'blue'
    }
  },
  {
    display_id: 'sample-5',
    isSample: true,
    created_time: '2026-06-16T16:20:00.000Z',
    data: {
      ticket_id: '1204',
      note_content: 'Follow up Friday — customer OOO until Thursday.',
      note_color: 'orange'
    }
  },
  {
    display_id: 'sample-6',
    isSample: true,
    created_time: '2026-06-17T07:00:00.000Z',
    data: {
      ticket_id: '35',
      note_content: 'Agent huddle note: share workaround in #support-tips after fix ships.',
      note_color: 'yellow'
    }
  }
];

export function isSampleNote(record) {
  return Boolean(record && record.isSample);
}

export function notesForFullPageBoard(records) {
  const saved = records || [];
  return saved.concat(SAMPLE_NOTES);
}
