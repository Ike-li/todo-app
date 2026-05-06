import pytest
import allure
from api.endpoints import CATEGORIES
from utils.generators import random_name, random_color


@pytest.fixture
def sample_category(authed) -> dict:
    name = random_name("cat")
    with allure.step(f"Create sample category: {name}"):
        resp = authed.post(CATEGORIES, json={
            "name": name,
            "color": random_color(),
        })
        assert resp.status_code == 201
        cat = resp.json()
    yield cat
    with allure.step("Cleanup: delete sample category"):
        try:
            authed.delete(f"/categories/{cat['id']}")
        except Exception:
            pass
