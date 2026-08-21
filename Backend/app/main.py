from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scalar_fastapi import get_scalar_api_reference
from fastapi.staticfiles import StaticFiles
from app.utils.file_storage import BASE_STORAGE_DIR
import logging

from app.core.redis import redis_pos
from app.routers import (
    auth,
    bolsillos,
    compras,
    deudas,
    estadisticas,
    inventario,
    productos,
    proveedores,
    usuario_personal,
    usuarios,
    pos,
)

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Cigarreria API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.mount(
    "/uploads",
    StaticFiles(directory=BASE_STORAGE_DIR),
    name="uploads",
)

@app.on_event("startup")
async def startup_event():
    try:
        redis_pos.ping()
        print("✅ Redis conectado correctamente")
    except Exception as e:
        print("❌ Error conectando a Redis:", e)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["Autenticacion"])
app.include_router(bolsillos.router)
app.include_router(compras.router)
app.include_router(deudas.router)
app.include_router(estadisticas.router)
app.include_router(inventario.router)
app.include_router(pos.router)
app.include_router(productos.router)
app.include_router(proveedores.router)
app.include_router(usuario_personal.router)
app.include_router(usuarios.router)

app.add_route("/scalar", get_scalar_api_reference(), include_in_schema=False)
