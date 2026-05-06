"""Todo Update Tests."""
import pytest
import allure
from api.endpoints import TODO_DETAIL
from utils.assertions import assert_success, assert_error, assert_todo
from utils.generators import random_title


@allure.epic("Todos")
@allure.feature("Update")
class TestUpdateTodo:

    @allure.story("Success")
    @allure.title("Update title only")
    def test_update_title(self, authed, sample_todo):
        new_title = random_title()
        resp = authed.patch(TODO_DETAIL.format(id=sample_todo["id"]), json={"title": new_title})
        assert_success(resp, 200)
        assert resp.json()["title"] == new_title

    @allure.story("Success")
    @allure.title("Clear description with null")
    def test_clear_description(self, authed, sample_todo):
        resp = authed.patch(TODO_DETAIL.format(id=sample_todo["id"]), json={"description": None})
        assert_success(resp, 200)
        assert resp.json()["description"] is None

    @allure.story("Success")
    @allure.title("Replace tags")
    def test_replace_tags(self, authed, sample_todo_with_tags):
        resp = authed.patch(
            TODO_DETAIL.format(id=sample_todo_with_tags["id"]),
            json={"tags": ["new-tag-1", "new-tag-2"]},
        )
        assert_success(resp, 200)
        tag_names = [t["tag"]["name"] for t in resp.json()["tags"]]
        assert "new-tag-1" in tag_names

    @allure.story("Success")
    @allure.title("Clear all tags with empty array")
    def test_clear_tags(self, authed, sample_todo_with_tags):
        resp = authed.patch(
            TODO_DETAIL.format(id=sample_todo_with_tags["id"]),
            json={"tags": []},
        )
        assert_success(resp, 200)
        assert len(resp.json()["tags"]) == 0

    @allure.story("Success")
    @allure.title("Disconnect category with null")
    def test_disconnect_category(self, authed, sample_todo_with_category):
        resp = authed.patch(
            TODO_DETAIL.format(id=sample_todo_with_category["id"]),
            json={"categoryId": None},
        )
        assert_success(resp, 200)
        assert resp.json()["category"] is None

    @allure.story("Security")
    @allure.title("parentId = self returns 403")
    def test_parent_self_reference(self, authed, sample_todo):
        resp = authed.patch(
            TODO_DETAIL.format(id=sample_todo["id"]),
            json={"parentId": sample_todo["id"]},
        )
        assert_error(resp, 403, "cannot be its own parent")

    @allure.story("Security")
    @allure.title("Update other user's todo returns 403")
    def test_update_other_user_todo(self, authed, second_user_token, sample_todo):
        authed.set_token(second_user_token)
        resp = authed.patch(TODO_DETAIL.format(id=sample_todo["id"]), json={"title": "Hacked"})
        assert_error(resp, 403)

    @allure.story("Error")
    @allure.title("Update nonexistent todo returns 404")
    def test_update_nonexistent(self, authed):
        resp = authed.patch(
            TODO_DETAIL.format(id="00000000-0000-0000-0000-000000000000"),
            json={"title": "X"},
        )
        assert_error(resp, 404)
