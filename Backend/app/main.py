from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    categorias , usuarios , auth , estadisticas , 
    deudas , ventas , productos , usuario_personal
)
from scalar_fastapi import get_scalar_api_reference

app = FastAPI(
    title="Cigarreria API",
    version="1.0.0",
    docs_url="/docs",   # Swagger
    redoc_url="/redoc"  # ReDoc
)

# cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(categorias.router)
app.include_router(usuarios.router)
app.include_router(estadisticas.router)
app.include_router(deudas.router)
app.include_router(ventas.router)
app.include_router(productos.router)
app.include_router(usuario_personal.router)
app.include_router(auth.router, tags=["Autenticación"])

# Scalar
app.add_route("/scalar", get_scalar_api_reference(), include_in_schema=False)
