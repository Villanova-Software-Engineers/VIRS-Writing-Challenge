from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.schemas.streak import StreakResponse
from app.crud.streak import get_or_create_streak, increment_streak
from app.core import get_db, limiter
from app.auth import get_current_user

router = APIRouter(prefix="/user/streak", tags=["Streak"])


@router.get("", response_model=StreakResponse)
@limiter.limit("100/minute;1000/hour")
async def get_streak_route(
    request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the authenticated user's current streak."""
    streak = get_or_create_streak(user_id=current_user.uid, db=db)
    return streak


@router.patch("", response_model=StreakResponse)
@limiter.limit("30/minute;200/hour")
async def increment_streak_route(
    request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Attempt to increment the authenticated user's streak.

    The 24-hour guard lives in the CRUD layer — if the streak was already
    incremented within the last 24 hours, the count is left untouched and
    the current streak is returned unchanged (idempotent).
    """
    streak = increment_streak(user_id=current_user.uid, db=db)
    return streak
