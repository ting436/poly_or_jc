import os
from typing import Optional

from llama_index.core.memory import ChatMemoryBuffer
from langchain_community.chat_message_histories import TiDBChatMessageHistory
from llama_index.core.llms import MessageRole, ChatMessage
from llama_index.core.chat_engine import CondensePlusContextChatEngine

from config import initialize_settings
from llama_index.core import Settings

from ConnectionManagers.MySQLManager import MySQLManager
from ConnectionManagers.TiDBManager import TiDBManager
from promptHandling import retrieve_sdata, extract_key_considerations, json_considerations, generate_prompt
from dotenv import load_dotenv

import logging

from llama_index.core.vector_stores.types import (
    MetadataFilter,
    MetadataFilters,
)

load_dotenv()

class RAG_Chat:
    """Retrieval-Augmented Generation class for educational recommendations."""

    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self, user_id: str, groq_api_key: Optional[str] = None):
        if not hasattr(self, 'initialized'):
                
            # Configure logging
            logging.basicConfig(level=logging.INFO)
            self.logger = logging.getLogger(__name__)
            
            # Set environment variable for tokenizers
            os.environ["TOKENIZERS_PARALLELISM"] = "false"
            # Initialize settings
            initialize_settings()
            self.user_id = user_id
            
            # Load the vector index
            self.index = self._load_index()

            #Connect to TiDB Chat History
            self.history = self._connect_tidb()

            #Initialise chat engine and store memory
            self.memory = ChatMemoryBuffer.from_defaults(token_limit=3900)
            self.chat_engine = self.init_chat_engine()

            self.initialized = True
    

    def _load_index(self):
        """Create or load the vector index."""
        # Create vector store manager
        vector_store_manager = TiDBManager()
        doc_manager = MySQLManager()

        try:
            # Create or load the index
            documents = doc_manager.load_documents("junior_colleges")
            index = vector_store_manager.create_or_load_index(
                documents=documents,
                batch_size=1000
            )
            return index
        except Exception as e:
            self.logger.error(f"Error loading index: {e}")
            raise
    def get_recommendations(self, id):
        index = self.index
        query_engine = index.as_query_engine(similarity_top_k=10)
        student_data = retrieve_sdata(id)
        considerations = extract_key_considerations(student_data=student_data)
        prompt = generate_prompt(student_data=student_data, key_considerations_text=considerations)
        explanations = json_considerations(student_data=student_data)
        query_engine = index.as_query_engine(
            filters=MetadataFilters(
                filters=[
                    MetadataFilter(key="zone_code", value=explanations['location'].upper(), operator="=="),
                ]
            ),
            similarity_top_k=3,
        )
        # Either way we can now query the index
        try:
            response = query_engine.query(prompt)
            print("\nDebug - Retrieved Documents:")
            for i, node in enumerate(response.source_nodes):
                print(f"\nNode {i + 1}:")
                print(f"Content: {node.text[:200]}...")
                print(f"Score: {node.score}")
                print(f"Metadata: {node.metadata}")
        
            user_input = ChatMessage(role=MessageRole.USER, content=prompt)
            self.add_message(self.memory, user_input)
            assistant_message = ChatMessage(role=MessageRole.ASSISTANT, content=str(response))
            self.add_message(self.memory, assistant_message)
            return(response)
        except Exception as e:
            print(f"❌ Error while querying: {e}")

    def _connect_tidb(self):
        tidbmanager = TiDBManager()
        tidb_connection_string = tidbmanager.connection_string

        history = TiDBChatMessageHistory(
            connection_string=tidb_connection_string,
            session_id=self.user_id,
        )

        return history
    
    def add_message(self, memory, message: ChatMessage) -> None:
        """Add message to both memory buffer and TiDB."""
        # Add to local memory buffer
        memory.put(message)
        
        # Save to TiDB
        if message.role == MessageRole.USER:
            self.history.add_user_message(message.content)
        elif message.role == MessageRole.ASSISTANT:
            self.history.add_ai_message(message.content)


    def _load_from_tidb(self):
        """Load messages from TiDB into memory buffer."""
        for msg in self.history.messages:
            if msg.type == "human":
                chat_msg = ChatMessage(role=MessageRole.USER, content=msg.content)
                self.memory.put(chat_msg)
            elif msg.type == "ai":
                chat_msg = ChatMessage(role=MessageRole.ASSISTANT, content=msg.content)
                self.memory.put(chat_msg)

    def init_chat_engine(self):
        chat_engine = CondensePlusContextChatEngine.from_defaults(
            self.index.as_retriever(),
            memory=self.memory,
            context_prompt=(
                f"""
                You are a chatbot, able to have normal interactions.
                Your main role is to help the user decide whether they want to go poly or JC.
                Instruction: Use the previous chat history to interact and help the user.
                """
            ),
            verbose=True,
        )

        return chat_engine

    def chat(self, user_text):
        user_input = ChatMessage(role=MessageRole.USER, content=user_text)
        self.add_message(self.memory, user_input)

        response = self.chat_engine.chat(
            user_text
        )

        assistant_message = ChatMessage(role=MessageRole.ASSISTANT, content=str(response))
        self.add_message(self.memory, assistant_message)
        return str(response)
    
    def get_rec(self, id):

        student_data = retrieve_sdata(id)
        considerations = extract_key_considerations(student_data=student_data)
        prompt = generate_prompt(student_data=student_data, key_considerations_text=considerations) + "GIve only 3 reccs"
        user_input = ChatMessage(role=MessageRole.USER, content=prompt)
        self.add_message(self.memory, user_input)

        response = self.chat_engine.chat(
            prompt
        )

        assistant_message = ChatMessage(role=MessageRole.ASSISTANT, content=str(response))
        self.add_message(self.memory, assistant_message)
        return str(response)


