"""Todo Toggle Tests."""
import pytest
import allure
from api.endpoints import TODO_TOGGLE
from utils.assertions import assert_success, assert_error


@allure.epic("Todos")
@allure.feature("Toggle")
class TestToggleTodo:

    @allure.story("Success")
    @allure.title("Toggle flips completed from false to true")
    def test_toggle_to_completed(self, authed, sample_todo):
        assert sample_todo["completed"] is False
        resp = authed.patch(TODO_TOGGLE.format(id=sample_todo["id"]))
        assert_success(resp, 200)
        assert resp.json()["completed"] is True

    @allure.story("Success")
    @allure.title("Toggle twice returns to original state")
    def test_toggle_twice(self, authed, sample_todo):
        authed.patch(TODO_TOGGLE.format(id=sample_todo["id"]))
        resp = authed.patch(TODO_TOGGLE.format(id=sample_todo["id"]))
        assert_success(resp, 200)
        assert resp.json()["completed"] is False

    @allure.story("Security")
    @allure.title("Toggle other user's todo returns 403")
    def test_toggle_other_user(self, authed, second_user_token, sample_todo):
        authed.set_token(second_user_token)
        resp = authed.patch(TODO_TOGGLE.format(id=sample_todo["id"]))
        assert_error(resp, 403)
