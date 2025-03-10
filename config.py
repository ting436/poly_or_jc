from llama_index.core import Settings
from llama_index.llms.groq import Groq
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.embeddings.openai import OpenAIEmbedding
from dotenv import load_dotenv
import os

load_dotenv()

def initialize_settings():
    """Initialize global settings for LLM and embeddings"""
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        raise ValueError("GROQ_API_KEY not found!")
    
    Settings.llm = Groq(
        model="llama3-70b-8192", 
        api_key=api_key
    )
    
    Settings.embed_model = HuggingFaceEmbedding(
        model_name="BAAI/bge-small-en-v1.5"
    )
    # Settings.embed_model = OpenAIEmbedding(  # Another potential usage
    #     api_key=os.getenv('OPENAI_API_KEY'),
    #     model="text-embedding-3-small"
    # )