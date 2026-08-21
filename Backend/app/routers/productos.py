from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional

from app.core.security import get_current_user
from app.utils.file_storage import (
    guardar_imagen,
    eliminar_archivo,
)
from app.database import get_db
from app.models.categorias import Categoria
from app.models.inventario import Inventario
from app.models.marcas import Marca
from app.models.productos import Producto
from app.models.usuarios import Usuario
from app.schemas.productos import (
    CategoriaCreate,
    CategoriaResponse,
    CategoriaUpdate,
    MarcaCreate,
    MarcaResponse,
    MarcaUpdate,
    ProductoResponse,
)

router = APIRouter(
    prefix="/api/productos",
    tags=["Productos"]
)


def _stock_producto(db: Session, id_producto: int) -> int:
    stock = (
        db.query(func.coalesce(func.sum(Inventario.stock), 0))
        .filter(Inventario.id_producto == id_producto)
        .scalar()
    )
    return int(stock or 0)


def _cargar_stock_actual(db: Session, producto: Producto) -> Producto:
    producto.stock_actual = _stock_producto(db, producto.id_producto)
    return producto


# ===========================
# Listar productos
# ===========================
@router.get("/", response_model=List[ProductoResponse])
def listar_productos(db: Session = Depends(get_db)):
    productos = (
        db.query(Producto)
        .options(joinedload(Producto.marca).joinedload(Marca.categoria))
        .filter(Producto.activo == True)
        .all()
    )

    return [_cargar_stock_actual(db, producto) for producto in productos]


@router.get("/sin_filtro")
def listar_productos_sin_filtro(db: Session = Depends(get_db)):
    productos = (
        db.query(Producto)
        .options(joinedload(Producto.marca).joinedload(Marca.categoria))
        .all()
    )

    inventarios = (
        db.query(Inventario)
        .options(joinedload(Inventario.almacen))
        .all()
    )

    stock_total_por_producto = {}
    for inv in inventarios:
        stock_total_por_producto.setdefault(inv.id_producto, 0)
        stock_total_por_producto[inv.id_producto] += inv.stock

    inventario_por_producto = {}
    for inv in inventarios:
        inventario_por_producto.setdefault(inv.id_producto, []).append({
            "id_inventario": inv.id_inventario,
            "id_almacen": inv.id_almacen,
            "nombre_almacen": inv.almacen.nombre,
            "stock": inv.stock
        })

    resultado = []
    for producto in productos:
        resultado.append({
            "id_producto": producto.id_producto,
            "codigo_barras": producto.codigo_barras,
            "nombre": producto.nombre,
            "imagen": producto.imagen,
            "descripcion": producto.descripcion,
            "precio_venta": float(producto.precio_venta),
            "stock_actual": stock_total_por_producto.get(producto.id_producto, 0),
            "stock_minimo": producto.stock_minimo,
            "unidad_medida": producto.unidad_medida,
            "activo": producto.activo,
            "id_marca": producto.id_marca,
            "marca": {
                "id_marca": producto.marca.id_marca,
                "nombre": producto.marca.nombre,
                "categoria": {
                    "id_categoria": producto.marca.categoria.id_categoria,
                    "nombre": producto.marca.categoria.nombre,
                    "descripcion": producto.marca.categoria.descripcion
                }
            },
            "detalle_por_almacen": inventario_por_producto.get(producto.id_producto, [])
        })

    return resultado


# ===========================
# Obtener producto por cÃ³digo
# ===========================
@router.get("/codigo/{codigo_barras}", response_model=ProductoResponse)
def obtener_producto_por_codigo(codigo_barras: str, db: Session = Depends(get_db)):
    producto = (
        db.query(Producto)
        .options(joinedload(Producto.marca).joinedload(Marca.categoria))
        .filter(Producto.codigo_barras == codigo_barras)
        .first()
    )
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return _cargar_stock_actual(db, producto)


# ===========================
# Crear producto (sube imagen a Supabase)
# ===========================
@router.post("/", response_model=ProductoResponse)
async def crear_producto(
    codigo_barras: str = Form(...),
    nombre: str = Form(...),
    descripcion: Optional[str] = Form(None),
    precio_venta: float = Form(...),
    stock_actual: Optional[int] = Form(None),
    stock_minimo: int = Form(...),
    unidad_medida: str = Form(...),
    activo: bool = Form(True),
    id_marca: int = Form(...),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    marca = db.query(Marca).filter(Marca.id_marca == id_marca).first()
    if not marca:
        raise HTTPException(status_code=400, detail="Marca no vÃ¡lida")

    image_path = None

    if imagen:
        try:
            image_path = await guardar_imagen(
                imagen,
                "productos/imagenes"
            )
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=str(e)
            )

    nuevo = Producto(
        codigo_barras=codigo_barras,
        nombre=nombre,
        descripcion=descripcion,
        imagen=image_path,
        precio_venta=precio_venta,
        stock_minimo=stock_minimo,
        unidad_medida=unidad_medida,
        activo=activo,
        id_marca=id_marca,
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return _cargar_stock_actual(db, nuevo)


# ===========================
# Actualizar producto (reemplaza imagen anterior en Supabase)
# ===========================
@router.put("/{id_producto}", response_model=ProductoResponse)
async def actualizar_producto(
    id_producto: int,
    codigo_barras: Optional[str] = Form(None),
    nombre: Optional[str] = Form(None),
    descripcion: Optional[str] = Form(None),
    precio_venta: Optional[float] = Form(None),
    stock_actual: Optional[int] = Form(None),
    stock_minimo: Optional[int] = Form(None),
    unidad_medida: Optional[str] = Form(None),
    activo: Optional[bool] = Form(None),
    id_marca: Optional[int] = Form(None),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    producto = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if imagen:
        try:
            nueva_imagen = await guardar_imagen(
                imagen,
                "productos/imagenes"
            )
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=str(e)
            )

        imagen_anterior = producto.imagen

        producto.imagen = nueva_imagen

        if imagen_anterior:
            eliminar_archivo(imagen_anterior)

    campos = {
        "codigo_barras": codigo_barras,
        "nombre": nombre,
        "descripcion": descripcion,
        "precio_venta": precio_venta,
        "stock_minimo": stock_minimo,
        "unidad_medida": unidad_medida,
        "activo": activo,
        "id_marca": id_marca,
    }

    for key, value in campos.items():
        if value is not None:
            setattr(producto, key, value)

    db.commit()
    db.refresh(producto)
    return _cargar_stock_actual(db, producto)


# ===========================
# Categorias
# ===========================
@router.get("/categorias", response_model=List[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).all()


@router.post("/categorias", response_model=CategoriaResponse)
def crear_categoria(categoria: CategoriaCreate, db: Session = Depends(get_db)):
    nueva = Categoria(**categoria.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.put("/categorias/{id_categoria}", response_model=CategoriaResponse)
def actualizar_categoria(id_categoria: int, datos: CategoriaUpdate, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id_categoria == id_categoria).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="CategorÃ­a no encontrada")

    for key, value in datos.dict(exclude_unset=True).items():
        setattr(categoria, key, value)

    db.commit()
    db.refresh(categoria)
    return categoria


# ===========================
# Marcas
# ===========================
@router.get("/marcas", response_model=List[MarcaResponse])
def listar_marcas(db: Session = Depends(get_db)):
    marcas = db.query(Marca).options(joinedload(Marca.categoria)).all()
    return marcas


@router.post("/marcas", response_model=MarcaResponse)
def crear_marca(marca: MarcaCreate, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id_categoria == marca.id_categoria).first()
    if not categoria:
        raise HTTPException(status_code=400, detail="CategorÃ­a no vÃ¡lida")

    nueva = Marca(**marca.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.put("/marcas/{id_marca}", response_model=MarcaResponse)
def actualizar_marca(id_marca: int, datos: MarcaUpdate, db: Session = Depends(get_db)):
    marca = db.query(Marca).filter(Marca.id_marca == id_marca).first()
    if not marca:
        raise HTTPException(status_code=404, detail="Marca no encontrada")

    for key, value in datos.dict(exclude_unset=True).items():
        setattr(marca, key, value)

    db.commit()
    db.refresh(marca)
    return marca

