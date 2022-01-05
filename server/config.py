from starlette.config import Config

# Just import from environment variables
config = Config("../.env")

API_PORT: int = config("API_PORT", cast=int, default=3001)

DB_DSN: str = config("DB_DSN", default="mysql://vark:123456@localhost:3306/gulag")