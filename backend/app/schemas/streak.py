from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class StreakResponse(BaseModel):
    user_id: str
    count: int
    last_updated: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
