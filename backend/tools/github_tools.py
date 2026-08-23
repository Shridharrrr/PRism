import httpx

async def fetch_pr_diff(owner: str, repo: str, pr_number: int, token: str) -> str:
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3.diff",
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        return response.text

async def fetch_pr_metadata(owner: str, repo: str, pr_number: int, token: str) -> dict:
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        return {
            "title": data["title"],
            "author": data["user"]["login"],
            "body": data.get("body") or "",
            "base_branch": data["base"]["ref"],
            "head_branch": data["head"]["ref"],
            "changed_files": data["changed_files"],
            "additions": data["additions"],
            "deletions": data["deletions"],
        }

async def fetch_open_prs(owner: str, repo: str, token: str) -> list:
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls?state=open&per_page=20"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        return [
            {
                "number": pr["number"],
                "title": pr["title"],
                "author": pr["user"]["login"],
                "url": pr["html_url"],
                "created_at": pr["created_at"],
                "draft": pr["draft"],
            }
            for pr in data
        ]

async def create_check_run(owner: str, repo: str, head_sha: str, token: str) -> dict:
    url = f"https://api.github.com/repos/{owner}/{repo}/check-runs"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    data = {
        "name": "PRism AI Review",
        "head_sha": head_sha,
        "status": "in_progress"
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data)
        if response.status_code >= 400:
            print(f"Failed to create check run: {response.text}")
            return {}
        return response.json()

async def update_check_run(owner: str, repo: str, check_run_id: int, status: str, conclusion: str, output: dict, token: str) -> dict:
    url = f"https://api.github.com/repos/{owner}/{repo}/check-runs/{check_run_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    data = {
        "status": status,
        "conclusion": conclusion,
        "output": output
    }
    async with httpx.AsyncClient() as client:
        response = await client.patch(url, headers=headers, json=data)
        if response.status_code >= 400:
            print(f"Failed to update check run: {response.text}")
            return {}
        return response.json()

async def post_inline_comment(owner: str, repo: str, pr_number: int, commit_id: str, path: str, line: int, body: str, token: str) -> dict:
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/comments"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    data = {
        "body": body,
        "commit_id": commit_id,
        "path": path,
        "line": line,
        "side": "RIGHT"
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data)
        if response.status_code >= 400:
            print(f"Failed to post comment: {response.text}")
            return {}
        return response.json()

async def fetch_repo_file(owner: str, repo: str, path: str, ref: str, token: str) -> str:
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={ref}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3.raw",
    }
    async with httpx.AsyncClient(follow_redirects=True) as client:
        response = await client.get(url, headers=headers)
        if response.status_code == 404:
            return None
        if response.status_code >= 400:
            print(f"Failed to fetch file: {response.text}")
            return None
        return response.text