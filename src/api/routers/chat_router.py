from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.api.dto.ChatDto import ChatCreationRequest, ChatCreationResponse, MessageDto, ChatSendMessageResponse, \
    ChatSendMessageRequest, ChatGetAllResponse, ChatHistoryResposne, ChatDto
from src.data.config import get_db
from src.data.data_storage import DataStorage
from src.data.repository.chat_repository import chat_repository
from src.data.repository.token_repository import token_repository
from src.data.repository.user_repository import user_repository

chat_router = APIRouter()
DATA_STORAGE = DataStorage().get_instance()


@chat_router.post("/create", response_model=ChatCreationResponse)
async def create_chat(chat_request: ChatCreationRequest, db: Session = Depends(get_db)):
    token_repo = token_repository(db)
    user_repo = user_repository(db)
    chat_repo = chat_repository(db)
    user = await user_repo.get_user_by_token(chat_request.token, token_repo)
    if user:
        if not await user_repo.is_user_exist_by_id(user.id) or not await user_repo.is_user_exist_by_id(
                chat_request.friend_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if await chat_repo.is_chat_between_users_exist(user.id, chat_request.friend_id):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Chat already exists")

        chat = await chat_repo.create_chat(user.id, chat_request.friend_id)
        await DATA_STORAGE.create_chat(user.id, chat_request.friend_id)
        return ChatCreationResponse(chat_id=chat.id)
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@chat_router.get("/get_all/{token}", response_model=ChatGetAllResponse)
async def get_all_chats(token: str, db: Session = Depends(get_db)):
    token_repo = token_repository(db)
    user_repo = user_repository(db)
    chat_repo = chat_repository(db)

    user = await user_repo.get_user_by_token(token, token_repo)
    if user:
        chats = await chat_repo.get_all_chats_by_user_id(user.id)
        response = ChatGetAllResponse(chats=[])
        for chat in chats:
            friend_id = None
            if user.id == chat.user1_id:
                friend_id = chat.user2_id
            elif user.id == chat.user2_id:
                friend_id = chat.user1_id

            if friend_id is None:
                continue
            friend_username = await user_repo.get_username_by_id(friend_id)
            friend_status = "online" if await DATA_STORAGE.is_online(friend_id) else "offline"
            response.chats += [ChatDto(id=chat.id, friend_id=friend_id, friend_username=friend_username,
                                       friend_status=friend_status)]
        return response
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@chat_router.get("/history/{token}/{chat_id}", response_model=ChatHistoryResposne)
async def get_chat_history(token: str, chat_id: int, db: Session = Depends(get_db)):
    token_repo = token_repository(db)
    user_repo = user_repository(db)
    chat_repo = chat_repository(db)

    user = await user_repo.get_user_by_token(token, token_repo)
    if user:
        history = await chat_repo.get_all_messages_by_chat_id(chat_id)
        history_send = ChatHistoryResposne(chat_id=chat_id, messages=[])
        for message in history:
            history_send.messages += [MessageDto(sender_id=message.sender_id, text=message.message)]
        return history_send
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@chat_router.post("/send", response_model=ChatSendMessageResponse)
async def send_message(message: ChatSendMessageRequest, db: Session = Depends(get_db)):
    token_repo = token_repository(db)
    user_repo = user_repository(db)
    chat_repo = chat_repository(db)

    user = await user_repo.get_user_by_token(message.token, token_repo)
    if user:
        await chat_repo.save_message(message.chat_id, user.id, message.text)
        return ChatSendMessageResponse(message="Message sent")
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
