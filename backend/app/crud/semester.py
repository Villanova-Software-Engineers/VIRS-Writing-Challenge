from sqlalchemy.orm import Session
from app.models import Semester
from app.schemas import SemesterCreate
from datetime import datetime
import secrets
import string


def generate_access_code(length: int = 8) -> str:
    """Generate a random access code for semester registration"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


def create_semester(data: SemesterCreate, db: Session):
    """Create a new semester with a unique access code - admin only"""
    access_code = generate_access_code()
    
    while db.query(Semester).filter(Semester.access_code == access_code).first():
        access_code = generate_access_code()
    
    semester_data = data.model_dump()
    semester_data['access_code'] = access_code
    semester_data['is_active'] = True
    
    db_semester = Semester(**semester_data)
    db.add(db_semester)
    db.commit()
    db.refresh(db_semester)
    return db_semester


def get_active_semester(db: Session):
    """Fetch the currently active semester"""
    return db.query(Semester).filter(Semester.is_active == True).first()


def get_semester(id: int, db: Session):
    """Get a specific semester by ID"""
    return db.query(Semester).filter(Semester.id == id).first()


def end_semester(id: int, db: Session):
    """End an active semester - marks it as inactive and archives it"""
    db_semester = get_semester(id, db)
    if not db_semester:
        return None
    
    # Mark semester as inactive
    db_semester.is_active = False
    db_semester.ended_at = datetime.utcnow()
    
    # TODO: If auto_clear is True, trigger data cleanup
    # This will involve deleting/archiving:
    # - Message board posts
    # - Sessions
    # - Streaks
    # - Leaderboard data
    # Implementation deferred until those models are created
    
    db.commit()
    db.refresh(db_semester)
    return db_semester


def get_semesters(skip: int, limit: int, db: Session):
    """Get all semesters (active and archived) - admin only"""
    return db.query(Semester).offset(skip).limit(limit).all()