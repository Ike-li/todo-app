import pytest
import allure
from api.endpoints import TODOS
from utils.generators import random_title, random_name


@pytest.fixture
def sample_todo(authed) -> dict:
    """Create a sample todo and clean up after test."""
    title = random_title()
    with allure.step(f"Create sample todo: {title}"):
        resp = authed.post(TODOS, json={"title": title})
        assert resp.status_code == 201
        todo = resp.json()
    yield todo
    with allure.step("Cleanup: delete sample todo"):
        try:
            authed.delete(f"/todos/{todo['id']}")
        except Exception:
            pass


@pytest.fixture
def sample_todo_with_category(authed, sample_category) -> dict:
    """Create a todo with a category."""
    resp = authed.post(TODOS, json={
        "title": random_title(),
        "categoryId": sample_category["id"],
    })
    assert resp.status_code == 201
    yield resp.json()


@pytest.fixture
def sample_todo_with_tags(authed) -> dict:
    """Create a todo with unique tags."""
    tag_a = random_name("tag").lower()
    tag_b = random_name("tag").lower()
    resp = authed.post(TODOS, json={
        "title": random_title(),
        "tags": [tag_a, tag_b],
    })
    assert resp.status_code == 201
    todo = resp.json()
    # Store tag names for test assertions
    todo["_tag_names"] = [tag_a, tag_b]
    yield todo
