# ZipJob notification plan

Status: proposed plan. This document defines the notification points and delivery approach before implementation.

## Goal

Notify the right account when a meaningful hiring event happens without creating duplicate, noisy, or unreliable alerts.

The first implementation should use **in-app notifications plus Socket.IO live delivery**. Browser push and email should be opt-in follow-up channels, not the only way a user learns about an event.

## Current project touchpoints

| Event | Existing code path | Current result | Notification recipient |
| --- | --- | --- | --- |
| Jobseeker applies for a job | `POST /applications/apply/:id` → `backend/controllers/application.controllers.js#applyJob` | Application is stored and appended to the job | The company user who posted the job |
| Company changes an application status | `POST /applications/status/:id/applicants` → `updateStatus` | Status is saved as `pending`, `accepted`, or `rejected` | The jobseeker who applied |
| Company and jobseeker send a chat message | `POST /conversations/:id/messages` | Message and unread state are stored; Socket.IO refreshes chats | The other conversation participant |
| Company schedules an interview | No interview API/model exists yet | Not implemented | The selected jobseeker |
| Interview is updated, cancelled, or reminded | No interview API/model exists yet | Not implemented | The company and selected jobseeker |

The current message system already has unread counts, sidebar badges, real-time Socket.IO events, and active-chat updates. It does **not** currently create durable general notifications, toasts for new events, browser push notifications, or email alerts.

## Recommended events for release one

### Company notifications

1. **New application received**
   - Trigger: a jobseeker successfully applies.
   - Recipient: `Job.postedBy` only.
   - CTA: Open the job's applicant list.
   - Example: “Asha Sharma applied for Frontend Developer.”

2. **New message from candidate**
   - Trigger: a jobseeker sends a committed chat message.
   - Recipient: the posting company account.
   - CTA: Open that conversation.

### Jobseeker notifications

1. **Application status changed**
   - Trigger: company changes `pending` to `accepted` or `rejected`.
   - Recipient: the application applicant only.
   - CTA: Open My applications.
   - Use neutral wording for rejected applications: “Your application for Frontend Developer has been updated.”

2. **New message from company**
   - Trigger: a company sends a committed chat message.
   - Recipient: the jobseeker participant.
   - CTA: Open that conversation.

3. **Interview invitation, update, cancellation, and reminder**
   - Trigger: the future interview workflow creates/updates/cancels an interview, plus a scheduled reminder.
   - Recipient: the relevant jobseeker; send a confirmation to the company for scheduling changes.
   - CTAs: View interview, add calendar event, open related conversation.

## Product rules

- Create the durable notification **only after** the database action commits successfully.
- Derive recipients on the server from Application, Job, Conversation, and Interview records. Never trust a client-supplied recipient ID.
- Do not notify the actor about their own action.
- Deduplicate retries with a stable event key, for example `application-created:<applicationId>`.
- Keep notification content concise and avoid putting sensitive candidate details in browser-push previews.
- A notification being delivered does not mean it was read. Track `readAt` separately.
- If an account is suspended or deleted, do not deliver new notifications to it; preserve audit/history rules separately.
- Admins should receive platform/admin events only. They must not receive private hiring or chat notifications by default.

## Data model

Create `backend/models/notification.model.js`.

| Field | Purpose |
| --- | --- |
| `recipient` | Required User ID that owns the notification |
| `actor` | Optional User ID that caused it |
| `type` | Controlled event type, such as `application_received`, `application_status_changed`, `message_received`, `interview_scheduled` |
| `title`, `body` | Server-generated display copy |
| `link` | Internal safe route for the CTA |
| `resourceType`, `resourceId` | Application, conversation, interview, or job reference |
| `eventKey` | Unique idempotency/deduplication key |
| `readAt` | `null` until the recipient reads it |
| `createdAt`, `updatedAt` | Timestamps |

Recommended indexes:

- Unique `eventKey`.
- `{ recipient: 1, readAt: 1, createdAt: -1 }` for unread counts and inbox views.
- `{ recipient: 1, createdAt: -1 }` for paginated history.

## Backend flow

```mermaid
sequenceDiagram
    participant Actor as Company or Jobseeker
    participant API as Express controller/service
    participant DB as MongoDB
    participant Socket as Socket.IO
    participant Recipient as Recipient browser

    Actor->>API: Perform action (apply, status change, message, interview)
    API->>DB: Validate and commit business action
    API->>DB: Create notification with unique eventKey
    DB-->>API: Commit succeeds
    API->>Socket: Emit notification:created to recipient user room
    Socket-->>Recipient: Add toast, unread badge, and notification list item
    Recipient->>API: Mark notification read
```

Implement a small `notification.service.js` so controllers call one shared function rather than embedding notification logic in every controller.

Suggested service shape:

```js
createNotification({ recipientId, actorId, type, title, body, link, resourceType, resourceId, eventKey })
```

It should return the existing notification when an `eventKey` duplicate occurs, making API retries safe.

## REST and real-time contract

Mount an authenticated `/notifications` router.

| Endpoint | Purpose |
| --- | --- |
| `GET /notifications?cursor=&limit=20&unreadOnly=` | Paginated recipient-only notification inbox |
| `GET /notifications/unread` | Navigation badge total |
| `PATCH /notifications/:id/read` | Mark one owned notification read |
| `PATCH /notifications/read-all` | Mark all owned notifications read |

Socket events:

| Event | Direction | Payload |
| --- | --- | --- |
| `notification:created` | Server → recipient `user:<id>` room | Canonical saved notification |
| `notification:read` | Server → recipient `user:<id>` room | Notification ID and `readAt` |

The existing Socket.IO user-room pattern in `backend/socket/index.js` can be reused. Broadcast only after persistence succeeds.

## Frontend experience

1. Add a bell icon with unread badge to the company and jobseeker workspace headers.
2. Add a notification drawer/list with date grouping, read state, and a clear CTA.
3. On `notification:created`, update the in-memory RTK Query cache and show one accessible toast if the event is from another user.
4. Clicking a notification marks it read and navigates to its server-provided internal route.
5. Provide loading skeleton, empty state, retry state, and keyboard-accessible controls.
6. Keep chat unread badges independent of the new general notification badge; a message can create both a chat unread count and a general notification only if product testing shows it is useful. For release one, prefer chat unread + toast and avoid a durable duplicate `message_received` record.

## Interview prerequisites

Before implementing interview notifications, build an Interview model and authorized company endpoints.

Minimum Interview fields:

- `applicationId`, `jobId`, `companyUserId`, `jobseekerUserId`
- `startsAt`, `endsAt`, `timezone`, `mode` (video, phone, in-person)
- `locationOrMeetingUrl`, `note`, `status` (scheduled, rescheduled, cancelled, completed)
- timestamps and an audit trail for updates/cancellations

Then notify on schedule, reschedule, cancellation, and scheduled reminders. Validate that the application belongs to the posting company and that the candidate is the application applicant.

## Browser push and email: later phases

### Browser push

Use only after in-app notifications work well.

- Requires HTTPS, a service worker, VAPID keys, user permission, and a stored push subscription per device.
- Let users opt in/out by category: messages, application updates, interviews.
- Do not ask for permission on first page load; ask after explaining the value, for example after the user opens Notifications.
- Send push from a background worker/queue, not directly inside the request controller.

### Email fallback

- Send interview invitations/changes immediately.
- For ordinary messages and applications, batch or delay email until notifications remain unread for a chosen interval.
- Include a secure internal link, not sensitive application content.
- Respect notification preferences and unsubscribe requirements.

## Cache and infrastructure decision

**No Redis is required for the first single-server release.** MongoDB is the durable notification source; RTK Query is the browser cache; Socket.IO provides live delivery.

Add Redis and a queue when the app runs across multiple backend instances, needs reliable delayed interview reminders/email delivery, or has enough notification volume that in-process timers/rate limits are no longer safe. At that point use:

- Redis + Socket.IO adapter for cross-instance events.
- A durable job queue for push/email/reminders.
- Retry, backoff, and observability for external delivery failures.

## Implementation order

1. Add Notification model, service, indexes, authorization, REST endpoints, and tests.
2. Emit `application_received` after a successful application commit.
3. Emit `application_status_changed` after a company status change.
4. Build the frontend bell, unread badge, drawer, toast, and Socket.IO cache updates.
5. Add notification preferences.
6. Build interviews and interview notifications.
7. Add email and browser push through a background queue.

## Acceptance checks

- Applying once creates exactly one company notification, even if the client retries.
- Changing status creates one jobseeker notification and never leaks data to another user.
- Both active tabs of the recipient receive the live event; a reconnect fetches missed notifications.
- Read/unread totals stay correct after concurrent actions.
- The app works without push permission.
- Unauthorized users cannot list, read, or mark another user's notifications.
