Use Cases - Agent Huddle / Northwind Support Co.
================================================

Company Overview
----------------

**Northwind Support Co.** is a mid-market B2B company utilizing **Freshdesk** to manage high-volume customer tickets where agents need lightweight, ticket-scoped context that is visible to the team without cluttering the formal private-note thread.

* * * * *

Use Case Scenarios
------------------

### 1\. Shift Handoff Context on Tickets

**Scenario**: During twice-daily shift changes, outgoing agents must leave quick reminders on open tickets — callback windows, promised follow-ups, or escalation flags — without writing lengthy private notes that bury critical history.

**Use Case**: The ticket sidebar lets agents pin a colored sticky note to the current ticket via Entity Storage. The next shift opens the same ticket and sees the saved note immediately, loaded by `ticket_id` without scanning the conversation thread.

* * * * *

### 2\. VIP and Escalation Flagging

**Scenario**: Northwind handles a portfolio of strategic accounts where supervisors require visible, at-a-glance markers on tickets assigned to junior agents during peak hours.

**Use Case**: Agents choose a high-visibility color (for example orange or pink), pin a short sticky note such as "VIP — exec callback by 3 PM," and save. The note persists on the ticket and surfaces in the sidebar every time the ticket is reopened.

* * * * *

### 3\. Supervisor Huddle Board Review

**Scenario**: Team leads need a consolidated view of pinned context across tickets before stand-up, rather than opening each ticket individually in the queue.

**Use Case**: The full-page **Agent Huddle** board fetches all records from the `ticket_notes` entity and displays them in a grid. Supervisors edit or delete notes with icon actions and use sample cards on first run to understand the layout before agents populate real data.

* * * * *

### 4\. Cross-Ticket Context Without Formal Notes

**Scenario**: Agents often need informal, non-audit reminders — internal jargon, temporary workarounds, or "waiting on billing" flags — that should not appear in customer-visible or compliance-scoped private notes.

**Use Case**: Sticky Notes stores content in a dedicated Entity Storage schema (`note_content`, `note_color`) separate from Freshdesk's native note stream. Agents get post-it style reminders scoped to the ticket without polluting the official record.

* * * * *

### 5\. Team Onboarding and Demo-Ready Full-Page Surface

**Scenario**: When onboarding new hires, Northwind's enablement team needs a populated UI on day one so agents can practice pin, edit, and delete flows before touching production tickets.

**Use Case**: The full-page board merges six sample sticky notes (tagged **Sample**) with saved records so the huddle always looks alive during training. New agents practice color selection in the sidebar and board management on the full-page app without seeding production data.
