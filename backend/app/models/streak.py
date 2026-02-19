from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from app.core import Base


class Streak(Base):
    __tablename__ = "streaks"

    id = Column(Integer, primary_key=True, index=True)

    # Firebase UID — one streak record per user
    user_id = Column(String, unique=True, nullable=False, index=True)

    count = Column(Integer, default=0, nullable=False)

    # UTC timestamp of the last increment — used to enforce the 24-hour rule
    last_updated = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Streak(user_id='{self.user_id}', count={self.count}, last_updated={self.last_updated})>"
