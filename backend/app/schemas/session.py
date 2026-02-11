from pydantic import BaseModel, ConfigDict
from datetime import date, datetime

class SessionStart(BaseModel):
    semester_id: int
    user_id: int
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)


class SessionStop(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: int

class SessionAdminAdjustment(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: int
    session_date: date
    duration: int  # duration in minutes

class SessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    semester_id: int
    status: str
    duration: int | None
    start_time: datetime
    end_time: datetime | None
    description: str | None
    created_at: datetime
    updated_at: datetime
    session_date: date