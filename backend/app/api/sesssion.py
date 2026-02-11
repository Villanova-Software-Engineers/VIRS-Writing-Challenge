from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.session import Session as SessionModel
from app.schemas.session import SessionStart, SessionStop, SessionAdminAdjustment, SessionRead
from app.crud.session import create_session, stop_session, adjust_session_admin, get_current_session, get_user_sessions
from app.core import get_db
from sqlalchemy.exc import IntegrityError
from app.rate_limiter import limiter

"""
/api/sessions
POST start
POST stop
GET current session
GET user sessions


DB last in parameters
no comments
crud in crud api in api
no comments
init
keep current status
find all users
find all user sesssio
find a single session
add rate limiters
follow JAylens new project
Raise value as e
Change all DBSessions to Sessions
Push to your own branch
pull from main to get current stuff
"""
router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("/start", response_model=SessionRead)
@limiter.limit("10/minute;100/hour")
async def start_session_handler(data: SessionStart, db: Session = Depends(get_db)):
    try:
        return create_session(data, db)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Session for this user on this date already exists"
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start session"
        )


@router.post("/stop", response_model=SessionRead)
async def stop_session_handler(data: SessionStop, db: Session = Depends(get_db)):
    try:
        session = stop_session(data.user_id, db)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Active session not found"
            )
        return session
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to stop session"
        )


@router.post("/admin/adjust", response_model=SessionRead)
async def admin_adjust_session_handler(data: SessionAdminAdjustment, db: Session = Depends(get_db)):
    try:
        session = adjust_session_admin(data, db)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        return session
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to adjust session"
        )


@router.get("/user/{user_id}", response_model=list[SessionRead])
async def get_user_sessions_handler(user_id: int, db: Session = Depends(get_db)):
    try:
        return get_user_sessions(user_id, db)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve sessions"
        )


@router.get("/current/{user_id}", response_model=SessionRead | None)
async def get_current_session_handler(user_id: int, db: Session = Depends(get_db)):
    try:
        return get_current_session(user_id, db)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve current session"
        )
    

