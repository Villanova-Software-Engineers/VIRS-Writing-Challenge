from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# SQLite database (simple, no external setup needed)
# Change to PostgreSQL connection string if needed
DATABASE_URL = "sqlite:///./messageboard.db"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Only for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)