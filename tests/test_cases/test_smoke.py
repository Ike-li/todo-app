"""L1 Smoke Tests - Quick environment validation.

These 10 tests verify:
1. Service is alive
2. Database is connected
3. Auth flow works (register + login)
4. Token validation works
5. Core CRUD works (create, read, update, delete)
6. Response structures are correct
"""
import pytest
import allure
from api.endpoints import (
    HEALTH, HEALTH_DB, AUTH_REGISTER, AUTH_LOGIN, AUTH_ME,
    TODOS, TODO_DETAIL, TODO_TOGGLE, CATEGORIES,
)
from utils.assertions import (
    assert_success, assert_error, assert_todo,
    assert_pagination, assert_message_response,
)
from utils.generators import random_email, random_title


@allure.epic("Smoke Tests")
@allure.feature("Health")
class TestSmokeHealth:

    @allure.story("Service alive")
    @allure.title("S01: Health check returns ok")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_health_check(self, client):
        """Verify the API service is running and responsive."""
        resp = client.get(HEALTH)
        assert_success(resp, 200)
        body = resp.json()
        assert body["status"] == "ok"
        assert "timestamp" in body
        assert "version" in body

    @allure.story("Database alive")
    @allure.title("S02: Database health check returns connected")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_db_health_check(self, client):
        """Verify the database connection is working."""
        resp = client.get(HEALTH_DB)
        assert_success(resp, 200)
        body = resp.json()
        assert body["status"] == "ok"
        assert body["database"] == "connected"
        assert "timestamp" in body


@allure.epic("Smoke Tests")
@allure.feature("Authentication")
class TestSmokeAuth:

    @allure.story("Registration")
    @allure.title("S03: User registration returns access token")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_register(self, client):
        """Verify user registration works and returns a token."""
        email = random_email()
        resp = client.post(AUTH_REGISTER, json={
            "email": email,
            "password": "smoketest123",
            "name": "Smoke User",
        })
        assert_success(resp, 201)
        body = resp.json()
        assert "accessToken" in body
        assert isinstance(body["accessToken"], str)
        assert len(body["accessToken"]) > 20

    @allure.story("Login")
    @allure.title("S04: Login returns access token")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_login(self, authed):
        """Verify login works (authed fixture handles register+login)."""
        # If authed fixture succeeded, auth works
        # Verify by calling /auth/me
        resp = authed.get(AUTH_ME)
        assert_success(resp, 200)
        body = resp.json()
        assert "id" in body
        assert "email" in body
        assert "password" not in body


@allure.epic("Smoke Tests")
@allure.feature("Token Validation")
class TestSmokeToken:

    @allure.story("Token required")
    @allure.title("S05: Protected endpoint rejects missing token")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_protected_endpoint_without_token(self, client):
        """Verify protected endpoints reject unauthenticated requests."""
        resp = client.get(AUTH_ME)
        assert_error(resp, 401)


@allure.epic("Smoke Tests")
@allure.feature("Core CRUD")
class TestSmokeTodos:

    @allure.story("Create")
    @allure.title("S06: Create a todo")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_create_todo(self, authed):
        """Verify creating a todo returns 201 with correct structure."""
        title = random_title()
        resp = authed.post(TODOS, json={
            "title": title,
            "description": "Smoke test todo",
        })
        assert_success(resp, 201)
        todo = resp.json()
        assert_todo(todo, title=title, completed=False, priority="NONE")

        # Cleanup
        authed.delete(f"/todos/{todo['id']}")

    @allure.story("Read")
    @allure.title("S07: List todos with pagination")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_list_todos(self, authed, sample_todo):
        """Verify todo list returns paginated results."""
        resp = authed.get(TODOS)
        assert_success(resp, 200)
        body = resp.json()
        assert_pagination(body)
        assert len(body["data"]) >= 1

    @allure.story("Read detail")
    @allure.title("S08: Get todo detail without internal fields")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_todo_detail(self, authed, sample_todo):
        """Verify todo detail returns correct data without userId/categoryId."""
        resp = authed.get(TODO_DETAIL.format(id=sample_todo["id"]))
        assert_success(resp, 200)
        todo = resp.json()
        assert_todo(todo, id=sample_todo["id"])

    @allure.story("Update")
    @allure.title("S09: Update a todo")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_update_todo(self, authed, sample_todo):
        """Verify updating a todo works."""
        resp = authed.patch(
            TODO_DETAIL.format(id=sample_todo["id"]),
            json={"title": "Updated by smoke test"},
        )
        assert_success(resp, 200)
        assert resp.json()["title"] == "Updated by smoke test"

    @allure.story("Delete")
    @allure.title("S10: Delete a todo returns message")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_delete_todo(self, authed):
        """Verify deleting a todo returns a message object."""
        # Create a todo specifically for deletion
        create_resp = authed.post(TODOS, json={"title": random_title()})
        assert_success(create_resp, 201)
        todo_id = create_resp.json()["id"]

        resp = authed.delete(TODO_DETAIL.format(id=todo_id))
        assert_message_response(resp, 200, "deleted")

        # Verify it's gone
        get_resp = authed.get(TODO_DETAIL.format(id=todo_id))
        assert_error(get_resp, 404)
