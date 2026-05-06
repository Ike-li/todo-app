"""Todo Detail Tests."""
import pytest
import allure
from api.endpoints import TODO_DETAIL
from utils.assertions import assert_success, assert_error, assert_todo


@allure.epic("Todos")
@allure.feature("Detail")
class TestTodoDetail:

    @allure.story("Success")
    @allure.title("Get todo by ID returns correct data")
    def test_get_todo(self, authed, sample_todo):
        resp = authed.get(TODO_DETAIL.format(id=sample_todo["id"]))
        assert_success(resp, 200)
        assert_todo(resp.json(), id=sample_todo["id"])

    @allure.story("Error")
    @allure.title("Get nonexistent todo returns 404")
    def test_get_nonexistent(self, authed):
        resp = authed.get(TODO_DETAIL.format(id="00000000-0000-0000-0000-000000000000"))
        assert_error(resp, 404)

    @allure.story("Error")
    @allure.title("Get todo with invalid UUID returns 400")
    def test_get_invalid_uuid(self, authed):
        resp = authed.get(TODO_DETAIL.format(id="not-a-uuid"))
        assert_error(resp, 400)

    @allure.story("Security")
    @allure.title("Access other user's todo returns 403")
    def test_get_other_user_todo(self, authed, second_user_token, sample_todo):
        authed.set_token(second_user_token)
        resp = authed.get(TODO_DETAIL.format(id=sample_todo["id"]))
        assert_error(resp, 403)
