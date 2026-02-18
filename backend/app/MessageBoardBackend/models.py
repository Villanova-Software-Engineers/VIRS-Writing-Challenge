from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    author = Column(String, index=True)
    department = Column(String)
    avatar = Column(String)
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    color = Column(String)
    
    likes = relationship("Like", back_populates="message", cascade="all, delete-orphan")
    replies = relationship("Reply", back_populates="message", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "author": self.author,
            "department": self.department,
            "avatar": self.avatar,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "color": self.color,
            "likes": len(self.likes),
            "liked": False,
            "replies": len(self.replies)
        }


class Like(Base):
    __tablename__ = "likes"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    message = relationship("Message", back_populates="likes")


class Reply(Base):
    __tablename__ = "replies"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), index=True)
    author = Column(String, index=True)
    department = Column(String)
    avatar = Column(String)
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    color = Column(String)
    
    message = relationship("Message", back_populates="replies")