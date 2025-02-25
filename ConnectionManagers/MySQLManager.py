from llama_index.core import SQLDatabase
from llama_index.readers.database import DatabaseReader
import pymysql


pymysql.install_as_MySQLdb()

class MySQLManager:
    def __init__(self):
        self.connection_string = "mysql+pymysql://root:YES@localhost:3306/choose"
        self.db = SQLDatabase.from_uri(self.connection_string)

    def load_documents(self, table_name):

        db = self.db
        query = f"SELECT * FROM {table_name}"

        table_reader = DatabaseReader(sql_database=db, table_name=table_name)
        documents = table_reader.load_data(query=query)

        return documents
