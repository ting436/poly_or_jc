import os
from rag_pipeline import RAG_Chat

os.environ["TOKENIZERS_PARALLELISM"] = "false"


rag = RAG_Chat(user_id="student1")

rag._load_from_tidb()


print("ready to chat!")

while True:
    user_text = input("")

    if not user_text:  # Exit if user_input is empty
        print("Ending chat. Goodbye!")
        break

    response = rag.chat(user_text)
    print(response)
