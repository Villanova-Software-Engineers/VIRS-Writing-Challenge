# Message Board Backend Setup

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the FastAPI server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8001`

## API Endpoints

### GET /api/messages
Fetch all messages (most recent first)

**Response:**
```json
[
  {
    "id": 1,
    "author": "Dr. Sarah Chen",
    "department": "English Literature",
    "avatar": "SC",
    "content": "Message content here...",
    "timestamp": "2024-01-15T10:30:00",
    "color": "from-amber-400 to-orange-400",
    "likes": 8,
    "liked": false,
    "replies": 0
  }
]
```

### POST /api/messages
Create a new message

**Request:**
```json
{
  "author": "You",
  "department": "Your Department",
  "avatar": "YO",
  "content": "Your message here",
  "color": "from-purple-400 to-violet-400"
}
```

### POST /api/messages/{message_id}/like
Like a message

### DELETE /api/messages/{message_id}/like
Unlike a message

### DELETE /api/messages/{message_id}
Delete a message

## Frontend Integration

Update your React component to use the API:
- Use the provided `MessageBoard.jsx` file
- Make sure `API_BASE_URL` matches your backend URL
- The component fetches messages on mount and handles all API calls

## Database

By default, SQLite is used (`messageboard.db`). This file will be created automatically when you run the app.

To use PostgreSQL instead, update `database.py`:
```python
DATABASE_URL = "postgresql://user:password@localhost/messageboard"
```

## Notes

- The `liked` field is currently always `false` in responses because like tracking is per-like in the database (not per user). You can implement user-based tracking if needed.
- The `replies` field is always `0` for now since replies aren't implemented yet.
- CORS is enabled for all origins - restrict this to your frontend URL in production.