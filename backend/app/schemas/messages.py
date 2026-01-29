from pydantic import BaseModel

class Message(BaseModel):
    author: str
    message_id: str
    content: str
    timestamp: datetime
    reply_to: Message | None = None
    replies: list[Message] = []

class MessageCreate(Message):
    pass

