from .health import router as health_router
from .semester import router as semester_router
from .streak import router as streak_router
from .message import router as message_router

__all__ = ["health_router", "semester_router", "streak_router", "message_router"]