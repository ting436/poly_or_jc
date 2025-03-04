from sqlalchemy import create_engine, text
from typing import Optional, List
from contextlib import contextmanager
import logging
from llama_index.core import StorageContext, VectorStoreIndex, Document
from llama_index.vector_stores.tidbvector import TiDBVectorStore
from ConnectionManagers.MySQLManager import MySQLManager
from dotenv import load_dotenv
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class TiDBManager:
    def __init__(
        self,
        table_name: str = "junior_colleges",
        vector_dimension: int = 384,
        distance_strategy: str = "cosine",
    ):
        self.connection_string = (
            f"mysql+pymysql://{os.getenv('TIDB_USER')}:{os.getenv('TIDB_PASSWORD')}"
            f"@{os.getenv('TIDB_HOST')}:{os.getenv('TIDB_PORT', '4000')}"
            f"/{os.getenv('TIDB_DATABASE')}?ssl_ca=/etc/ssl/cert.pem"
            "&ssl_verify_cert=true&ssl_verify_identity=true"
        )
        
        self.table_name = table_name
        self.vector_dimension = vector_dimension
        self.distance_strategy = distance_strategy
        self.engine = create_engine(
            self.connection_string,
            pool_pre_ping=True,  # Enable connection health checks
            pool_recycle=3600,   # Recycle connections after 1 hour
            pool_size=5,         # Maximum number of connections
            max_overflow=10      # Maximum number of connections that can be created beyond pool_size
        )

    @contextmanager
    def get_vector_store(self) -> TiDBVectorStore:
        """
        Context manager to safely handle TiDB vector store connections.
        """
        vector_store = None
        try:
            vector_store = TiDBVectorStore(
                connection_string=self.connection_string,
                table_name=self.table_name,
                distance_strategy=self.distance_strategy,
                vector_dimension=self.vector_dimension,
                drop_existing_table=False,
            )
            yield vector_store
        except Exception as e:
            logger.error(f"Error creating vector store: {e}")
            raise

    def is_store_populated(self) -> bool:
        """
        Check if the vector store has existing data.
        """
        try:
            with self.engine.connect() as conn:
                result = conn.execute(
                    text(f"SELECT COUNT(*) FROM {self.table_name}")
                ).scalar()
                return result > 0
        except Exception as e:
            logger.error(f"Error checking vector store population: {e}")
            return False

    def create_or_load_index(
        self,
        documents_loader: Optional[callable] = None,
        batch_size: int = 1000
    ) -> VectorStoreIndex:
        """
        Create a new index or load existing one from the vector store.
        
        Args:
            documents_loader: Function that returns List[Document] when called
            batch_size: Number of documents to insert in each batch
        """
        try:
            with self.get_vector_store() as vector_store:
                if self.is_store_populated():
                    logger.info("✅ Vector store already populated. Loading existing index...")
                    index = VectorStoreIndex.from_vector_store(vector_store)
                    return index
                
                logger.info("❌ Vector store not initialized. Creating new index...")
                documents = documents_loader()
                logger.info(f"Loaded {len(documents)} documents")
                
                storage_context = StorageContext.from_defaults(vector_store=vector_store)
                logger.info("Created storage context")
                
                # Store in variable instead of returning directly
                index = VectorStoreIndex.from_documents(
                    documents,
                    storage_context=storage_context,
                    insert_batch_size=batch_size
                )
                logger.info("Successfully created new index")
                
                # Return after successful creation
                return index
                
        except Exception as e:
            logger.error(f"Error creating/loading index: {e}")
            raise
