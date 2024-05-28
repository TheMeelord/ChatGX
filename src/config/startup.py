import asyncio

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from src.api.routers.chat_router import chat_router
from src.api.routers.websocket_router import websocket_router
from src.data import init_db

from src.api.routers.user_router import user_router
from src.data.data_storage import DataStorage

DATA_STORAGE = DataStorage()

def create_app():
    init_db()

    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Разрешить запросы с любых источников
        allow_credentials=True,
        allow_methods=["*"],  # Разрешить все методы (GET, POST и т.д.)
        allow_headers=["*"],  # Разрешить все заголовки
    )
    app.include_router(user_router, prefix="/user")
    app.include_router(websocket_router, prefix="/ws")
    app.include_router(chat_router, prefix="/chat")

    return app

