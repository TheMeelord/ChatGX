import json

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette.websockets import WebSocketDisconnect, WebSocket

from src.data.config import get_db
from src.data.data_storage import DataStorage
from src.data.repository.chat_repository import chat_repository
from src.data.repository.token_repository import token_repository
from src.data.repository.user_repository import user_repository

websocket_router = APIRouter()
DATA_STORAGE = DataStorage().get_instance()

class NotifyMessageWS(BaseModel):
    chat_id: str
@websocket_router.websocket("/connect/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    token_repo = token_repository(db)
    user_repo = user_repository(db)
    chat_repo = chat_repository(db)

    await websocket.accept()
    user = await user_repo.get_user_by_token(token, token_repo)
    if user:
        await DATA_STORAGE.connect(user.id, websocket, chat_repo)
        try:
            while True:
                data = await websocket.receive_text()
                data_dict = json.loads(data)
                message = NotifyMessageWS(**data_dict)

                await DATA_STORAGE.notify_message(message.chat_id, user.id, chat_repo)
        except WebSocketDisconnect:
            print(f"User {user.username} disconnected")
            await DATA_STORAGE.disconnect(user.id, websocket)
    else:
        await websocket.send_text("Invalid token")
        await websocket.close()