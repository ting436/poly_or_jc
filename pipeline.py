import os

from llama_index.core.vector_stores import VectorStoreQuery
from llama_index.llms.groq import Groq

from typing import List
# from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

from llama_index.core import Settings, Document

from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.chat_engine import CondensePlusContextChatEngine

from mySQL_utils import load_documents
from TiDB_utils import TiDBVectorStoreManager


import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

os.environ["TOKENIZERS_PARALLELISM"] = "false"

def main():
    school = "Bukit Panjang Government High"
    interests = "game development"
    strengths = "mathematics"
    score = 6.0
    learning_prefs = "practical experience"
    pursuing_uni_degree = "not sure, but probably yes"
    key_considerations = f"1. i would like many internship opporunities \n 2. i live in cck"

    prompt_test = f"""I am a student from {school} seeking guidance on my future educational and career paths. Here is my profile:

    Interests: {interests}
    Strengths/skills: {strengths}
    Academic Scores (L1R5): {score}
    Learning Preferences: {learning_prefs}
    Pursuing University Degree: {pursuing_uni_degree}

    In order of importance, these are the key considerations I have in deciding my path.
    {key_considerations}

    Based on information above, please provide me with 3 personalized recommendations for suitable Junior Colleges (JC) or Polytechnics (Poly). For each recommended institution, include:

        Name of the Institution
        Reasons why studying in this institution aligns with my preferences

    Present the recommendations in a structured format to facilitate easy comparison and understanding. Feel free to add a concluding sentence comparing the institutions.
    """

    groq_api_key = os.getenv('GROQ_API_KEY')
    Settings.llm = Groq(model="llama3-70b-8192", api_key=os.getenv('GROQ_API_KEY'))
    Settings.embed_model = HuggingFaceEmbedding(
        model_name="BAAI/bge-small-en-v1.5"
    )

    if not groq_api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set!")

    manager = TiDBVectorStoreManager()

    def load_docs() -> List[Document]:
        return load_documents("junior_colleges")  # Your document loading function
        
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


    
    memory = ChatMemoryBuffer.from_defaults(token_limit=3900)

    chat_engine = CondensePlusContextChatEngine.from_defaults(
        index.as_retriever(),
        memory=memory,
        context_prompt=(
            f"""
            You are a chatbot, able to have normal interactions.
            Your main role is to help the user decide whether they want to go poly or JC.
            Here are the relevant documents for the context:
            Users input: {prompt_test}
            Top 3 recommended institutions: {response}
            Instruction: Use the previous chat history, or the context above, to interact and help the user.
            """
        ),
        verbose=True,
    )

    while True:
        response = chat_engine.chat(
            input("")
        )
        print(str(response))

if __name__ == "__main__":
    main()