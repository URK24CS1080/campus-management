from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from app.core.database import Base, engine
from app.models import (
    user,
    incident,
    team,
    assignment,
    status_history,
    sla_rule,
    escalation,
    notification,
)
from app.routers import auth, incidents, assignments, analytics, notifications
from app.routers import (
    auth,
    incidents,
    assignments,
    analytics,
    notifications,
    teams,
    sla
)
from app.jobs.sla_checker import check_sla_breaches

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Campus Incident Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(incidents.router)
app.include_router(assignments.router)
app.include_router(analytics.router)
app.include_router(notifications.router)
app.include_router(sla.router)

scheduler = BackgroundScheduler()
scheduler.add_job(check_sla_breaches, "interval", minutes=1)
scheduler.start()

@app.get("/")
def root():
    return {"status": "running"}