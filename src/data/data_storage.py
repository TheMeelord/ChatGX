import asyncio

from src.data.repository.chat_repository import chat_repository


class DataStorage:
    _instance = None

    def __init__(self):
        self._user_connections = {}  # Каждое устройство связано с одним юзером (Connection -> id), по connection можно быстро получить id
        self._connections = {}  # У одного пользователя несколько устройств (id -> list[Connection]), когда пользователь подключается нужна проверка получения всех его чатов и кто сейчас онлайн
        self._friends_connections = {}  # У каждого пользователя чаты, которые нужно уведомлять об онлайне (id -> list[Connection]), когда пользователь подключается нужна проверка получения всех его чатов и кто сейчас онлайн, то нужно отправить им что юзер онлайн

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def disconnect(self, user_id, connection):
        if user_id in self._connections:
            self._connections[user_id].remove(connection)
            # Если пользователь выходит из последнего подключения, сообщаем всем его друзьям об отключении
            if not self._connections[user_id]:
                for conn in self._friends_connections[user_id]:
                    print(conn.state)
                    try:
                        await conn.send_text(f"{user_id} disconnected")
                    except:
                        pass
                del self._connections[user_id]

        # Удаляем пользователя из _user_connections
        self._user_connections.pop(connection, None)

    async def connect(self, user_id, connection, chat_repo: chat_repository):
        if user_id is None:
            raise Exception("user_id is None")

        # Проверяем, был ли пользователь уже онлайн до этого
        was_online = user_id in self._connections

        # Добавляем пользователя в _user_connections
        self._user_connections[connection] = user_id

        # Добавляем подключение пользователя в _connections
        if user_id not in self._connections:
            self._connections[user_id] = [connection]
        else:
            self._connections[user_id].append(connection)

        # Если пользователь не был онлайн до этого и у него есть друзья для уведомления
        if not was_online:
            self._friends_connections[user_id] = []
            user_chats = await chat_repo.get_all_chats_by_user_id(user_id)
            for chat in user_chats:
                if user_id == chat.user1_id:
                    if chat.user2_id in self._connections:
                        self._friends_connections[user_id].extend(self._connections[chat.user2_id])
                elif user_id == chat.user2_id:
                    if chat.user1_id in self._connections:
                        self._friends_connections[user_id].extend(self._connections[chat.user1_id])

            for conn in self._friends_connections[user_id]:
                await conn.send_text(f"{user_id} connected")


    async def notify_message(self, chat_id, sender_id, chat_repo: chat_repository):
        if sender_id not in self._friends_connections:
            return
        chat = await chat_repo.get_chat_by_id(chat_id)
        recipient_id = None
        if sender_id == chat.user1_id:
            recipient_id = chat.user2_id
        elif sender_id == chat.user2_id:
            recipient_id = chat.user1_id

        if recipient_id and (recipient_id in self._connections):
            message = f"{chat_id} new message"
            for conn in self._connections.get(recipient_id, []):
                try:
                    await conn.send_text(message)
                except:
                    ...

    async def create_chat(self, sender_id, user2_id):
        if user2_id in self._connections:
            self._friends_connections[sender_id] += [self._connections[user2_id]]
        if user2_id in self._friends_connections:
            self._friends_connections[user2_id] += [self._connections[sender_id]]

        # TODO уведомлять о новом чате

    async def is_online(self, user_id):
        return user_id in self._connections