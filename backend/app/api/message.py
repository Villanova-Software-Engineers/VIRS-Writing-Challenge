from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List

from app.core import get_db, limiter
from app.schemas.message import MessageCreate, MessageResponse, ReplyCreate, ReplyResponse, MessageUpdate
from app.crud.message import (
    get_messages as crud_get_messages,
    create_message as crud_create_message,
    get_message as crud_get_message,
    delete_message as crud_delete_message,
    update_message as crud_update_message,
    create_reply as crud_create_reply,
    delete_reply as crud_delete_reply,
    like_message as crud_like_message,
    unlike_message as crud_unlike_message
)
from app.models.message import Message

router = APIRouter(prefix="/messages", tags=["Message Board"])

@router.get("", response_model=List[MessageResponse])
@limiter.limit("100/minute")
async def get_messages(
    request: Request,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Fetch all messages ordered by most recent first"""
    # The CRUD function supports skip/limit logic now
    messages = crud_get_messages(db, skip=skip, limit=limit)
    return messages

@router.post("", response_model=MessageResponse)
@limiter.limit("10/minute")
async def create_message(
    request: Request, 
    message: MessageCreate, 
    db: Session = Depends(get_db)
):
    """Create a new message"""
    new_message = crud_create_message(db, message)
    
    # Return structure matching schema
    # Pydantic's from_attributes handles the DB model to Pydantic model conversion mostly,
    # but likes/liked fields are computed properties not on the DB model directly in the same way.
    # We construct a dict or object that has these properties.
    return {
        "id": new_message.id,
        "author": new_message.author,
        "department": new_message.department,
        "avatar": new_message.avatar,
        "content": new_message.content,
        "timestamp": new_message.timestamp,
        "color": new_message.color,
        "likes": 0,
        "liked": False,
        "replies": []
    }

@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
async def delete_message(
    request: Request,
    message_id: int, 
    db: Session = Depends(get_db)
):
    """Delete a message"""
    success = crud_delete_message(db, message_id)
    if not success:
        raise HTTPException(status_code=404, detail="Message not found")
    return

@router.put("/{message_id}", response_model=MessageResponse)
@limiter.limit("10/minute")
async def update_message(
    request: Request,
    message_id: int,
    message: MessageUpdate,
    db: Session = Depends(get_db)
):
    """Update a message"""
    updated_message = crud_update_message(db, message_id, message)
    if not updated_message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Return structure matching schema
    return {
        "id": updated_message.id,
        "author": updated_message.author,
        "department": updated_message.department,
        "avatar": updated_message.avatar,
        "content": updated_message.content,
        "timestamp": updated_message.timestamp,
        "color": updated_message.color,
        "likes": len(updated_message.likes),
        "liked": False,
        "replies": updated_message.replies
    }

@router.post("/{message_id}/replies", response_model=ReplyResponse)
@limiter.limit("20/minute")
async def create_reply(
    request: Request,
    message_id: int, 
    reply: ReplyCreate, 
    db: Session = Depends(get_db)
):
    """Add a reply to a message"""
    # Verify message exists first
    msg = crud_get_message(db, message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    new_reply = crud_create_reply(db, message_id, reply)
    return new_reply

@router.delete("/replies/{reply_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
async def delete_reply(
    request: Request,
    reply_id: int, 
    db: Session = Depends(get_db)
):
    """Delete a reply"""
    success = crud_delete_reply(db, reply_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reply not found")
    return

@router.post("/{message_id}/like")
@limiter.limit("50/minute")
async def like_message(
    request: Request,
    message_id: int, 
    db: Session = Depends(get_db)
):
    """Like a message"""
    msg = crud_get_message(db, message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    # Check if already liked logic is handled in CRUD or we just add
    # Ideally should be per user, but for now we just increment
    try:
        crud_like_message(db, message_id)
    except Exception:
        # If dual-write or unique constraint violation
        pass
    
    # Return updated likes count
    db.refresh(msg)
    return {"likes": len(msg.likes), "liked": True}

@router.delete("/{message_id}/like")
@limiter.limit("50/minute")
async def unlike_message(
    request: Request,
    message_id: int, 
    db: Session = Depends(get_db)
):
    """Unlike a message"""
    msg = crud_get_message(db, message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    crud_unlike_message(db, message_id)
    
    # Return updated likes count
    db.refresh(msg)
    return {"likes": len(msg.likes), "liked": False}
