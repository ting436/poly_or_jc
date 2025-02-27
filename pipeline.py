import os

from llama_index.llms.groq import Groq

from typing import List
# from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

from llama_index.core import Settings, Document

from ConnectionManagers.MySQLManager import MySQLManager
from ConnectionManagers.TiDBVectorStoreManager import TiDBVectorStoreManager

from promptHandling import generate_prompt

import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

os.environ["TOKENIZERS_PARALLELISM"] = "false"

def main():
    prompt_test = generate_prompt()

    groq_api_key = os.getenv('GROQ_API_KEY')
    Settings.llm = Groq(model="llama3-70b-8192", api_key=os.getenv('GROQ_API_KEY'))
    Settings.embed_model = HuggingFaceEmbedding(
        model_name="BAAI/bge-small-en-v1.5"
    )

    if not groq_api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set!")

    manager = TiDBVectorStoreManager()

    doc_manager = MySQLManager()

    def load_docs() -> List[Document]:
        return doc_manager.load_documents("junior_colleges")  # Your document loading function
        
    try:
        index = manager.create_or_load_index(
            documents_loader=load_docs,
            batch_size=1000
        )
        # Use index for queries...
    except Exception as e:
        logger.error(f"Error in main: {e}")
        raise

    query_engine = index.as_query_engine()

    # Either way we can now query the index
    try:
        response = query_engine.query(prompt_test)
        print(response)
    except Exception as e:
        print(f"❌ Error while querying: {e}")

if __name__ == "__main__":
    main()