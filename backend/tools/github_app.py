import time
import jwt
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

def get_jwt_token():
    app_id = os.getenv("GITHUB_APP_ID")
    pem_path = os.getenv("GITHUB_APP_PRIVATE_KEY_PATH")

    with open(pem_path, "rb") as f:
        private_key = f.read()

    now = int(time.time())
    payload = {
        "iat": now - 60,
        "exp": now + 540,
        "iss": app_id
    }
    return jwt.encode(payload, private_key, algorithm="RS256")


def get_installation_token(installation_id: int) -> str:
    jwt_token = get_jwt_token()

    response = httpx.post(
        f"https://api.github.com/app/installations/{installation_id}/access_tokens",
        headers={
            "Authorization": f"Bearer {jwt_token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
    )
    return response.json()["token"]