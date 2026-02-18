from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ReplyCreate(BaseModel):
    author: str
    department: str
    avatar: str
    content: str
    color: str


class ReplyResponse(BaseModel):
    id: int
    author: str
    department: str
    avatar: str
    content: str
    timestamp: str
    color: str

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    author: str
    department: str
    avatar: str
    content: str
    color: str


class MessageResponse(BaseModel):
    id: int
    author: str
    department: str
    avatar: str
    content: str
    timestamp: str
    color: str
    likes: int
    liked: bool
    replies: List[ReplyResponse] = []

    class Config:
        from_attributes = True


class LikeCreate(BaseModel):
    message_id: int