from starlette.config import Config

config = Config("../.env")

API_PORT: int = config("API_PORT", cast=int, default=3001)