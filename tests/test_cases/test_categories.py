"""Category CRUD Tests."""
import pytest
import allure
from api.endpoints import CATEGORIES, CATEGORY_DETAIL
from utils.assertions import assert_success, assert_error, assert_message_response
from utils.generators import random_name, random_color


@allure.epic("Categories")
@allure.feature("CRUD")
class TestCategories:

    @allure.story("Create")
    @allure.title("Create category with name and color")
    def test_create_category(self, authed):
        name = random_name("cat")
        resp = authed.post(CATEGORIES, json={"name": name, "color": "#3498db"})
        assert_success(resp, 201)
        assert resp.json()["name"] == name
        assert resp.json()["color"] == "#3498db"
        authed.delete(f"/categories/{resp.json()['id']}")

    @allure.story("Create")
    @allure.title("Create duplicate category name returns 409")
    def test_create_duplicate(self, authed, sample_category):
        resp = authed.post(CATEGORIES, json={"name": sample_category["name"]})
        assert_error(resp, 409, "already exists")

    @allure.story("Create")
    @allure.title("Create with invalid color returns 400")
    def test_create_invalid_color(self, authed):
        resp = authed.post(CATEGORIES, json={"name": random_name(), "color": "red"})
        assert_error(resp, 400)

    @allure.story("List")
    @allure.title("List categories returns array sorted by name")
    def test_list_categories(self, authed, sample_category):
        resp = authed.get(CATEGORIES)
        assert_success(resp, 200)
        assert isinstance(resp.json(), list)
        names = [c["name"] for c in resp.json()]
        assert names == sorted(names)

    @allure.story("Detail")
    @allure.title("Get category by ID")
    def test_get_category(self, authed, sample_category):
        resp = authed.get(CATEGORY_DETAIL.format(id=sample_category["id"]))
        assert_success(resp, 200)
        assert resp.json()["id"] == sample_category["id"]

    @allure.story("Detail")
    @allure.title("Get other user's category returns 403")
    def test_get_other_user_category(self, authed, second_user_token, sample_category):
        authed.set_token(second_user_token)
        resp = authed.get(CATEGORY_DETAIL.format(id=sample_category["id"]))
        assert_error(resp, 403)

    @allure.story("Update")
    @allure.title("Update category name")
    def test_update_category(self, authed, sample_category):
        new_name = random_name("updated")
        resp = authed.patch(
            CATEGORY_DETAIL.format(id=sample_category["id"]),
            json={"name": new_name},
        )
        assert_success(resp, 200)
        assert resp.json()["name"] == new_name

    @allure.story("Update")
    @allure.title("Rename to existing name returns 409")
    def test_update_name_conflict(self, authed, sample_category):
        # Create another category
        other = authed.post(CATEGORIES, json={"name": random_name("other")}).json()
        resp = authed.patch(
            CATEGORY_DETAIL.format(id=other["id"]),
            json={"name": sample_category["name"]},
        )
        assert_error(resp, 409)
        authed.delete(f"/categories/{other['id']}")

    @allure.story("Delete")
    @allure.title("Delete category sets todo categoryId to null")
    def test_delete_category_nullifies_todo(self, authed, sample_todo_with_category):
        cat_id = sample_todo_with_category["category"]["id"]
        resp = authed.delete(CATEGORY_DETAIL.format(id=cat_id))
        assert_message_response(resp, 200, "deleted")

        # Verify todo's category is null
        todo_resp = authed.get(f"/todos/{sample_todo_with_category['id']}")
        assert todo_resp.json()["category"] is None
