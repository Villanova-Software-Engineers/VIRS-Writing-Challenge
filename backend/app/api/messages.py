from fastapi import APIRouter, Response, Request

router = APIRouter(prefix="/messages")

@router.get("/")
async def get_messages():
    return {"message": "Hello, world!"}

@router.post("/")
async def create_message(request: Request):
    return {"message": "Hello, world!"}

@router.delete("/{message_id}")
async def delete_message(message_id: str):
    return {"message": "Hello, world!"}

print("Hello, world!")
