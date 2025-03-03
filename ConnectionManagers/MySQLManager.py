from llama_index.core import SQLDatabase
from llama_index.readers.database import DatabaseReader
import pymysql
import os


pymysql.install_as_MySQLdb()

class MySQLManager:
    def __init__(self):
         # Create PyMySQL connection
        self.connection = pymysql.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            cursorclass=pymysql.cursors.DictCursor
        )
        
        # Build connection string for SQLDatabase
        self.connection_string = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME')}"
        self.db = SQLDatabase.from_uri(self.connection_string)

    def get_connection(self):
        return self.connection

    def load_documents(self, table_name):

        db = self.db
        query = f"SELECT * FROM {table_name}"

        table_reader = DatabaseReader(sql_database=db, table_name=table_name)
        documents = table_reader.load_data(query=query)

        return documents
