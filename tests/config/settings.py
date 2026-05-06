import os
from pathlib import Path
from typing import Optional
import yaml
from dotenv import load_dotenv

load_dotenv()

def get_config(env: Optional[str] = None):
    env = env or os.getenv("TEST_ENV", "local")
    config_path = Path(__file__).parent / "environments.yaml"
    with open(config_path) as f:
        cfg = yaml.safe_load(f)[env]
    # Allow env var overrides
    cfg["base_url"] = os.getenv("API_BASE_URL", cfg["base_url"])
    cfg["email"] = os.getenv("TEST_EMAIL", cfg["email"])
    cfg["password"] = os.getenv("TEST_PASSWORD", cfg["password"])
    return type("Config", (), cfg)
