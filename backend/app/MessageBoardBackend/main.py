from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc
from contextlib import contextmanager
import os

from models import Base, Message, Like, Reply
from schemas import MessageCreate, MessageResponse, LikeCreate, ReplyCreate
from database import engine, SessionLocal

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Message Board API")

# Enable CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes

@app.get("/api/messages", response_model=list[MessageResponse])
def get_messages(db: Session = Depends(get_db)):
    """Fetch all messages ordered by most recent first"""
    try:
        messages = db.query(Message).order_by(desc(Message.timestamp)).all()
        
        result = []
        for msg in messages:
            replies = [
                {
                    "id": reply.id,
                    "author": reply.author,
                    "department": reply.department,
                    "avatar": reply.avatar,
                    "content": reply.content,
                    "timestamp": reply.timestamp.isoformat(),
                    "color": reply.color,
                }
                for reply in msg.replies
            ]
            msg_dict = {
                "id": msg.id,
                "author": msg.author,
                "department": msg.department,
                "avatar": msg.avatar,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat(),
                "color": msg.color,
                "likes": len(msg.likes),
                "liked": False,
                "replies": replies
            }
            result.append(msg_dict)
        
        return result
    except Exception as e:
        print(f"Error fetching messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/messages", response_model=MessageResponse)
def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    """Create a new message"""
    try:
        db_message = Message(
            author=message.author,
            department=message.department,
            avatar=message.avatar,
            content=message.content,
            color=message.color
        )
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        
        return {
            "id": db_message.id,
            "author": db_message.author,
            "department": db_message.department,
            "avatar": db_message.avatar,
            "content": db_message.content,
            "timestamp": db_message.timestamp.isoformat(),
            "color": db_message.color,
            "likes": 0,
            "liked": False,
            "replies": []
        }
    except Exception as e:
        print(f"Error creating message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/messages/{message_id}/replies")
def create_reply(message_id: int, reply: ReplyCreate, db: Session = Depends(get_db)):
    """Add a reply to a message"""
    try:
        message = db.query(Message).filter(Message.id == message_id).first()
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        db_reply = Reply(
            message_id=message_id,
            author=reply.author,
            department=reply.department,
            avatar=reply.avatar,
            content=reply.content,
            color=reply.color
        )
        db.add(db_reply)
        db.commit()
        db.refresh(db_reply)
        
        return {
            "id": db_reply.id,
            "author": db_reply.author,
            "department": db_reply.department,
            "avatar": db_reply.avatar,
            "content": db_reply.content,
            "timestamp": db_reply.timestamp.isoformat(),
            "color": db_reply.color,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating reply: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/messages/{message_id}")
def update_message(message_id: int, update_data: dict, db: Session = Depends(get_db)):
    """Update a message"""
    try:
        message = db.query(Message).filter(Message.id == message_id).first()
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        if "content" in update_data:
            message.content = update_data["content"]
        
        db.commit()
        db.refresh(message)
        
        replies = [
            {
                "id": reply.id,
                "author": reply.author,
                "department": reply.department,
                "avatar": reply.avatar,
                "content": reply.content,
                "timestamp": reply.timestamp.isoformat(),
                "color": reply.color,
            }
            for reply in message.replies
        ]
        
        return {
            "id": message.id,
            "author": message.author,
            "department": message.department,
            "avatar": message.avatar,
            "content": message.content,
            "timestamp": message.timestamp.isoformat(),
            "color": message.color,
            "likes": len(message.likes),
            "liked": False,
            "replies": replies
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/replies/{reply_id}")
def delete_reply(reply_id: int, db: Session = Depends(get_db)):
    """Delete a reply"""
    try:
        reply = db.query(Reply).filter(Reply.id == reply_id).first()
        if not reply:
            raise HTTPException(status_code=404, detail="Reply not found")
        
        db.delete(reply)
        db.commit()
        
        return {"deleted": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting reply: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/messages/{message_id}/like")
def like_message(message_id: int, db: Session = Depends(get_db)):
    """Like a message"""
    try:
        message = db.query(Message).filter(Message.id == message_id).first()
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        # Check if already liked
        existing_like = db.query(Like).filter(Like.message_id == message_id).first()
        if existing_like:
            raise HTTPException(status_code=400, detail="Already liked")
        
        like = Like(message_id=message_id)
        db.add(like)
        db.commit()
        db.refresh(message)
        
        return {"likes": len(message.likes), "liked": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error liking message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/messages/{message_id}/like")
def unlike_message(message_id: int, db: Session = Depends(get_db)):
    """Unlike a message"""
    try:
        message = db.query(Message).filter(Message.id == message_id).first()
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        like = db.query(Like).filter(Like.message_id == message_id).first()
        if not like:
            raise HTTPException(status_code=404, detail="Like not found")
        
        db.delete(like)
        db.commit()
        db.refresh(message)
        
        return {"likes": len(message.likes), "liked": False}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error unliking message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/messages/{message_id}")
def delete_message(message_id: int, db: Session = Depends(get_db)):
    """Delete a message"""
    try:
        message = db.query(Message).filter(Message.id == message_id).first()
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        db.delete(message)
        db.commit()
        
        return {"deleted": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Message Board API is running"}