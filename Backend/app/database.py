from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Datos de Variables de Entorno
import os
from dotenv import load_dotenv
load_dotenv()

# Variables de Entorno
USER_SQL = os.getenv("User-Sql")
PASS_SQL = os.getenv("Pass-Sql")
HOST_SQL = os.getenv("Host-Sql")
PUERTO_SQL = os.getenv("Puerto-Sql")
DATABASE_SQL = os.getenv("Database-Sql")

# Conexión a MySQL
DATABASE_URL = f"mysql+pymysql://{USER_SQL}:{PASS_SQL}@{HOST_SQL}:{PUERTO_SQL}/{DATABASE_SQL}"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# Dependencia para obtener sesión de DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
