from sqlalchemy import Column, Date, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core import Base

class Session(Base):
    __tablename__ = 'sessions'
    __table_args__ = (
        UniqueConstraint("user_id", "session_date")
        )


    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=False)
    status = Column(String, default="active", nullable=False)
    duration = Column(Integer, nullable=True)  # duration in minutes
    start_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    session_date = Column(Date, nullable=False)