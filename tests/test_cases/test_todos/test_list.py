"""Todo List Tests."""
import pytest
import allure
from api.endpoints import TODOS
from utils.assertions import assert_success, assert_error, assert_pagination


@allure.epic("Todos")
@allure.feature("List")
class TestListTodos:

    @allure.story("Pagination")
    @allure.title("Default pagination returns page=1, limit=20")
    def test_default_pagination(self, authed, sample_todo):
        resp = authed.get(TODOS)
        assert_success(resp, 200)
        body = resp.json()
        assert_pagination(body, page=1, limit=20)
        assert len(body["data"]) >= 1

    @allure.story("Pagination")
    @allure.title("Custom page and limit")
    def test_custom_pagination(self, authed, sample_todo):
        resp = authed.get(TODOS, params={"page": 1, "limit": 5})
        assert_success(resp, 200)
        assert_pagination(resp.json(), page=1, limit=5)

    @allure.story("Filter")
    @allure.title("Filter by completed=true")
    def test_filter_completed(self, authed, sample_todo):
        resp = authed.get(TODOS, params={"completed": "true"})
        assert_success(resp, 200)
        for todo in resp.json()["data"]:
            assert todo["completed"] is True

    @allure.story("Filter")
    @allure.title("Filter by completed=false")
    def test_filter_active(self, authed, sample_todo):
        resp = authed.get(TODOS, params={"completed": "false"})
        assert_success(resp, 200)
        for todo in resp.json()["data"]:
            assert todo["completed"] is False

    @allure.story("Search")
    @allure.title("Search by keyword")
    def test_search(self, authed, sample_todo):
        # Use the todo's title as search term
        title_word = sample_todo["title"].split()[0]
        resp = authed.get(TODOS, params={"search": title_word})
        assert_success(resp, 200)
        assert len(resp.json()["data"]) >= 1

    @allure.story("Sort")
    @allure.title("Sort by position ascending")
    def test_sort_position(self, authed, sample_todo):
        resp = authed.get(TODOS, params={"sort": "position", "order": "asc"})
        assert_success(resp, 200)

    @allure.story("Validation")
    @allure.title("limit > 100 returns 400")
    def test_limit_exceeded(self, authed):
        resp = authed.get(TODOS, params={"limit": 101})
        assert_error(resp, 400)

    @allure.story("Validation")
    @allure.title("page < 1 returns 400")
    def test_page_invalid(self, authed):
        resp = authed.get(TODOS, params={"page": 0})
        assert_error(resp, 400)
