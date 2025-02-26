import os
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.chat_engine import CondensePlusContextChatEngine

from ConnectionManagers.MySQLManager import MySQLManager
from ConnectionManagers.TiDBVectorStoreManager import TiDBVectorStoreManager

from llama_index.llms.groq import Groq
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

from llama_index.core import Settings, Document

from langchain_community.chat_message_histories import TiDBChatMessageHistory

from llama_index.core.llms import MessageRole, ChatMessage

from typing import List

os.environ["TOKENIZERS_PARALLELISM"] = "false"

#need to connect later
school = "Bukit Panjang Government High"
interests = "game development"
strengths = "mathematics"
score = 6.0
learning_prefs = "practical experience"
pursuing_uni_degree = "not sure, but probably yes"
key_considerations = f"1. i would like many internship opporunities \n 2. i live in cck"

prompt_test = f"""I am a student from {school} seeking guidance on my future ellostr(response)educational and career paths. Here is my profile:

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

response = """
Here are three personalized recommendations for suitable Junior Colleges (JC) or Polytechnics (Poly) based on your profile and preferences:

**Recommendation 1: Victoria Junior College**

* Name of the Institution: Victoria Junior College
* Reasons why studying in this institution aligns with my preferences:
        + Offers a strong mathematics curriculum, which aligns with your strength in mathematics.
        + Has a relatively close proximity to your residence in CCK, making it a convenient option.
        + As a JC, it provides a more theoretical foundation, which can be beneficial for those interested in game development.

**Recommendation 2: Ngee Ann Polytechnic (Not in the provided context, but a suitable recommendation based on your profile)**

* Name of the Institution: Ngee Ann Polytechnic
* Reasons why studying in this institution aligns with my preferences:
        + Offers a Diploma in Game Development and Technology, which directly aligns with your interest in game development.
        + Provides a more practical and hands-on approach to learning, which suits your preference for practical experience.
        + Has a strong industry network, offering many internship opportunities.

**Recommendation 3: Hwa Chong Institution**

* Name of the Institution: Hwa Chong Institution
* Reasons why studying in this institution aligns with my preferences:
        + Offers a strong mathematics curriculum, which aligns with your strength in mathematics.
        + Has a relatively close proximity to your residence in CCK, making it a convenient option.
        + As an Independent School, it may offer more autonomy and flexibility in terms of curriculum design, which could be beneficial for students with specific interests like game development.

In conclusion, all three institutions offer a strong foundation in mathematics, which aligns with your strength. However, Ngee Ann Polytechnic stands out in terms of its direct relevance to game development, while Victoria Junior College and Hwa Chong Institution provide a more theoretical foundation that can be beneficial for future university studies.

"""

tidb_connection_string = "mysql+pymysql://3VtFvoqGuf9wE8R.root:S2Ls7Ill5u5kujAU@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"



Settings.llm = Groq(model="llama3-70b-8192", api_key=os.getenv('GROQ_API_KEY'))

Settings.embed_model = HuggingFaceEmbedding(
    model_name="BAAI/bge-small-en-v1.5"
)

history = TiDBChatMessageHistory(
    connection_string=tidb_connection_string,
    session_id="user1",
)

memory = ChatMemoryBuffer.from_defaults(token_limit=3900)

manager = TiDBVectorStoreManager()

doc_manager = MySQLManager()

def load_docs() -> List[Document]:
    return doc_manager.load_documents("junior_colleges")  # Your document loading function

index = manager.create_or_load_index(
    documents_loader=load_docs,
    batch_size=1000
)

def add_message(memory, message: ChatMessage) -> None:
    """Add message to both memory buffer and TiDB."""
    # Add to local memory buffer
    memory.put(message)
    
    # Save to TiDB
    if message.role == MessageRole.USER:
        history.add_user_message(message.content)
    elif message.role == MessageRole.ASSISTANT:
        history.add_ai_message(message.content)


def _load_from_tidb():
    """Load messages from TiDB into memory buffer."""
    for msg in history.messages:
        if msg.type == "human":
            chat_msg = ChatMessage(role=MessageRole.USER, content=msg.content)
            memory.put(chat_msg)
        elif msg.type == "ai":
            chat_msg = ChatMessage(role=MessageRole.ASSISTANT, content=msg.content)
            memory.put(chat_msg)


_load_from_tidb()

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

print("ready to chat!")

while True:
    user_text = input("")
    user_input = ChatMessage(role=MessageRole.USER, content=user_text)
    add_message(memory, user_input)
    response = chat_engine.chat(
        user_text
    )
    assistant_message = ChatMessage(role=MessageRole.ASSISTANT, content=str(response))
    add_message(memory, assistant_message)
    print(str(response))

