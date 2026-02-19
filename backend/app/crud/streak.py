from sqlalchemy.orm import Session
from app.models import Streak
from datetime import datetime, timezone, timedelta


def get_or_create_streak(user_id: str, db: Session) -> Streak:
    """Fetch a user's streak row, or create one if it doesn't exist yet."""
    streak = db.query(Streak).filter(Streak.user_id == user_id).first()
    if not streak:
        streak = Streak(user_id=user_id, count=0, last_updated=None)
        db.add(streak)
        db.commit()
        db.refresh(streak)
    return streak


def increment_streak(user_id: str, db: Session) -> Streak:
    """
    Increment the streak count for a user, but only once per 24-hour window.

    Returns the (potentially unchanged) streak object so the caller
    can always read the current count.
    """
    streak = get_or_create_streak(user_id, db)
    now = datetime.now(timezone.utc)

    # Guard: has it been at least 24 hours since the last increment?
    if streak.last_updated is not None:
        last = streak.last_updated
        # Ensure last_updated is timezone-aware for safe comparison
        if last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
        if now - last < timedelta(hours=24):
            # Already incremented within the last 24 hours — return as-is
            return streak

    streak.count += 1
    streak.last_updated = now
    db.commit()
    db.refresh(streak)
    return streak
