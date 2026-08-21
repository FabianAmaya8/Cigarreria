from pathlib import Path
from typing import Iterable, Optional
from uuid import uuid4
import os
from fastapi import UploadFile


# =========================================================
# CONFIGURACIÓN
# =========================================================

# Directorio raíz de almacenamiento.
# Dentro de Docker lo montaremos como /app/storage
BASE_STORAGE_DIR = Path(
    os.getenv("STORAGE_DIR", "/app/storage")
)

BASE_STORAGE_DIR.mkdir(
    parents=True,
    exist_ok=True
)

# =========================================================
# TIPOS DE ARCHIVO PERMITIDOS
# =========================================================

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
}

IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

PDF_EXTENSIONS = {
    ".pdf",
}

PDF_CONTENT_TYPES = {
    "application/pdf",
}


# =========================================================
# FUNCIONES INTERNAS
# =========================================================

def _crear_directorio(directorio: Path) -> None:
    """
    Crea el directorio si todavía no existe.
    """

    directorio.mkdir(
        parents=True,
        exist_ok=True
    )


def _obtener_extension(filename: Optional[str]) -> str:
    """
    Obtiene la extensión del archivo en minúsculas.
    """

    if not filename:
        return ""

    return Path(filename).suffix.lower()


def _generar_nombre(extension: str) -> str:
    """
    Genera un nombre único para el archivo.

    Ejemplo:
        8f4e7c1d-2d3a-4f6b-9e12-123456789abc.jpg
    """

    return f"{uuid4()}{extension}"


def _normalizar_categoria(categoria: str) -> str:
    """
    Limpia la categoría para evitar rutas inválidas.
    """

    categoria = categoria.strip().replace("\\", "/")

    # Evitar que alguien intente salir del directorio storage
    partes = [
        parte
        for parte in categoria.split("/")
        if parte and parte not in {".", ".."}
    ]

    return "/".join(partes)


# =========================================================
# VALIDACIÓN
# =========================================================

def validar_imagen(archivo: UploadFile) -> None:
    """
    Valida que el archivo recibido sea una imagen permitida.
    """

    extension = _obtener_extension(archivo.filename)
    content_type = archivo.content_type or ""

    if extension not in IMAGE_EXTENSIONS:
        raise ValueError(
            "Formato de imagen no permitido. "
            "Formatos permitidos: JPG, JPEG, PNG, WEBP y GIF."
        )

    if content_type not in IMAGE_CONTENT_TYPES:
        raise ValueError(
            "El tipo de contenido del archivo no corresponde a una imagen válida."
        )


def validar_pdf(archivo: UploadFile) -> None:
    """
    Valida que el archivo recibido sea un PDF.
    """

    extension = _obtener_extension(archivo.filename)
    content_type = archivo.content_type or ""

    if extension not in PDF_EXTENSIONS:
        raise ValueError(
            "Solo se permiten archivos PDF."
        )

    if content_type not in PDF_CONTENT_TYPES:
        raise ValueError(
            "El tipo de contenido del archivo no corresponde a un PDF válido."
        )


# =========================================================
# GUARDAR ARCHIVOS
# =========================================================

async def guardar_archivo(
    archivo: UploadFile,
    categoria: str,
    tipos_permitidos: Iterable[str],
    max_size: Optional[int] = None,
) -> str:
    """
    Guarda un archivo localmente.

    Parámetros:
        archivo:
            UploadFile recibido desde FastAPI.

        categoria:
            Carpeta donde se almacenará.
            Ejemplo:
                "usuarios/avatares"
                "productos/imagenes"
                "compras/facturas"

        tipos_permitidos:
            Extensiones permitidas.
            Ejemplo:
                {".jpg", ".jpeg", ".png"}

        max_size:
            Tamaño máximo en bytes.
            Si es None, no se aplica límite.

    Retorna:
        Ruta relativa del archivo almacenado.

    Ejemplo:
        usuarios/avatares/550e8400-e29b-41d4-a716-446655440000.jpg
    """

    extension = _obtener_extension(archivo.filename)
    content_type = archivo.content_type or ""

    tipos_permitidos = {
        tipo.lower()
        for tipo in tipos_permitidos
    }

    if extension not in tipos_permitidos:
        raise ValueError(
            f"Extensión de archivo no permitida: {extension}"
        )

    # Leer archivo
    contenido = await archivo.read()

    # Validar tamaño
    if max_size is not None and len(contenido) > max_size:
        raise ValueError(
            f"El archivo supera el tamaño máximo permitido "
            f"de {max_size / (1024 * 1024):.2f} MB."
        )

    categoria = _normalizar_categoria(categoria)

    directorio = BASE_STORAGE_DIR / categoria

    _crear_directorio(directorio)

    # Generar nombre completamente independiente
    # del nombre original del usuario.
    nombre_archivo = _generar_nombre(extension)

    ruta_archivo = directorio / nombre_archivo

    # Guardar archivo
    ruta_archivo.write_bytes(contenido)

    ruta_relativa = Path(categoria) / nombre_archivo

    return ruta_relativa.as_posix()


# =========================================================
# GUARDAR IMAGEN
# =========================================================

async def guardar_imagen(
    archivo: UploadFile,
    categoria: str,
    max_size: int = 5 * 1024 * 1024,
) -> str:
    """
    Guarda una imagen localmente.

    Tamaño máximo predeterminado:
        5 MB

    Ejemplo:

        ruta = await guardar_imagen(
            imagen,
            "usuarios/avatares"
        )
    """

    validar_imagen(archivo)

    return await guardar_archivo(
        archivo=archivo,
        categoria=categoria,
        tipos_permitidos=IMAGE_EXTENSIONS,
        max_size=max_size,
    )


# =========================================================
# GUARDAR PDF
# =========================================================

async def guardar_pdf(
    archivo: UploadFile,
    categoria: str,
    max_size: int = 10 * 1024 * 1024,
) -> str:
    """
    Guarda un archivo PDF localmente.

    Tamaño máximo predeterminado:
        10 MB
    """

    validar_pdf(archivo)

    return await guardar_archivo(
        archivo=archivo,
        categoria=categoria,
        tipos_permitidos=PDF_EXTENSIONS,
        max_size=max_size,
    )


# =========================================================
# ELIMINAR ARCHIVO
# =========================================================

def eliminar_archivo(ruta: Optional[str]) -> bool:
    if not ruta:
        return False

    ruta_relativa = Path(ruta)

    # Evitar rutas absolutas
    if ruta_relativa.is_absolute():
        return False

    # Evitar salir de STORAGE_DIR
    if ".." in ruta_relativa.parts:
        return False

    ruta_archivo = BASE_STORAGE_DIR / ruta_relativa

    try:
        if ruta_archivo.exists() and ruta_archivo.is_file():
            ruta_archivo.unlink()
            return True

    except OSError:
        return False

    return False


# =========================================================
# EXISTENCIA DE ARCHIVO
# =========================================================

def archivo_existe(ruta: Optional[str]) -> bool:
    if not ruta:
        return False

    ruta_relativa = Path(ruta)

    if ruta_relativa.is_absolute():
        return False

    if ".." in ruta_relativa.parts:
        return False

    ruta_archivo = BASE_STORAGE_DIR / ruta_relativa

    return ruta_archivo.exists() and ruta_archivo.is_file()