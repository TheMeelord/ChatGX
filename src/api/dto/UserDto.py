from pydantic import BaseModel


class UserRegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class UserRegisterResponse(BaseModel):
    message: str


class UserLoginRequest(BaseModel):
    email: str
    password: str


class UserLoginResponse(BaseModel):
    token: str
    user_id: int

class UserDtoResponse(BaseModel):
    id: int
    username: str


class UserGetAllResponse(BaseModel):
    users: list[UserDtoResponse]
