from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class ReplyBase(BaseModel):
    author: str
    department: str
    avatar: str
    content: str
    color: str

class ReplyCreate(ReplyBase):
    pass

class ReplyResponse(ReplyBase):
    id: int
    message_id: int
    timestamp: datetime  # Changed to datetime for better type safety
    
    model_config = ConfigDict(from_attributes=True)

class MessageBase(BaseModel):
    author: str
    department: str
    avatar: str
    content: str
    color: str

class MessageCreate(MessageBase):
    pass

class MessageUpdate(BaseModel):
    content: str

class MessageResponse(MessageBase):
    id: int
    timestamp: datetime
    likes: int = 0
    liked: bool = False
    replies: List[ReplyResponse] = []

    model_config = ConfigDict(from_attributes=True)

class LikeCreate(BaseModel):
    message_id: int
