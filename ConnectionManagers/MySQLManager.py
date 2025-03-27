from llama_index.core import SQLDatabase
from llama_index.core.schema import Document
from llama_index.readers.database import DatabaseReader
import pymysql
import os
from pymysql.cursors import DictCursor
from pymysql.constants import CLIENT
from contextlib import contextmanager
import time
import logging
import bcrypt  # For password hashing

from dotenv import load_dotenv

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
                                              
        # Configure connection pool
        self.pool = []
        self.max_pool_size = 5
        self.connection_timeout = 600  # 10 minutes
        
        # Initialize SQLDatabase with longer timeout
        try:
            self.db = SQLDatabase.from_uri(
                self.connection_string,
                engine_args={"pool_recycle": 3600, "pool_timeout": 60, "pool_size": 5}
            )
        except Exception as e:
            logging.error(f"Failed to initialize SQLDatabase: {str(e)}")
            self.db = None

    @contextmanager
    def get_connection(self):
        """Context manager for database connections with retry logic."""
        connection = None
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                # Try to get a connection from the pool
                if self.pool:
                    connection, created_time = self.pool.pop()
                    # Check if connection is still valid
                    if time.time() - created_time > self.connection_timeout:
                        # Connection is too old, close it and create a new one
                        connection.close()
                        connection = None
                
                # Create a new connection if needed
                if connection is None:
                    connection = pymysql.connect(
                        host=self.host,
                        user=self.user,
                        password=self.password,
                        database=self.database,
                        port=self.port,
                        cursorclass=DictCursor,
                        client_flag=CLIENT.MULTI_STATEMENTS,
                        connect_timeout=30,
                        read_timeout=600,  # 10 minutes
                        write_timeout=600,  # 10 minutes
                        autocommit=True
                    )
                
                # Check if connection is working
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    cursor.fetchone()
                
                # Return the working connection
                yield connection
                
                # Return connection to the pool
                if len(self.pool) < self.max_pool_size:
                    self.pool.append((connection, time.time()))
                else:
                    connection.close()
                
                # Successfully got a connection, break the retry loop
                break
                
            except (pymysql.OperationalError, pymysql.InternalError) as e:
                retry_count += 1
                if connection:
                    try:
                        connection.close()
                    except:
                        pass
                
                if retry_count >= max_retries:
                    logging.error(f"Failed to get database connection after {max_retries} attempts: {str(e)}")
                    raise
                
                logging.warning(f"Database connection error, retrying ({retry_count}/{max_retries}): {str(e)}")
                time.sleep(1)  # Wait before retrying
        

    def get_connection(self):
        return self.connection

    def load_documents(self, table_name):

        db = self.db
        query = f"SELECT * FROM {table_name}"

        table_reader = DatabaseReader(sql_database=db, table_name=table_name)
        documents = table_reader.load_data(query=query)

        modified_documents = []
        for doc in documents:
            # Parse the row data string into a dictionary
            row_data = doc.text.split(', ')
            metadata_dict = {}
            
            for item in row_data:
                if ': ' in item:
                    key, value = item.split(': ', 1)
                    if key == "monthly_fees" and value:
                        # Remove any non-numeric characters except decimal point
                        # This will handle cases like "$1200/month" -> "1200"
                        cleaned_value = ''.join(c for c in value if c.isdigit() or c == '.')
                        try:
                            metadata_dict[key] = float(cleaned_value)
                        except ValueError:
                            # If conversion fails, store as is
                            metadata_dict[key] = value
                    else:
                        metadata_dict[key] = value
            
            # Create new document with parsed metadata
            new_doc = Document(
                text="",  # Empty text field
                metadata=metadata_dict  # Now a proper dictionary
            )
            
            # Preserve original metadata if any
            if doc.metadata:
                new_doc.metadata.update(doc.metadata)
                
            modified_documents.append(new_doc)

        return modified_documents

    def create_user(self, email: str, password: str, name: str = None, school: str = None):
        """Create a new user with a hashed password."""
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        try:
            with self.connection.cursor() as cursor:
                query = """
                INSERT INTO users (email, hashed_password, name, school)
                VALUES (%s, %s, %s, %s)
                """
                cursor.execute(query, (email, hashed_password.decode('utf-8'), name, school))
                self.connection.commit()
        except pymysql.MySQLError as e:
            logging.error(f"Error creating user: {str(e)}")
            raise

    def verify_user(self, email: str, password: str) -> bool:
        """Verify a user's email and password."""
        try:
            with self.connection.cursor() as cursor:
                query = "SELECT hashed_password FROM users WHERE email = %s"
                cursor.execute(query, (email,))
                result = cursor.fetchone()
                if result:
                    hashed_password = result['hashed_password']
                    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
                return False
        except pymysql.MySQLError as e:
            logging.error(f"Error verifying user: {str(e)}")
            raise