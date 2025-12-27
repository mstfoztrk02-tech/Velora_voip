import os
from typing import Any, Dict, Optional

import httpx


class MMClient:
    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout_seconds: int = 20,
    ):
        self.base_url = (base_url or os.getenv("MM_API_URL") or "http://185.8.12.117:81").rstrip(
            "/"
        )
        self.api_key = api_key or os.getenv("MM_API_KEY")
        self.timeout_seconds = timeout_seconds

    def _headers(self) -> Dict[str, str]:
        if not self.api_key:
            raise RuntimeError("MM_API_KEY is not configured")
        return {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def post_json(self, path: str, payload: Dict[str, Any]) -> Any:
        url = f"{self.base_url}/{path.lstrip('/')}"
        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            resp = await client.post(url, headers=self._headers(), json=payload)

        content_type = resp.headers.get("content-type", "")
        if "application/json" in content_type.lower():
            data = resp.json()
        else:
            data = {"status": "OK" if resp.is_success else "ERROR", "message": resp.text}

        if resp.is_success:
            return data
        raise httpx.HTTPStatusError(
            f"MM API request failed with status {resp.status_code}",
            request=resp.request,
            response=resp,
        )
