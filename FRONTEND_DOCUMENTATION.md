# Frontend Documentation (`medteam-flow-develop/src`)

## Targeted objective (what the frontend is building)
The frontend is a React + TypeScript app that provides a role-based “medical management” dashboard with:
- Login + role detection (`admin`, `doctor`, `nurse`)
- Patient management (doctor-focused patient lists and patient details)
- Appointment management (create/update/cancel + status changes)
- Consultation recording (symptoms/diagnosis/notes/prescriptions + optional uploads)
- Task management (CRUD + assignees + status)
- Support + Settings pages (some are placeholders/stubs)
- A notification system:
  - Real-time-ish delivery is done with `BroadcastChannel` (cross-tab)
  - Persistence is done via the backend `/notifications` endpoints

Because you’re coming back after a long time: the key architectural idea is that the UI is driven by:
1. Route-level composition (`App.tsx` + `ProtectedRoute`)
2. Global state (Redux slices in `src/store/slices`)
3. Cross-cutting contexts:
   - `AuthContext` for user/role info
   - `NotifSocketContext` for notification sending/marking
4. Layout (`components/sharedComponents/Layout.tsx`) which wires role-based navigation + notification bell behavior.

## App entry points
### `src/main.tsx`
This is the React bootstrap:
- Wraps the whole application with:
  - Redux `<Provider store={store}>`
  - `<AuthProvider>` (for login state)
  - `<NotificationProvider>` (for notification sending/marking)
- Renders `<App />` inside React `StrictMode`.

### `src/App.tsx`
Defines all routes using `react-router-dom`:
- Public route:
  - `/` -> `LoginFormPage`
- Protected routes wrapper:
  - `<Route element={<ProtectedRoute><Outlet/></ProtectedRoute>}> ...`
  - Any route nested under this wrapper requires `isAuthenticated`.
- Routes (main ones):
  - Admin:
    - `/admin/user-management` -> `AdminUserManagement`
    - `/task-management` -> `AdminTaskManagement`
    - `/settings` -> `AdminSettings` (stub UI)
    - `/support` -> `AdminSupport` (stub UI)
  - Doctor/Nurse:
    - `/doc/dashboard` -> `DocDashboard`
    - `/patients` -> `DocPatientManage`
    - `/patients/:patientId` -> `PatientDetails`
    - `/Appointment` -> `Appointment` (appointment management)
    - `/consultations-records` -> `ConsultationList`
    - `/consultation/view/:consultationId` -> `Consultation` (read-only mode for a record)

Important detail:
- `ProtectedRoute` in this codebase enforces authentication but does not enforce role-based route-level guards.
- Role-based navigation is handled visually by `Layout` using `rolePages` and `user.roleName`.

## Authentication
### `src/context/AuthContext.tsx`
Purpose: store the currently logged-in user + derived flags.

How it works:
- `user` state is initialized from `localStorage.getItem('authUser')`.
- `login(email, password)`:
  - Calls `getUserWithRole(email)` from `src/utils.ts`.
  - Checks password by direct string comparison (`foundUser.password === password`).
  - If valid, updates `user` and stores it in `localStorage`.
- `logout()` clears the `user` state and removes `authUser` from `localStorage`.
- Role helpers:
  - `isAdmin` if `roleName === 'admin'`
  - `isDoctor` if `roleName === 'doctor'`
  - `isNurse` if `roleName === 'nurse'`

Consumption:
- Pages call `useAuth()` for `user` and `isAuthenticated`.

## Notification system
### Providers and state
#### `src/context/NotifSocketContext.tsx`
This file acts as the notification provider/context.

It defines a `Notification` interface (frontend-specific) with fields used for deep-link routing:
- `type` union includes: `'appointment' | 'consultation' | 'task' | 'user' | 'followup' | 'general'`
- `toUserId`, `fromUserId`, `isRead`, `createdAt`, and optional contextual IDs like `appointmentId`, `patientId`, etc.
- `priority` union: `'low' | 'medium' | 'high'`

`NotificationProvider` responsibilities:
1. Access Redux notification state:
   - `state.notifications.notifications`
2. Provide methods:
   - `sendNotification(notificationWithoutIdAndReadAndCreatedAt)`
   - `markAsRead(notificationId)`
   - `markAllAsRead()`
   - `getUnreadCount()`
3. “Real-time” / cross-tab:
   - Uses `BroadcastChannel` created by `createNotificationChannel()`
   - `sendNotification` posts to the channel via `channel.postMessage(notification)`
4. Persistence:
   - `sendNotification` also POSTs to backend: `http://localhost:8000/notifications`
   - `markAsRead` PATCHes backend `.../notifications/<id>` with `{ isRead: true }`

WebSocket note:
- There is a `ws` ref and code that attempts to `ws.current.send(...)` if `ws.current.readyState === WebSocket.OPEN`.
- In this file, the `WebSocket` instance is not clearly initialized; in practice, delivery is primarily via `BroadcastChannel` + backend persistence.

#### `src/store/slices/NotificationSlice.ts`
Redux reducer for notifications:
- `addNotification`: `unshift` new notifications so the newest appear first
- `markNotificationAsRead`: finds by id and sets `isRead = true`
- `markAllNotificationsAsRead`: marks all as read
- `removeNotification`, `setNotifications`, `setLoading`, `setError`, `clearNotifications`

### Notification UI: `components/sharedComponents/Layout.tsx`
This file implements the notification bell and dropdown in the global layout.

Key behavior:
- It maintains its own local `notifications` state (separate from Redux notifications slice).
- It listens to `BroadcastChannel` messages:
  - `channel.onmessage = (event) => setNotifications([event.data, ...prev])`
- When clicking the bell icon:
  - fetches fresh notifications from backend with:
    - `GET /notifications?toUserId=<user.id>`
- Unread count:
  - computed from local state: `notifications.filter(!isRead).length`
- Marking read:
  - `markNotificationAsRead(notificationId)` PATCHes backend `/notifications/<id>` and updates local state
  - “Mark all as read” loops through unread notifications and PATCHes each one.
- Deep links:
  - `getNotificationPath(notif)` maps notification type + contextual IDs to routes:
    - `appointment` -> `/Appointment?showModal=appointment&appointmentId=...`
    - `consultation` -> `/consultation/view/<id>` or `/consultations-records`
    - `task` -> `/task-management`
    - `followup` -> `/patients/<patientId>` or `/patients`

This means the notification “visual system” is tied to Layout’s own local state rather than purely to Redux.

## API client and general frontend utilities
### `src/utils/apiClient.ts`
Defines a small wrapper around `fetch`:
- Uses `API_BASE_URL` from `src/constants/constants.ts`
- Implements a generic `request<TResponse, TBody>` that:
  - JSON-stringifies request body
  - throws a readable error if `res.ok` is false
  - handles `204` by returning `undefined`
- Exports `apiClient` with helper methods: `get/post/put/patch/delete`.

### `src/utils/NotificationService.ts`
`NotificationService` generates notification objects using templates.

Static factory functions:
- `createAppointmentNotification(toUserId, fromUserId, appointmentId, patientId, patientName, doctorName, appointmentSlot, action)`
  - action: `'created' | 'updated' | 'cancelled' | 'reminder'`
  - sets `type: 'appointment'` + `priority`
- `createConsultationNotification(toUserId, fromUserId, consultationId, patientName, action)`
  - action: `'completed' | 'started' | 'followup_required'`
  - sets type `'consultation'` or `'followup'` depending on action mapping
- `createTaskNotification(toUserId, fromUserId, taskId, taskTitle, action)`
  - action: `'assigned' | 'completed' | 'overdue' | 'updated'`
- `createUserNotification(toUserId, fromUserId, userName, action)`
  - action: `'created' | 'updated' | 'deleted' | 'role_changed'`
- `createSystemNotification(toUserId, title, message, priority?)` -> type `'general'`
- `createBulkNotification(toUserIds, fromUserId, title, message, type?, priority?)`

These factories return a notification payload compatible with `NotifSocketContext.sendNotification` (id/read/createdAt are filled in by the provider).

### `src/utils/NotificationChannel.ts`
- Defines `createNotificationChannel()`:
  - `return new BroadcastChannel('app-notifications')`

### `src/utils/DateUtils.ts`
- `formatDate(dateString)` -> formatted date/time string.
- `slotDate(appointment)`:
  - returns a boolean used by appointment status logic to determine whether a slot is “past”.
  - (The current logic treats dates carefully, but the intent is to gate actions like cancelling or starting consultation.)

### `src/utils.ts`
- `getUserWithRole(userEmail)`:
  - fetches `GET http://localhost:8000/users`
  - finds the user record by `email`
  - uses `mockServer/data/Roles.json` to map `roleId -> roleName` when missing
  - returns user with `roleName` so the frontend can use it for navigation and permissions.

## Constants
### `src/constants/constants.ts`
- `API_BASE_URL`: comes from `import.meta as any).env?.VITE_BACKEND_URL` or defaults to `http://localhost:8000`
- `ROLE_IDS`: mapping of role names to ids (as strings)
- `NOTIFICATION_ACTIONS`: strings like `'created'`, `'updated'`, `'cancelled'`, `'reminder'`
- `API_URL`: exposed but not consistently used elsewhere.

### `src/constants/apiConstants.ts`
- `ENDPOINTS`:
  - `PATIENTS: '/patients'`
  - `APPOINTMENTS: '/appointments'`
  - `NOTIFICATIONS: '/notifications'`
  - `USERS: '/users'`
  - `TASKS: '/tasks'`
  - `CONSULTATIONS: '/consultations'`

## Global state (Redux store)
### Store wiring: `src/store/Store.ts`
- Uses Redux Toolkit `configureStore`.
- Reducers registered:
  - `appointments`, `patients`, `user`, `task`, `settings`, `support`, `doctors`, `medical`, `notifications`

### Slices
#### `src/store/slices/UserSlice.ts`
State:
- `users: User[]`
- `loading`, `error`

Async thunks:
- `fetchUsers`: `GET /users` (normalizes different possible JSON shapes)
- `addUserAsync`: `POST /users`
- `updateUserAsync`: `PUT /users/<id>`
- `deleteUserAsync`: `DELETE /users/<id>`

Reducer logic:
- On successful fetch, it enriches each user with `roleName` using `mockServer/data/Roles.json`.

#### `src/store/slices/DoctorSlice.ts`
State:
- `specialties: DoctorSpecialty[]` loaded from `DoctorSpeciality.json`
- `selectedSpecialtyId`
- `loading`, `error`

Used by:
- The appointment creation form filters doctors by specialty.

#### `src/store/slices/AppointmentSlice.ts`
State:
- `appointments: Appointment[]`

Async thunks:
- `fetchAppointments`, `addAppointmentAsync`, `updateAppointmentAsync`, `deleteAppointmentAsync`

Reducers:
- simple list mutation for add/update/delete
- `fetchAppointments` replaces the entire list.

#### `src/store/slices/PatientSlice.ts`
State:
- `patients: ExtendedPatient[]`
- `loading`, `error`

Key normalization in reducers:
- The frontend normalizes `emergencyContact` shape:
  - if it’s an array, it uses the first element
- It computes `age` from `dateOfBirth`
- It sets `medicalHistory` to `[]` on fetch, and ensures allergies list defaults.

Async thunks:
- fetch/add/update/delete against backend `/patients`

#### `src/store/slices/TaskSlice.ts`
State:
- `tasks: Task[]`

Async thunks:
- `fetchTasks` (GET `/tasks`)
- `addTaskAsync` (POST `/tasks`)
- `updateTaskAsync` (PUT `/tasks/<id>`)
- `deleteTaskAsync` (DELETE `/tasks/<id>`)

Extra logic:
- On fetch fulfilled, it enriches each task with `assigneeName` by looking up the assignee in `mockServer/data/Tasks.json`.

#### `src/store/slices/SupportSlice.ts`
State:
- `tickets: SupportTicket[]` initialized from `mockServer/data/SupportTickets.json`
- `userTickets` (filtered view)
- `selectedTicket`
- `loading`, `error`

Reducers:
- `setUserTickets(userId)`: filter tickets by `userId`
- `addSupportTicket`: adds to main list + maybe to `userTickets`
- `updateSupportTicket`: updates main + selected + any present user list record
- `addTicketResponse`: appends to `responses` and updates timestamps
- `closeTicket`: sets `status='closed'`, sets resolved/updated timestamps.

#### `src/store/slices/SettingsSlice.ts`
State:
- `userSettings: UserSettings[]` initialized from `mockServer/data/Settings.json`
- `currentUserSettings: UserSettings | null`

Reducers:
- `setCurrentUserSettings(userId)`
- `updateUserSettings(updatedSettings)` (update or create record)
- `resetUserSettings(userId)` -> uses defaults (light theme, english, etc.)

#### `src/store/slices/MedicalSlice.ts`
State:
- `consultations: Consultation[]` initialized empty

Async thunks:
- `fetchConsultations` (GET `/consultations`)
- `addConsultationAsync` (POST)
- `updateConsultationAsync` (PUT)
- `deleteConsultationAsync` (DELETE)

Reducers:
- adds/updates list items
- `fetchConsultations` replaces list

## Hooks
### `src/hooks/usePermissions.ts`
Purpose: compute role-based permissions for CRUD operations.

How it works:
- For role:
  - `admin`: can create/edit/delete/view/reassign all
  - `doctor`: can edit/view/reassign; delete enabled
  - `nurse`: can edit/view; create/delete disabled; nurse-edit is limited to assigned items (`assigneeId`) and some extra special field checks.
- Exposes helpers:
  - `canEditItem(item, field?)`
  - `canDeleteItem(item)`
  - `canReassignItem(item)`

### `src/hooks/useNotifListen.ts`
BroadcastChannel listener hook:
- Creates `createNotificationChannel()`
- Assigns `channel.onmessage` and calls the provided `onReceive`
- Closes the channel on cleanup.

### `src/hooks/useDoctors.ts`
Builds a “doctor option list” for the appointment form:
- Takes `state.user.users` and filters to doctors (`roleId === 2`)
- Uses mock JSON files:
  - `DoctorSlots.json` to map `doctorId -> available slots`
  - `DoctorSpeciality.json` to map `specialtyId -> specialty name`

Returns objects used by the appointment form:
- `label`, `value` (doctor id)
- `availableSlots`
- `specialtyId` and `specialtyName`

### `src/hooks/useDataFiltering.ts`
Generic filter engine:
- Keeps local `filters` state (search/role/status/date/assignee/patient/doctor)
- Applies:
  - search across `searchFields`
  - role/status/date string equality checks against specified `filterConfig.*Field`
  - optional `customFilters(item, filters)` predicate
- Also provides `updateFilter`, `clearFilters`, `clearFilter`.

### `src/hooks/useCrudOperations.ts`
Generic helper for add/update/delete flows:
- Exposes:
  - `handleAdd`, `handleUpdate`, `handleDelete`
  - `snackbar` state + `closeSnackbar`
  - internal `isLoading` flag
- It is a UI helper; it does not call Redux directly, it delegates to the provided async callbacks.

### `src/hooks/useAppointmentManagement.ts` (advanced appointment flow)
This hook contains a more comprehensive implementation for:
- loading patients/appointments on mount
- filtering appointments by doctor role
- create/update appointment with notifications
- appointment status change with notification routing
- starting consultation with notification

In the current codebase, `Appointment.tsx` does its own appointment logic and does not directly use this hook (at least not in the file content we read), but this hook is still worth documenting because it encodes the intended architecture.

### `src/hooks/useAppointmentFiltering.ts`
Specialized filter logic for appointments:
- filters by role-based doctor restriction (if `userRole === 'doctor'`)
- supports search, date, status, doctor, patient, and “time filter type”
- computes stats (total/scheduled/completed/cancelled/no-show)

### `src/hooks/useFilteredAppoint.ts` (filtered by time)
Another appointment filtering hook:
- Implements:
  - `all`, `today`, `upcoming`, `previous` filtering semantics
  - search based on patient name matching
  - optional exact date matching via `dateFilter`.

## Pages (route-level “screens”)
### `src/pages/LoginFormPage.tsx`
- Login UI built with:
  - `react-hook-form`
  - `yupResolver(loginValidationSchema)`
  - Controlled form fields:
    - `ControlledTextField` (email/password)
    - `ControlledCheckbox` (remember me)
    - `SubmitButton`
- Calls `useAuth().login(email, password)`
- On success, navigates based on `user.roleId`:
  - `1` -> `/admin/user-management`
  - `2` -> `/doc/dashboard`

### `src/pages/AdminUserManagement.tsx`
Admin CRUD UI for users:
- Uses Layout + DataTable + FilterBar
- Modals:
  - `UserFormModal` for create/edit
  - `ViewDialog` for user detail
  - `ConfirmDeleteDialog` for delete confirmation
- Uses hooks:
  - `useCrudOperations` to wrap async dispatches and show snackbars
  - `useDataFiltering` for search/filter behavior
  - `usePermissions` to disable edit/delete for admins (note how it computes `canEdit` / `canDelete`)
- On add/update/delete it creates notifications via `NotificationService.createUserNotification(...)` and calls `sendNotification`.

### `src/pages/AdminTaskManagement.tsx`
Admin/nurse task CRUD UI:
- Table with task columns (task title, patient name, assignee name, status chip, due date)
- Uses:
  - `TaskFormModal` for create/edit
  - `ViewDialog` for details
  - `ConfirmDeleteDialog` for delete confirmation
  - `FilterBar` for search/status/assignee filtering
- Nurse-specific behavior:
  - `customFilters` restrict tasks shown to those assigned to the current nurse.
- Notification:
  - On add/update/delete it uses `NotificationService.createTaskNotification(...)` and dispatches `sendNotification`.

### `src/pages/AdminSupport.tsx` (stub)
- Currently a placeholder page with a message: “This is the admin support page.”

### `src/pages/AdminSettings.tsx` (stub)
- Placeholder page for “Settings”.

### `src/pages/DocDashboard.tsx`
Doctor dashboard overview:
- Computes doctor-specific subsets:
  - appointments filtered by `appointment.doctorId === user.id`
  - tasks filtered by `task.assigneeId === user.id || task.createdBy === user.id`
  - consultations filtered by `cons.doctorId === user.id`
- Calculates stats cards:
  - today’s appointments
  - pending consultations
  - total consultations
  - pending tasks
- Renders:
  - a “today’s appointments” card with start buttons for appointments not yet consultation-completed
  - quick action buttons to navigate to Appointment list, patient records, and task management.

### `src/pages/DocPatientManage.tsx`
Doctor patient management:
- On mount:
  - dispatches `fetchPatients()`
  - dispatches `fetchAppointments()`
  - dispatches `fetchConsultations()` (if needed)
- Computes `doctorPatients` as union of:
  - patients referenced by doctor consultations
  - patients referenced by doctor appointments
- If `patientId` is present in the route, it renders `PatientDetails`.
- Displays doctor patients in a DataTable with columns:
  - patient name + age
  - date of birth
  - last consultation date + diagnosis snippet
- Also includes a medical history dialog, but the current dialog content is mostly a placeholder in the file.

### `src/pages/Appointment.tsx`
Appointment management page:
- Uses Redux slices for:
  - appointments (`state.appointments.appointments`)
  - patients (`state.patients.patients`)
- Builds doctor options by combining:
  - `mockServer/data/Users.json` (doctor users)
  - `mockServer/data/DoctorSlots.json` (slot lists)
  - `mockServer/data/DoctorSpeciality.json` (specialty names)

Important UI logic:
- Tabs:
  - tab 0: appointments list
  - tab 1: create appointment form
  - doctors are restricted from create mode via `user?.roleName !== 'doctor'` conditions
- Filters:
  - uses `useDataFiltering` with search/status/date/doctor/patient-ish configuration
  - plus a time filter chip group (“All / Upcoming / Previous”)
- Status changes:
  - each row has a “more” icon that opens a menu to mark:
    - cancelled
    - no-show
  - status changes:
    - update appointment via Redux thunk
    - send a notification using `NotificationService.createAppointmentNotification(...)`
    - the notification recipient id is derived from whether current user is admin or not
- Starting a consultation:
  - for a past slot (as determined by `slotDate`), it shows a Start button that navigates to:
    - `/consultation?appointmentId=<id>&patientId=<id>`
  - also sends a consultation-start notification.

### `src/pages/Consultation.tsx`
Consultation recording + optional attachments:
- Uses react-hook-form + `yupResolver(consultationValidationSchema)`
- Supports read-only mode:
  - if `consultationId` param is present, it becomes `isReadOnly = true` and shows attachments via `FilePreviewList`
- Uses `useFieldArray` to manage prescriptions entries dynamically.
- Upload attachments:
  - `FileUploader` provides an imperative handle with `uploadAll()` to upload all selected files.
  - Uploaded file ids are stored in `uploadedFileIds` and then included in `uploadIds` in the consultation object.
- On submit:
  1. Upload files (if any)
  2. Build a `newConsultation` object:
     - `symptoms` is parsed from a comma-separated string
     - prescriptions are filtered to ensure required fields exist
     - `status` is set to completed
     - `uploadIds` attached
  3. Dispatch Redux actions:
     - `addConsultationAsync`
     - `updateConsultationAsync` (status completed)
  4. If tied to an appointment, update appointment:
     - set `status='completed'`
     - set `consultationCompleted=true`
  5. Send notifications:
     - 'completed' consultation notification to doctor
     - optionally also sends 'followup_required' if `followUpRequired` is true
  6. Navigates back to `/consultations-records` after a short delay.

### `src/pages/ConsultationList.tsx`
Completed consultation listing:
- Fetches:
  - patients
  - consultations
- Filters consultations:
  - only show records where:
    - `consultation.doctorId === user.id`
    - `consultation.status === 'completed'`
    - and optionally matches `patientId` query param
- Uses `useDataFiltering`:
  - search across `patientName`
  - filter date based on `createdAt`
- Table columns:
  - patient name, birth date, contact info, consultation date
  - actions:
    - arrow button navigates to `/consultation/view/<consultation.id>`

### `src/pages/ConsultMain.tsx`
- This file is currently a large commented-out stub (no active UI logic).

### `src/pages/PatientDetails.tsx`
Patient detail page:
- Reads `patientId` from route params.
- Displays:
  - basic patient info (email, phone, address, blood type)
  - emergency contact (handles both array and object shapes)
  - allergies chips
  - recent consultations list (max ~5 entries)
  - a medical timeline dialog (currently displayed but content is not fully implemented in the snippet)

## Component library (how UI is composed)
### Shared UI: `src/components/sharedComponents/*`
#### `Layout.tsx`
- Provides the global shell:
  - fixed AppBar header
  - responsive Drawer sidebar controlled by `rolePages`
  - routes children inside the main content area
- Implements the notification bell and dropdown behavior (see notification UI section).

#### `RolePages.tsx`
- Central mapping from `roleName` (`admin` | `doctor` | `nurse`) to the sidebar navigation items.
- Each entry contains:
  - `label`
  - `icon` (MUI icon component)
  - `path` (route used by `Layout` navigation)

#### `ProtectedRoutes.tsx`
- Route-guard component used by `App.tsx` to ensure the user is authenticated.
- It checks `useAuth().isAuthenticated`:
  - if not authenticated: redirects to `/` (the login page).
- It also supports optional props `requireAdmin` and `requireDoctor`, but in the current routing setup `App.tsx` uses it without those props.

#### `DataTable.tsx`
- A generic table:
  - takes `columns` as an array of `{ header, render(item) }`
  - supports optional row actions:
    - view (eye icon)
    - edit (pencil icon)
    - delete (trash icon)
  - supports sorting by `sortByDate(item)`.

#### `FilterBar.tsx`
- A reusable filtering row component:
  - supports filter types:
    - `search` -> uses `SearchFilterbox`
    - `select` -> uses MUI `<Select>`
    - `date` -> uses MUI `TextField type="datetime-local"`
    - `text` -> uses MUI `TextField`
  - optional clear button if any filter value is non-empty.

#### `ActionButtons.tsx`
- Small utility to render an array of IconButtons with tooltips.
- Provides helper factories:
  - `createViewAction`, `createEditAction`, `createDeleteAction`, etc.

#### `ViewDialog.tsx`
- Generic read-only modal dialog:
  - shows title, optional avatar/chip, then a grid of label/value pairs
  - “Close” button.

#### `ConfirmDeleteDialog.tsx`
- Standard confirm deletion modal:
  - displays the `itemName`
  - calls `onConfirm` when “Delete” is clicked.

#### `StatusChip.tsx`
- Converts a status string into a styled MUI `<Chip>`
- Has a default mapping for:
  - task statuses (`Pending`, `In Progress`, `Done`)
  - appointment statuses (`scheduled`, `completed`, `cancelled`, `no-show`)
  - role labels (`admin`, `doctor`, `nurse`)
  - consultation statuses (some additional keys like `pending`, `consultCompleted`)

#### `SnackbarAlert.tsx`
- MUI Snackbar wrapper for messages.

#### `PageHeader.tsx`
- Just a `Typography` title wrapper.

### Form modals: `src/components/formModals/*`
#### `UserFormModal.tsx`
- Uses react-hook-form + yup validation (`userSchema` from `src/validation/UserFormValidation.ts`)
- Dynamically shows `Specialty` select when `roleId === 2` (doctor)
- Uses `DoctorSpeciality.json` mock data to populate specialty dropdown.
- Uses `DailogButton` from `CustomButton.tsx` to provide “Close” + submit.

#### `TaskFormModal.tsx`
- Uses dummy JSON (`Tasks.json`, `Users.json`, `Patients.json`) to populate dropdown options.
- Uses yup resolver (`TaskValidation.ts`)
- Fields controlled via react-hook-form:
  - title, type, patient, assignee, dueAt, status, notes
- Permission logic:
  - nurse disables `type`, `patient`, and `assignee` fields.

#### `SupportTicketModal.tsx`
- Create/view support ticket dialog:
  - Shows different copy and disables fields in `mode='view'`.
  - Uses `supportTicketValidationSchema`.
  - Shows chips for category/priority/status in view mode.

#### `PatientFormModal.tsx`
- Create/edit/view dialog for patient data.
- Uses `patientSchema` and react-hook-form.
- Normalizes allergies using helper `normalizeAllergies`:
  - accepts array or comma-separated string
  - trims and filters out empty values

#### `AppointmentForm.tsx`
- Create/edit appointment dialog:
  - Select patient (disabled in edit mode)
  - Select doctor specialty (dropdown)
  - Select doctor (autocomplete filtered by chosen specialty)
  - Select available appointment slot (dropdown)
  - Select appointment status
  - Reason is optional
- Uses:
  - `appointmentValidationSchema`
  - Redux store for patients and specialties
- Also includes a nested “Register New Patient” action that opens `PatientFormModal`.

### Dashboard/components used inside pages
#### `StatCard.tsx`
- Small card showing a value + icon.

#### Appointment list helpers
- `appointment/AppointmentTableColumns.tsx`: exports column definitions for `DataTable` to render appointment rows and the conditional “Start” button.
- `appointment/AppointmentFilters.tsx`: wraps FilterBar + chip group for time filtering.
- `AppointStatFilterBadge.tsx`: defines `AppointmentFilterChips` (“All/Upcoming/Previous”).

#### Consultation UI sections
- `ConsultDetails.tsx`: renders a card containing symptoms/diagnosis/notes editing or read-only display.
- `ConsultationDetailsList.tsx`: a small read-only list wrapper for symptoms/diagnosis/notes (used when you want a compact display rather than the full edit card).
- `PrescriptionSection.tsx`: renders prescription list and per-prescription input fields (editable) or display (read-only).
- `AppointmentSection.tsx`: shows appointment metadata inside consultation form (read-only based on `preSelectedAppointment` + follow-up selection).
- `FileUploader.tsx`:
  - custom drag/drop + multi-file upload UI
  - validates file type and max size
  - uploads all selected files to backend `/uploads` via `axios.post(FormData)`
  - exposes an imperative `uploadAll()` for the consultation submit flow.
- `FilePreviewList.tsx`:
  - shows file thumbnails for images or a PDF icon for PDFs
  - uses `/uploads/<id>` as the presumed file serving URL.
  - (Backend serves file contents only if `/uploads/<id>` is implemented as a file route; currently backend `uploads.py` returns metadata JSON, so image rendering may require backend adjustments.)

#### Other UI helpers
- `GeneralizedTabs.tsx`:
  - a thin wrapper around MUI `<Tabs>` + `<Tab>` that accepts a list of `tabs` options (`label`, optional `value`, optional icon).
- `CustomButton.tsx`:
  - `AddButton`: consistent gradient action button used across admin pages.
  - `DailogButton`: common modal footer (“Close” + submit label).
- `Header.tsx`:
  - a standalone/legacy “news/login” AppBar component (not used by the main medical workflow; the real global header is in `Layout.tsx`).

### Login UI components
- `BrandingPanel.tsx`: left-side marketing/brand panel (hidden on small screens).
- `LoginFormHeader.tsx`: “Sign In” avatar + headings.
- `SubmitButton.tsx`: submit button with spinner when `isLoading`.

### Input components
- `ControlledTextField.tsx`: react-hook-form Controller wrapper for text inputs, with optional start/end icons.
- `ControlledCheckbox.tsx`: react-hook-form Controller wrapper for checkboxes.
- `SearchFilterbox.tsx`:
  - a thin wrapper around MUI `<TextField>` intended for the search filter type in `FilterBar`.
  - Note: this file appears truncated in the extracted readout; your TypeScript build should confirm its completeness.

## Important inconsistencies / gotchas (worth remembering)
1. `src/types/notification.ts` is not aligned with `NotifSocketContext.tsx` Notification type.
   - Backend’s notification model includes `general`, `priority`, and many contextual fields.
   - Frontend context includes `priority` and `'general'`, but `src/types/notification.ts` does not.
   - This can cause typing confusion if other parts use the old type.

2. Notifications state is split:
   - `NotificationProvider` uses Redux slice to store notifications
   - `Layout.tsx` maintains its own local notifications state and does its own fetching/muting read actions
   - Result: Redux notification updates may not automatically reflect in the Layout dropdown UI.

3. `src/components/SearchFilterbox.tsx` appears incomplete in file content (it ends abruptly in the readout).
   - This should be checked by TypeScript build / linter. If it’s truly truncated, the app won’t compile.

4. `backend/routers/DoctorSpeciality.py` and `backend/routers/DoctorSlots.py` are stubs.
   - The frontend currently relies on JSON mock files and/or local mapping (`useDoctors`, appointment page’s `prepareDoctors`) instead of backend endpoints.

## Where to start if you reopen the project
If you only read a few files to re-orient quickly:
1. `src/main.tsx` (provider stacking order)
2. `src/App.tsx` (routing)
3. `src/context/AuthContext.tsx` (login + role flags)
4. `src/context/NotifSocketContext.tsx` (notification send/mark + persistence calls)
5. `src/components/sharedComponents/Layout.tsx` (global UI + notification dropdown routing)
6. One major workflow:
   - `src/pages/Appointment.tsx` (appointment + status changes + notification)
   - `src/pages/Consultation.tsx` (consultation + uploads + notifications)
7. Data primitives:
   - `src/store/Store.ts` and one slice (e.g., `AppointmentSlice.ts`)

