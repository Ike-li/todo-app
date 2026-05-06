from uuid import uuid4


def random_email() -> str:
    return f"test_{uuid4().hex[:8]}@example.com"


def random_title() -> str:
    return f"Todo {uuid4().hex[:8]}"


def random_name(prefix: str = "item") -> str:
    return f"{prefix}_{uuid4().hex[:8]}"


def random_color() -> str:
    return f"#{uuid4().hex[:6]}"
