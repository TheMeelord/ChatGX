from pydantic import BaseModel


class ChatCreationRequest(BaseModel):
    friend_id: int
    token: str


class ChatCreationResponse(BaseModel):
    chat_id: int


class MessageDto(BaseModel):
    sender_id: int
    text: str


class ChatHistoryResposne(BaseModel):
    chat_id: int
    messages: list[MessageDto]


class ChatSendMessageRequest(BaseModel):
    chat_id: int
    token: str
    text: str


class ChatSendMessageResponse(BaseModel):
    message: str


class ChatDto(BaseModel):
    id: int
    friend_id: int
    friend_username: str
    friend_status: str  # online, offline
class ChatGetAllResponse(BaseModel):
    chats: list[ChatDto]
