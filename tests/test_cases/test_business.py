"""L3 Business Logic Tests - Data Consistency and Chain Operations."""
import pytest
import allure
from api.endpoints import TODOS, TODO_DETAIL, TODO_TOGGLE, TODO_SUBTASKS, CATEGORIES, CATEGORY_DETAIL, TAGS, TAG_DETAIL
from utils.assertions import assert_success, assert_error, assert_message_response
from utils.generators import random_title, random_name, random_color


@allure.epic("Business Logic")
@allure.feature("Category-Todo Relationship")
class TestCategoryTodoRelationship:

    @allure.story("Cascade behavior")
    @allure.title("Deleting category sets todo categoryId to null")
    def test_delete_category_nullifies_todo(self, authed, sample_todo_with_category):
        cat_id = sample_todo_with_category["category"]["id"]

        # Delete category
        del_resp = authed.delete(CATEGORY_DETAIL.format(id=cat_id))
        assert_message_response(del_resp, 200, "deleted")

        # Verify todo's category is now null
        todo_resp = authed.get(TODO_DETAIL.format(id=sample_todo_with_category["id"]))
        assert_success(todo_resp, 200)
        assert todo_resp.json()["category"] is None

    @allure.story("Cascade behavior")
    @allure.title("Todo itself is NOT deleted when category is deleted")
    def test_todo_survives_category_deletion(self, authed, sample_todo_with_category):
        cat_id = sample_todo_with_category["category"]["id"]
        todo_id = sample_todo_with_category["id"]

        authed.delete(CATEGORY_DETAIL.format(id=cat_id))

        todo_resp = authed.get(TODO_DETAIL.format(id=todo_id))
        assert_success(todo_resp, 200)
        assert todo_resp.json()["id"] == todo_id


@allure.epic("Business Logic")
@allure.feature("Tag Lifecycle")
class TestTagLifecycle:

    @allure.story("Usage protection")
    @allure.title("Cannot delete tag still attached to todos")
    def test_delete_tag_in_use(self, authed, sample_todo_with_tags):
        tag_name = sample_todo_with_tags["tags"][0]["tag"]["name"]
        tags_resp = authed.get(TAGS)
        tag = next(t for t in tags_resp.json() if t["name"] == tag_name)

        resp = authed.delete(TAG_DETAIL.format(id=tag["id"]))
        assert_error(resp, 409, "still attached")

    @allure.story("Usage protection")
    @allure.title("Can delete tag after removing from all todos")
    def test_delete_tag_after_removal(self, authed, sample_todo_with_tags):
        todo_id = sample_todo_with_tags["id"]
        tag_name = sample_todo_with_tags["tags"][0]["tag"]["name"]

        # Remove tag from todo
        authed.patch(TODO_DETAIL.format(id=todo_id), json={"tags": []})

        # Find and delete the tag
        tags_resp = authed.get(TAGS)
        tag = next(t for t in tags_resp.json() if t["name"] == tag_name)
        del_resp = authed.delete(TAG_DETAIL.format(id=tag["id"]))
        assert_message_response(del_resp, 200, "deleted")


@allure.epic("Business Logic")
@allure.feature("Parent-Child Tasks")
class TestParentChildTasks:

    @allure.story("Cascade delete")
    @allure.title("Deleting parent cascades to all sub-tasks")
    def test_cascade_delete(self, authed):
        parent = authed.post(TODOS, json={"title": random_title()}).json()
        child1 = authed.post(TODOS, json={"title": random_title(), "parentId": parent["id"]}).json()
        child2 = authed.post(TODOS, json={"title": random_title(), "parentId": parent["id"]}).json()

        authed.delete(TODO_DETAIL.format(id=parent["id"]))

        assert_error(authed.get(TODO_DETAIL.format(id=child1["id"])), 404)
        assert_error(authed.get(TODO_DETAIL.format(id=child2["id"])), 404)

    @allure.story("Self-reference")
    @allure.title("Setting parentId to self returns 403")
    def test_self_reference(self, authed, sample_todo):
        resp = authed.patch(
            TODO_DETAIL.format(id=sample_todo["id"]),
            json={"parentId": sample_todo["id"]},
        )
        assert_error(resp, 403, "cannot be its own parent")

    @allure.story("Sub-task listing")
    @allure.title("GET subtasks returns children of a todo")
    def test_list_subtasks(self, authed):
        parent = authed.post(TODOS, json={"title": random_title()}).json()
        child = authed.post(TODOS, json={"title": random_title(), "parentId": parent["id"]}).json()

        resp = authed.get(TODO_SUBTASKS.format(id=parent["id"]))
        assert_success(resp, 200)
        child_ids = [t["id"] for t in resp.json()]
        assert child["id"] in child_ids

        # Cleanup
        authed.delete(TODO_DETAIL.format(id=parent["id"]))


@allure.epic("Business Logic")
@allure.feature("Reorder Validation")
class TestReorderValidation:

    @allure.story("Validation")
    @allure.title("Reorder with nonexistent todo ID returns 404")
    def test_reorder_invalid_id(self, authed):
        resp = authed.patch("/todos/reorder", json={
            "items": [
                {"id": "00000000-0000-0000-0000-000000000000", "position": 0},
            ]
        })
        assert_error(resp, 404, "not found or not accessible")

    @allure.story("Validation")
    @allure.title("Reorder with other user's todo returns 404")
    def test_reorder_other_user(self, authed, second_user_token, sample_todo):
        authed.set_token(second_user_token)
        resp = authed.patch("/todos/reorder", json={
            "items": [{"id": sample_todo["id"], "position": 0}]
        })
        assert_error(resp, 404, "not found or not accessible")
