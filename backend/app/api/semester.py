from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.schemas import SemesterCreate, SemesterUpdate, SemesterResponse
from app.crud import create_semester, get_active_semester, end_semester, get_semester
from app.core import get_db, limiter
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/semesters", tags=["Semesters"])

@router.get("/active", response_model=SemesterResponse)
@limiter.limit("100/minute;1000/hour")
async def get_active_semester_route(request: Request, db: Session = Depends(get_db)):
    """Get the currently active semester - available to all users"""
    semester = get_active_semester(db)
    if not semester:
        raise HTTPException(status_code=404, detail="No active semester found")
    return semester


@router.post("/", response_model=SemesterResponse)
@limiter.limit("10/minute;100/hour")
async def create_semester_route(
    request: Request, 
    data: SemesterCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Create a new semester - admin only"""
    try:
        existing_active = get_active_semester(db)
        if existing_active:
            raise HTTPException(
                status_code=409, 
                detail="An active semester already exists. Please end it before creating a new one."
            )
        
        semester = create_semester(data, db)
        return semester
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Semester with this access code already exists")


@router.post("/{id}/end", response_model=SemesterResponse)
@limiter.limit("5/minute;50/hour")
async def end_semester_route(
    request: Request,
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """End a semester early - admin only"""
    semester = get_semester(id, db)
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")
    
    if not semester.is_active:
        raise HTTPException(status_code=400, detail="Semester is already ended")
    
    ended_semester = end_semester(id, db)
    return ended_semester