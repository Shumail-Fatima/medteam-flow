# Backend Documentation (`medteam-flow-develop/backend`)

## Targeted objective (what this backend is for)
This backend is a lightweight REST API (FastAPI) that backs the frontend “medical management” UI by providing CRUD endpoints for:
- `patients`
- `appointments`
- `consultations` (doctor consultations, diagnoses, notes, prescriptions, uploads)
- `notifications` (persisted + retrievable per user)
- `tasks`
- `users` and `roles`
- `uploads` (stores uploaded file content on disk + metadata in JSON)

Persistence is intentionally “mock-first”: the API reads/writes JSON files stored under `medteam-flow-develop/mockServer/data/*`. This matches how the frontend also uses the same mock data layout.

Note: “real-time” notification delivery is mainly implemented on the frontend (via `BroadcastChannel`), while this backend focuses on persistence and standard HTTP retrieval/update.

## Tech stack used
- FastAPI app (`backend/main.py`)
- Pydantic models (`backend/models/*.py`) for request/response typing
- Routers (`backend/routers/*.py`) for endpoint grouping
- JSON persistence helper (`backend/utils/fileHandler.py`)

## Entry point: `backend/main.py`
Responsibilities:
1. Create the `FastAPI()` application instance.
2. Configure CORS so local dev servers can call it (frontend runs on `localhost:5173`).
3. Register all routers:
   - `patients.router` (patients CRUD)
   - `appointment.router` (appointments CRUD under `/appointments`)
   - `notifications.router` (notifications CRUD under `/notifications`)
   - `consultation.router` (consultations CRUD under `/consultations`)
   - `Users.router` (users CRUD under `/users`)
   - `Tasks.router` (tasks CRUD under `/tasks`)
   - `Roles.router` (roles CRUD under `/roles`)
   - `uploads.router` (uploads CRUD under `/uploads`)

Key logic:
- `app.include_router(<router>)` is what wires each router’s endpoints into the single backend app.
- `if __name__ == "__main__": uvicorn.run(...)` allows running the file directly with Uvicorn.

## JSON persistence helper: `backend/utils/fileHandler.py`
### `read_json(file_path: Path) -> Any`
- If `file_path` does not exist: returns `[]`.
- Otherwise reads and `json.load`s the file.
- Because of this, routers can safely treat missing JSON files as “empty collections”.

### `write_json(file_path: Path, data: dict) -> None`
- Writes JSON to disk using `json.dump(..., indent=2)`.
- Routers decide the JSON shape (either an array of records, or an object with a top-level key like `"Patients"`).

## Data models (`backend/models/*.py`)
These Pydantic models define the schema for payloads and `response_model` types in routers.

### `backend/models/usersModel.py`
- `class User(BaseModel)`
  - Fields (main ones): `id`, `name`, `username`, `email`, `password`, `roleId`, `roleName`, `createdAt`
  - Specialty linkage for doctors: `specialtyId: Optional[str]`
  - Notes:
    - `id` uses `default_factory=str` (so it can exist even if router doesn’t set one explicitly).
- `class Users(BaseModel)`
  - Wrapper model around `users: List[User]` with `Field(..., alias="Users")`
  - `populate_by_name = True` supports alternative field naming when loading.

### `backend/models/rolesModel.py`
- `Role`: `id: str`, `name: str`
- `Roles`: wrapper with `roles: List[Role]` aliased as `"Roles"`.

### `backend/models/patientModel.py`
- `EmergencyContact`: `name`, `phone`, `relationship`
- `MedicalHistory`: `id`, `date`, `type`, `doctorId`, `doctorName`, `title`, `description`, plus optional `severity`, `dosage`, `symptoms`
- `Patient`:
  - Core: `id`, `name`, `dateOfBirth`, `email`, `phone`, `address`
  - Emergency contact & medical history are optional:
    - `emergencyContact: Optional[Union[EmergencyContact, List[EmergencyContact]]]`
    - `medicalHistory: Optional[List[MedicalHistory]] = []`
  - Optional lists:
    - `allergies: Optional[List[str]] = []`
  - Optional: `bloodType`, `createdAt`
- `Patients` wrapper:
  - `patients: List[Patient]` aliased as `"Patients"`

### `backend/models/appointmentModel.py`
- `Appointment` fields:
  - `id` (default empty string replaced by router/model depending on how it is created)
  - Patient: `patientId`, `patientName`, `patientAge`
  - Doctor: `doctorId`, `doctorName`, and optional `specialtyName`
  - Appointment metadata: `appointmentSlot` (string), `reason`, `status`
  - Flow flag: `consultationCompleted: bool`
  - Optional creator linkage: `createdById`
  - `createdAt` string
- `Appointments` wrapper:
  - `appointments: List[Appointment]` aliased as `"Appointments"`

### `backend/models/tasksModel.py`
- `Task`:
  - `id`: default uses a timestamp-based scheme (`t_<milliseconds>`)
  - `title`, `type`, `status`, `notes`
  - Relationships: `patientId`, `assigneeId`
  - Scheduling: `dueAt` optional, `createdAt` string
  - Display helpers: `assigneeName` optional
- `Tasks` wrapper:
  - `tasks: List[Task]` aliased as `"Tasks"`

### `backend/models/consultationModel.py`
- `Prescription`:
  - `id`, `medication`, `dosage`, `frequency`, `duration`, `instructions`
- `Consultation`:
  - Identity & relationships:
    - `id`, `patientId`, `patientName`, `doctorId`, `doctorName`, `appointmentId`
  - Clinical content:
    - `date`, `symptoms: List[str]`, `diagnosis`, `notes`
    - `prescriptions: List[Prescription] = []`
  - Follow-up:
    - `followUpRequired: bool`
    - `followUpDate: Optional[str]`
  - Workflow:
    - `createdAt`, `status: str` (frontend typically uses `'pending' | 'completed'`)
    - `uploadIds: Optional[List[str]] = []`
- `Consultations` wrapper:
  - `consultations: List[Consultation]` aliased as `"Consultations"`

### `backend/models/notifModel.py`
This file defines notification typing using enums.

- `NotificationType` enum:
  - `appointment`, `consultation`, `task`, `user`, `followup`, `general`
- `NotificationPriority` enum:
  - `low`, `medium`, `high`
- `Notification`:
  - Core fields: `id`, `title`, `message`, `type`, `toUserId`, `fromUserId?`, `isRead`, `createdAt`
  - Optional contextual fields for deep links:
    - `appointmentId`, `consultationId`, `taskId`, `patientId`, `doctorId`, `priority`
- `Notifications` wrapper:
  - `notifications: List[Notification]`

### `backend/models/uploadsModel.py`
- `Upload`:
  - `id`, `name`, `type`, `size`, `path`, `createdAt`
  - `@staticmethod create(...)` produces an `Upload` with:
    - `id` = uuid4
    - `createdAt` = `datetime.utcnow().isoformat()`

## Routers (`backend/routers/*.py`)

### Shared pattern across most routers
Every CRUD router:
1. Computes a JSON file path (usually `Path(__file__).parents[2] / "mockServer" / "data" / "<X>.json"`).
2. Uses `read_json(...)` to load existing data.
3. Normalizes the read shape:
   - Sometimes routers support either:
     - a raw array at the top-level, OR
     - an object with a key like `"Patients"`, `"Appointments"`, etc.
4. Mutates the in-memory list.
5. Calls `write_json(...)` to persist changes back to the same JSON file.

This “loose JSON shape support” is important because different mock files may be structured differently.

### `backend/routers/patients.py`
Endpoints:
- `GET /patients` -> `Patients`
  - Reads JSON from `.../data/Patients.json`
  - Supports both:
    - top-level array
    - object key `"Patients"` or `"patients"`
- `POST /patients` -> `Patient` (201)
  - Appends a new patient record
  - Router-level defaults:
    - generates `patient.id` if absent: `patient_<uuid8>`
    - sets `createdAt` if absent: `datetime.utcnow().isoformat() + "Z"`
- `PUT /patients/{patient_id}` -> `Patient`
  - Finds patient record by `id`, replaces with updated content, and forces the `id` to remain `patient_id`
  - Raises `404` if missing
- `DELETE /patients/{patient_id}` -> 204
  - Filters record out by `id`
  - Raises `404` if no record was removed

### `backend/routers/appointment.py`
Router configuration:
- `router = APIRouter(prefix="/appointments", tags=["appointments"])`

Endpoints:
- `GET /appointments/` -> `List[Appointment]`
  - Loads list from `.../data/Appointments.json`
  - If JSON is dict: expects key `"Appointments"`
- `GET /appointments/{appointment_id}` -> `Appointment`
- `POST /appointments/` -> `Appointment` (201)
  - Generates `appointment.id` if absent: `apt_<milliseconds>`
- `PUT /appointments/{appointment_id}` -> `Appointment`
  - Replaces record content but preserves `id`
- `DELETE /appointments/{appointment_id}` -> 204

### `backend/routers/notifications.py`
Router configuration:
- `router = APIRouter(prefix="/notifications", tags=["notifications"])`

Endpoints:
- `GET /notifications` -> `List[Notification]`
  - Optional query param: `toUserId`
  - If provided, filters notifications where `toUserId == query`
- `GET /notifications/{notification_id}` -> `Notification`
- `POST /notifications` -> `Notification` (201)
  - Generates `id` if missing: `notif_<timestamp>_<random>`
  - Sets `createdAt` if missing: `datetime.utcnow().isoformat() + "Z"`
- `PATCH /notifications/{notification_id}` -> `Notification`
  - Updates only the provided fields in the notification dict (used for `{"isRead": true}`)
- `DELETE /notifications/{notification_id}` -> 204

### `backend/routers/consultation.py`
Router configuration:
- `prefix="/consultations"`

Endpoints:
- `GET /consultations/` -> `List[Consultation]`
- `GET /consultations/{consultation_id}` -> `Consultation`
- `POST /consultations/` -> `Consultation` (201)
  - Generates `consultation.id` if absent: `consult_<milliseconds>`
- `PUT /consultations/{consultation_id}` -> `Consultation`
  - Preserves `id`
- `DELETE /consultations/{consultation_id}` -> 204

### `backend/routers/Users.py`
Router configuration:
- `prefix="/users"` (note capitalization in filename/class usage)

Endpoints:
- `GET /users/` -> list
- `GET /users/{user_id}` -> user by `id`
- `POST /users/` -> creates user
  - Generates `user.id` if missing: `u_<milliseconds>`
- `PUT /users/{user_id}` -> updates (preserves id)
- `DELETE /users/{user_id}` -> 204

### `backend/routers/Tasks.py`
Router configuration:
- `prefix="/tasks"`

Endpoints:
- `GET /tasks/` -> `List[Task]`
- `GET /tasks/{task_id}` -> `Task`
- `POST /tasks/` -> `Task` (201)
  - Does not explicitly generate IDs, but `Task.id` Pydantic default exists
- `PUT /tasks/{task_id}` -> updates (preserves id)
- `DELETE /tasks/{task_id}` -> 204

### `backend/routers/Roles.py`
Router configuration:
- `prefix="/roles"`

Endpoints:
- `GET /roles/` -> list
- `GET /roles/{role_id}` -> role by id
- `POST /roles/` -> creates a role
  - Generates `role.id` if missing: `r_<milliseconds>`
- `PUT /roles/{role_id}` -> updates (preserves id)
- `DELETE /roles/{role_id}` -> 204

### `backend/routers/uploads.py`
Router configuration:
- `prefix="/uploads"`

Files used:
- Metadata JSON: `.../data/Uploads.json`
- Actual upload directory:
  - `uploads_dir = Path.home() / "Documents" / "uploads"`
  - Created if missing

Endpoints:
- `GET /uploads/` -> `List[dict]` (metadata list)
- `GET /uploads/{upload_id}` -> metadata dict
- `POST /uploads/` -> metadata dict (201)
  - Accepts `UploadFile` via `UploadFile = File(...)`
  - Generates `file_id` using timestamp: `upl_<milliseconds>`
  - Saves:
    - actual file to: `uploads_dir / saved_filename`
    - metadata appended to the JSON metadata file
- `DELETE /uploads/{upload_id}` -> 204
  - Removes metadata record
  - Deletes file from disk using stored `saved_filename`

### `backend/routers/DoctorSpeciality.py` (stub)
This file is currently a placeholder:
- The router is incorrectly configured with:
  - `router = APIRouter(prefix="/consultations", tags=["consultations"])`
- All CRUD helper functions (`load_consultations`, `save_consultations`, etc.) return `None`.
- All endpoints return `None` as well.

As a result, there are no functional doctor-specialty or doctor-slot endpoints implemented here.

### `backend/routers/DoctorSlots.py` (stub)
Same situation as `DoctorSpeciality.py`:
- It duplicates the same placeholder implementation pattern.
- No real “doctor slots” functionality is exposed via the backend right now.

## Practical “state flow” summary (how data is used)
- Frontend dispatches async CRUD thunks using `apiClient` to endpoints like `/patients`, `/appointments`, etc.
- Routers:
  - load JSON state from disk
  - modify it
  - write the JSON back
- Notifications:
  - Frontend sends notifications via `POST /notifications`
  - Frontend retrieves notifications via `GET /notifications?toUserId=<id>`
  - Frontend marks read via `PATCH /notifications/<id>` with `{"isRead": true}`

## Notes / gotchas
- Because routers accept both “top-level array” and “object with key” formats, your JSON shape inconsistency can affect behavior if a file doesn’t match what the router expects.
- The two “DoctorSpeciality” and “DoctorSlots” routers are stubs; any doctor-slot/specialty functionality is therefore coming from mock JSON reads on the frontend (not from backend endpoints).

