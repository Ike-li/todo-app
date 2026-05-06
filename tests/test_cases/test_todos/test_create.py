"""Todo Create Tests."""
import pytest
import allure
from api.endpoints import TODOS
from utils.assertions import assert_success, assert_error, assert_todo
from utils.generators import random_title


@allure.epic("Todos")
@allure.feature("Create")
class TestCreateTodo:

    @allure.story("Success")
    @allure.title("Create todo with title only")
    def test_create_title_only(self, authed):
        title = random_title()
        resp = authed.post(TODOS, json={"title": title})
        assert_success(resp, 201)
        todo = resp.json()
        assert_todo(todo, title=title, completed=False, priority="NONE")
        authed.delete(f"/todos/{todo['id']}")

    @allure.story("Success")
    @allure.title("Create todo with all fields")
    def test_create_all_fields(self, authed, sample_category):
        title = random_title()
        resp = authed.post(TODOS, json={
            "title": title,
            "description": "Test description",
            "priority": "HIGH",
            "dueDate": "2026-12-31",
            "categoryId": sample_category["id"],
            "tags": ["test-tag-1", "test-tag-2"],
        })
        assert_success(resp, 201)
        todo = resp.json()
        assert_todo(todo, title=title)
        assert todo["priority"] == "HIGH"
        assert todo["category"]["id"] == sample_category["id"]
        assert len(todo["tags"]) == 2
        authed.delete(f"/todos/{todo['id']}")

    @allure.story("Success")
    @allure.title("Create todo with tags auto-creates tags")
    def test_create_with_new_tags(self, authed):
        resp = authed.post(TODOS, json={
            "title": random_title(),
            "tags": ["brand-new-tag"],
        })
        assert_success(resp, 201)
        assert len(resp.json()["tags"]) == 1
        authed.delete(f"/todos/{resp.json()['id']}")

    @allure.story("Success")
    @allure.title("Create todo with tags containing empty strings skips them")
    def test_create_tags_skip_empty(self, authed):
        resp = authed.post(TODOS, json={
            "title": random_title(),
            "tags": ["valid", "", "  "],
        })
        assert_success(resp, 201)
        assert len(resp.json()["tags"]) == 1
        authed.delete(f"/todos/{resp.json()['id']}")

    @allure.story("Validation")
    @allure.title("Create todo without title returns 400")
    def test_create_missing_title(self, authed):
        resp = authed.post(TODOS, json={})
        assert_error(resp, 400)

    @allure.story("Validation")
    @allure.title("Create todo with empty title returns 400")
    def test_create_empty_title(self, authed):
        resp = authed.post(TODOS, json={"title": ""})
        assert_error(resp, 400)

    @allure.story("Validation")
    @allure.title("Create todo with title > 255 chars returns 400")
    def test_create_title_too_long(self, authed):
        resp = authed.post(TODOS, json={"title": "x" * 256})
        assert_error(resp, 400)

    @allure.story("Validation")
    @allure.title("Create todo with invalid priority returns 400")
    def test_create_invalid_priority(self, authed):
        resp = authed.post(TODOS, json={"title": random_title(), "priority": "CRITICAL"})
        assert_error(resp, 400)

    @allure.story("Validation")
    @allure.title("Create todo with invalid dueDate returns 400")
    def test_create_invalid_due_date(self, authed):
        resp = authed.post(TODOS, json={"title": random_title(), "dueDate": "not-a-date"})
        assert_error(resp, 400)

    @allure.story("Validation")
    @allure.title("Create todo with invalid categoryId UUID returns 400")
    def test_create_invalid_category_id(self, authed):
        resp = authed.post(TODOS, json={"title": random_title(), "categoryId": "not-uuid"})
        assert_error(resp, 400)

    @allure.story("Auth")
    @allure.title("Create todo without auth returns 401")
    def test_create_no_auth(self, client):
        resp = client.post(TODOS, json={"title": random_title()})
        assert_error(resp, 401)
