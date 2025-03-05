import os

from rag_pipeline import RAG_Chat


os.environ["TOKENIZERS_PARALLELISM"] = "false"

def main():
    
    rag = RAG_Chat(user_id="student5")

    response = rag.get_recommendations()
    print(response)

if __name__ == "__main__":
    main()