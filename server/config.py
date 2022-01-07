from starlette.config import Config

# Just import from environment variables
config = Config("../.env")

API_PORT: int = config("API_PORT", cast=int, default=3001)

DB_DSN: str = config("DB_DSN", default="mysql://vark:123456@localhost:3306/gulag")

TOKEN_SECRET: str = config("TOKEN_SECRET", default="secret")

if TOKEN_SECRET == "secret":
    raise ValueError("TOKEN_SECRET is not set (please set it in .env)")
