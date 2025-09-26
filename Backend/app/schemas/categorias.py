from pydantic import BaseModel

class CategoriaBase(BaseModel):
    nombre: str
    descripcion: str | None = None

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaOut(CategoriaBase):
    id_categoria: int

    class Config:
        from_attributes = True
