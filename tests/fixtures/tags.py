import pytest
import allure
from api.endpoints import TAGS
from utils.generators import random_name


@pytest.fixture
def sample_tag(authed) -> dict:
    name = random_name("tag").lower()
    with allure.step(f"Create sample tag: {name}"):
        resp = authed.post(TAGS, json={"name": name})
        assert resp.status_code == 201
        tag = resp.json()
    yield tag
    with allure.step("Cleanup: delete sample tag"):
        try:
            authed.delete(f"/tags/{tag['id']}")
        except Exception:
            pass
