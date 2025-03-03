import os

from rag_pipeline import RAG_Chat

import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

os.environ["TOKENIZERS_PARALLELISM"] = "false"

def main():
    
    rag = RAG_Chat(user_id="student1")

    response = rag.get_recommendations()
    print(response)

if __name__ == "__main__":
    main()