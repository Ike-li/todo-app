"""Tag CRUD Tests."""
import pytest
import allure
from api.endpoints import TAGS, TAG_DETAIL
from utils.assertions import assert_success, assert_error, assert_message_response
from utils.generators import random_name


@allure.epic("Tags")
@allure.feature("CRUD")
class TestTags:

    @allure.story("Create")
    @allure.title("Create tag normalizes name to lowercase")
    def test_create_tag_normalized(self, authed):
        resp = authed.post(TAGS, json={"name": "  URGENT  "})
        assert_success(resp, 201)
        assert resp.json()["name"] == "urgent"
        authed.delete(f"/tags/{resp.json()['id']}")

    @allure.story("Create")
    @allure.title("Create duplicate tag returns 409")
    def test_create_duplicate(self, authed, sample_tag):
        resp = authed.post(TAGS, json={"name": sample_tag["name"]})
        assert_error(resp, 409, "already exists")

    @allure.story("Create")
    @allure.title("Create tag with name > 50 chars returns 400")
    def test_create_name_too_long(self, authed):
        resp = authed.post(TAGS, json={"name": "x" * 51})
        assert_error(resp, 400)

    @allure.story("List")
    @allure.title("List tags returns array sorted by name")
    def test_list_tags(self, authed, sample_tag):
        resp = authed.get(TAGS)
        assert_success(resp, 200)
        names = [t["name"] for t in resp.json()]
        assert names == sorted(names)

    @allure.story("Delete")
    @allure.title("Delete tag in use returns 409")
    def test_delete_tag_in_use(self, authed, sample_todo_with_tags):
        tag_name = sample_todo_with_tags["tags"][0]["tag"]["name"]
        # Find the tag ID
        tags_resp = authed.get(TAGS)
        tag = next(t for t in tags_resp.json() if t["name"] == tag_name)
        resp = authed.delete(TAG_DETAIL.format(id=tag["id"]))
        assert_error(resp, 409, "still attached")

    @allure.story("Delete")
    @allure.title("Delete unused tag returns success")
    def test_delete_unused_tag(self, authed):
        tag = authed.post(TAGS, json={"name": random_name("del").lower()}).json()
        resp = authed.delete(TAG_DETAIL.format(id=tag["id"]))
        assert_message_response(resp, 200, "deleted")
