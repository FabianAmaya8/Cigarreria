from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    usuarios , auth , estadisticas , pos ,
    deudas , productos , usuario_personal, 
    inventario, bolsillos
)
from scalar_fastapi import get_scalar_api_reference
from app.core.redis import redis_pos
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Cigarreria API",
    version="1.0.0",
    docs_url="/docs",   # Swagger
    redoc_url="/redoc"  # ReDoc
)

@app.on_event("startup")
async def startup_event():
    try:
        redis_pos.ping()
        print("✅ Redis conectado correctamente")
    except Exception as e:
        print("❌ Error conectando a Redis:", e)

# cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(auth.router, tags=["Autenticación"])
app.include_router(bolsillos.router)
app.include_router(deudas.router)
app.include_router(estadisticas.router)
app.include_router(inventario.router)
app.include_router(pos.router)
app.include_router(productos.router)
app.include_router(usuario_personal.router)
app.include_router(usuarios.router)

# Scalar
app.add_route("/scalar", get_scalar_api_reference(), include_in_schema=False)
