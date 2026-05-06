from typing import Optional
import allure


def assert_success(resp, code=200):
    """Assert response status code equals expected."""
    with allure.step(f"Assert status {code}"):
        assert resp.status_code == code, (
            f"Expected {code}, got {resp.status_code}: {resp.text[:200]}"
        )


def assert_error(resp, code, contains: Optional[str] = None):
    """Assert error response structure and optional message content."""
    with allure.step(f"Assert error {code}" + (f" containing '{contains}'" if contains else "")):
        assert resp.status_code == code
        body = resp.json()
        assert "statusCode" in body, f"Missing statusCode in {body}"
        assert "message" in body, f"Missing message in {body}"
        assert isinstance(body["message"], list), f"message should be list, got {type(body['message'])}"
        assert "timestamp" in body, f"Missing timestamp in {body}"
        if contains:
            assert any(contains in msg for msg in body["message"]), (
                f"'{contains}' not found in messages: {body['message']}"
            )


def assert_todo(todo: dict, **expected_fields):
    """Assert todo response structure (no internal fields)."""
    with allure.step("Assert todo response structure"):
        assert "id" in todo, "Missing id"
        assert "userId" not in todo, "userId should not be in response"
        assert "categoryId" not in todo, "categoryId should not be in response"
        for key, value in expected_fields.items():
            assert todo[key] == value, f"Expected {key}={value}, got {todo[key]}"


def assert_pagination(body: dict, page: int = 1, limit: int = 20):
    """Assert pagination response structure."""
    with allure.step(f"Assert pagination (page={page}, limit={limit})"):
        assert "data" in body, "Missing data"
        assert "total" in body, "Missing total"
        assert "page" in body, "Missing page"
        assert "limit" in body, "Missing limit"
        assert body["page"] == page
        assert body["limit"] == limit
        assert isinstance(body["data"], list)


def assert_message_response(resp, code=200, contains: Optional[str] = None):
    """Assert DELETE-style message response."""
    assert_success(resp, code)
    body = resp.json()
    assert "message" in body
    if contains:
        assert contains in body["message"]
