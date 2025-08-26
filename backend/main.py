import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import patients
from routers import appointment
from routers import notifications
from routers import consultation
from routers import users, tasks, roles

app = FastAPI()

# Allow local dev servers (React 3000, Vite 5173)
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(patients.router)
app.include_router(appointment.router)
app.include_router(notifications.router)
app.include_router(consultation.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(roles.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
