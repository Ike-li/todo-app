from typing import Optional
import httpx
import allure


class TodoAPIClient:
    """HTTP client wrapper for the Todo App API."""

    def __init__(self, base_url: str, timeout: float = 30):
        self.base_url = base_url
        self.session = httpx.Client(base_url=base_url, timeout=timeout)
        self.token: Optional[str] = None

    def set_token(self, token: str):
        self.token = token
        self.session.headers["Authorization"] = f"Bearer {token}"

    def clear_token(self):
        self.token = None
        self.session.headers.pop("Authorization", None)

    def _request(self, method: str, path: str, **kwargs) -> httpx.Response:
        with allure.step(f"{method} {path}"):
            resp = self.session.request(method, path, **kwargs)
            allure.attach(
                f"Status: {resp.status_code}\nBody: {resp.text[:500]}",
                name="Response",
                attachment_type=allure.attachment_type.TEXT,
            )
            return resp

    def get(self, path: str, **kwargs) -> httpx.Response:
        return self._request("GET", path, **kwargs)

    def post(self, path: str, **kwargs) -> httpx.Response:
        return self._request("POST", path, **kwargs)

    def patch(self, path: str, **kwargs) -> httpx.Response:
        return self._request("PATCH", path, **kwargs)

    def delete(self, path: str, **kwargs) -> httpx.Response:
        return self._request("DELETE", path, **kwargs)

    def close(self):
        self.session.close()
