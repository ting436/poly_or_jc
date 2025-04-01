import os, json
from typing import Optional

from llama_index.core.memory import ChatMemoryBuffer
from langchain_community.chat_message_histories import TiDBChatMessageHistory
from llama_index.core.llms import MessageRole, ChatMessage
from llama_index.core.chat_engine import CondensePlusContextChatEngine

from config import initialize_settings

from ConnectionManagers.MySQLManager import MySQLManager
from ConnectionManagers.TiDBManager import TiDBManager
from promptHandling import retrieve_sdata, extract_key_considerations, generate_prompt
from dotenv import load_dotenv
from llama_index.core.vector_stores.types import (
    FilterOperator,
    MetadataFilter,
    MetadataFilters,
)

import logging

load_dotenv()

class RAG_Chat:
    """Retrieval-Augmented Generation class for educational recommendations."""

    # _instance = None
    
    # def __new__(cls, *args, **kwargs):
    #     if cls._instance is None:
    #         cls._instance = super().__new__(cls)
    #     return cls._instance
    
    def __init__(self, groq_api_key: Optional[str] = None, email: str = None):
        if not hasattr(self, 'initialized'):
                
            # Configure logging
            logging.basicConfig(level=logging.INFO)
            self.logger = logging.getLogger(__name__)

            self.email = email
            
            # Set environment variable for tokenizers
            os.environ["TOKENIZERS_PARALLELISM"] = "false"
            # Initialize settings
            initialize_settings()
            
            # Load the vector index
            self.index = self._load_index()

            #Connect to TiDB Chat History
            self.history = self._connect_tidb()

            #Initialise chat engine and store memory
            chat_history = self._load_from_tidb()
            self.memory = ChatMemoryBuffer.from_defaults(chat_history=chat_history, chat_store_key=self.email, token_limit=3900)

            self.chat_engine = self.init_chat_engine()

            self.initialized = True
    

    def _load_index(self):
        """Create or load the vector index."""
        # Create vector store manager
        vector_store_manager = TiDBManager()
        doc_manager = MySQLManager()

        try:
            # Create or load the index
            doc1 = doc_manager.load_documents("junior_colleges")
            doc2 = doc_manager.load_documents("polytechnics")
            documents = doc1 + doc2
            index = vector_store_manager.create_or_load_index(
                documents=documents,
                batch_size=1000
            )
            return index
        except Exception as e:
            self.logger.error(f"Error loading index: {e}")
            raise

    def _connect_tidb(self):
        tidbmanager = TiDBManager()
        tidb_connection_string = tidbmanager.connection_string

        history = TiDBChatMessageHistory(
            connection_string=tidb_connection_string,
            session_id=self.email,
        )

        return history


    def _load_from_tidb(self):
        """Load messages from TiDB into memory buffer."""
        chat_history = []
        for msg in self.history.messages:
            if msg.type == "human":
                chat_msg = ChatMessage(role=MessageRole.USER, content=msg.content)
                chat_history.append(chat_msg)
            elif msg.type == "ai":
                chat_msg = ChatMessage(role=MessageRole.ASSISTANT, content=msg.content)
                chat_history.append(chat_msg)
        print(f"hist:{chat_history}")
        return chat_history


    def init_chat_engine(self):
        sdata = retrieve_sdata(self.email)
        explanations = json.loads(sdata['explanations'])

        filter_list = []
        if "location" in explanations:
            filter_list.append(
                MetadataFilter(
                    key="zone_code",
                    value=explanations['location'].upper()
                )
            )
        
        if "fees" in explanations:
            filter_list.append(
                MetadataFilter(
                    key="monthly_fees",
                    value=explanations['fees'].lstrip("Below $").rstrip("/month"), 
                    operator=FilterOperator.GTE
                )
            )

        filters = MetadataFilters(
            filters=filter_list 
        )
        
        chat_engine = CondensePlusContextChatEngine.from_defaults(
            retriever = self.index.as_retriever(
            similarity_top_k=5,    
            filters=filters
            ),
            memory=self.memory,
            system_prompt=(
                f"""
                You are a chatbot specializing in educational guidance, your role is to help users decide which institution to study in (poly or jc).
                
                CRITICAL INSTRUCTIONS:
                1. To retrieve information about schools, you can ONLY use the provided retriever.
                2. IF you use pretrained context, output this sentence: please note that ... may be subject to change, and it's always best to check with the school directly for the most up-to-date information.

                DO NOT ADD OR MODIFY ANY INFORMATION NOT PRESENT IN THE RETRIEVER.
                """),
            verbose=True,
        )  

        return chat_engine

    def chat(self, user_text):
        self.history.add_user_message(user_text)

        response = self.chat_engine.chat(
            user_text
        )

        self.history.add_ai_message(str(response))
        return str(response)
    
    def get_recommendations(self):
        student_data = retrieve_sdata(self.email)
        considerations = extract_key_considerations(student_data=student_data)
        prompt = generate_prompt(student_data=student_data, key_considerations_text=considerations) 

        response = self.chat(prompt)
        return response

    def clear_all_history(self):
        """Clear both memory buffer and TiDB chat history"""
        # Clear memory buffer
        self.memory.reset()
        
        # Clear TiDB chat history
        try:
            self.history.clear()
        
        except Exception as e:
            print(f"Error clearing TiDB history: {e}")

