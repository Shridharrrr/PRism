from celery import Celery
import os
import ssl
from dotenv import load_dotenv

load_dotenv()

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

celery = Celery(
    "prism",
    broker=redis_url,
    backend=redis_url,
    include=["tasks"]
)

celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    broker_use_ssl={
        "ssl_cert_reqs": ssl.CERT_NONE
    },
    redis_backend_use_ssl={
        "ssl_cert_reqs": ssl.CERT_NONE
    },
)