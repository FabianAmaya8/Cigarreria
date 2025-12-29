from redis import Redis
import os

redis_pos = Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT")),
    db=int(os.getenv("REDIS_DB")),
    password=os.getenv("REDIS_PASSWORD") or None,
    decode_responses=True
)
