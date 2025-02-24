from llama_index.core import SQLDatabase
from llama_index.readers.database import DatabaseReader
from llama_index.vector_stores.tidbvector import TiDBVectorStore
import pymysql
from sqlalchemy import create_engine

pymysql.install_as_MySQLdb()


def load_documents(table_name):
    db_uri = f"mysql+pymysql://root:YES@localhost:3306/choose"

    db = SQLDatabase.from_uri(db_uri)
    query = f"SELECT * FROM {table_name}"

    table_reader = DatabaseReader(sql_database=db, table_name=table_name)
    documents = table_reader.load_data(query=query)

    return documents
