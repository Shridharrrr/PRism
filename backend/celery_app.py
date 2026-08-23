from celery import Celery
import os
import ssl
from dotenv import load_dotenv

load_dotenv()

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

# Check if Redis URL is local or remote (Upstash)
use_ssl = redis_url.startswith("rediss://")

celery = Celery(
    "prism",
    broker=redis_url,
    backend=redis_url,
    include=["tasks"]
)

# Base configuration
celery_config = {
    "task_serializer": "json",
    "result_serializer": "json",
    "accept_content": ["json"],
    "timezone": "UTC",
    "task_track_started": True,
    "task_time_limit": 30 * 60,  # 30 minutes
    "worker_prefetch_multiplier": 1,
    "worker_max_tasks_per_child": 50,
}

from celery.schedules import crontab
celery_config["beat_schedule"] = {
    "weekly_email_summary": {
        "task": "tasks.send_weekly_summary",
        "schedule": crontab(day_of_week='monday', hour=9, minute=0),
    },
}

# Only add SSL config for remote Redis (rediss://)
if use_ssl:
    celery_config.update({
        "broker_use_ssl": {
            "ssl_cert_reqs": ssl.CERT_NONE
        },
        "redis_backend_use_ssl": {
            "ssl_cert_reqs": ssl.CERT_NONE
        },
    })

celery.conf.update(celery_config)