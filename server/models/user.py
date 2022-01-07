import hashlib
import bcrypt
import config
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from objects import varka, glob
from objects.database import db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    name: Optional[str] = None

class User(BaseModel):
    id: int
    name: str
    safe_name: str
    email: Optional[str]
    priv: int

class UserInDB(User):
    pw_bcrypt: str


def verify_password(plain_password, encrypted_password):
    bcrypt_cache = glob.cache['bcrypt']
    pw_bcrypt = encrypted_password.encode()
    pw_md5 = hashlib.md5(plain_password.encode()).hexdigest().encode()

    # check credentials (password) against db
    # intentionally slow, will cache to speed up
    if pw_bcrypt in bcrypt_cache:
        if pw_md5 != bcrypt_cache[pw_bcrypt]: # ~0.1ms
            return False
    else: # ~200ms
        if not bcrypt.checkpw(pw_md5, pw_bcrypt):
            return False

        # login successful; cache password for next login
        bcrypt_cache[pw_bcrypt] = pw_md5
    return True


async def get_user(name: str = None, userid: str = None):
    if not name and userid:
        return None

    query = ['SELECT * FROM `users`']

    if name:
        query.append(f" WHERE `safe_name`='{varka.toSafeName(name)}'")
    elif userid:
        query.append(f" WHERE `userid`='{id}'")

    print(''.join(query))

    res = await db.fetch_one(''.join(query))
    if res is None:
        return None

    user = UserInDB(**res)
    print(user)
    return user

async def authenticate_user(name: str, password: str):
    user = await get_user(name)
    if not user:
        return False
    print(verify_password(password, user.pw_bcrypt))
    if not verify_password(password, user.pw_bcrypt):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, config.TOKEN_SECRET, algorithm="HS256")
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, config.TOKEN_SECRET, algorithms=["HS256"])
        name: str = payload.get("sub")
        if name is None:
            raise credentials_exception
        token_data = TokenData(name=name)
    except JWTError:
        raise credentials_exception
    user = await get_user(name=token_data.name)
    if user is None:
        raise credentials_exception
    return user