"""Todo Delete Tests."""
import pytest
import allure
from api.endpoints import TODOS, TODO_DETAIL
from utils.assertions import assert_success, assert_error, assert_message_response
from utils.generators import random_title


@allure.epic("Todos")
@allure.feature("Delete")
class TestDeleteTodo:

    @allure.story("Success")
    @allure.title("Delete todo returns message")
    def test_delete_success(self, authed):
        resp = authed.post(TODOS, json={"title": random_title()})
        assert_success(resp, 201)
        todo_id = resp.json()["id"]

        del_resp = authed.delete(TODO_DETAIL.format(id=todo_id))
        assert_message_response(del_resp, 200, "deleted")

    @allure.story("Success")
    @allure.title("Deleted todo returns 404 on subsequent GET")
    def test_delete_then_get_404(self, authed):
        resp = authed.post(TODOS, json={"title": random_title()})
        todo_id = resp.json()["id"]

        authed.delete(TODO_DETAIL.format(id=todo_id))
        get_resp = authed.get(TODO_DETAIL.format(id=todo_id))
        assert_error(get_resp, 404)

    @allure.story("Success")
    @allure.title("Delete parent cascades to sub-tasks")
    def test_delete_cascades_subtasks(self, authed):
        parent = authed.post(TODOS, json={"title": random_title()}).json()
        child = authed.post(TODOS, json={"title": random_title(), "parentId": parent["id"]}).json()

        authed.delete(TODO_DETAIL.format(id=parent["id"]))
        child_resp = authed.get(TODO_DETAIL.format(id=child["id"]))
        assert_error(child_resp, 404)

    @allure.story("Security")
    @allure.title("Delete other user's todo returns 403")
    def test_delete_other_user(self, authed, second_user_token):
        todo = authed.post(TODOS, json={"title": random_title()}).json()
        authed.set_token(second_user_token)
        resp = authed.delete(TODO_DETAIL.format(id=todo["id"]))
        assert_error(resp, 403)

    @allure.story("Error")
    @allure.title("Delete nonexistent todo returns 404")
    def test_delete_nonexistent(self, authed):
        resp = authed.delete(TODO_DETAIL.format(id="00000000-0000-0000-0000-000000000000"))
        assert_error(resp, 404)
