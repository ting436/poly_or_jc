import os
from llama_index.llms.groq import Groq
# from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    load_index_from_storage,
    Settings
)
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

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


    # check if storage already exists
        
    PERSIST_DIR = "./storage"

    Settings.llm = Groq(model="llama3-70b-8192", api_key=os.getenv('GROQ_API_KEY'))
    Settings.embed_model = HuggingFaceEmbedding(
        model_name="BAAI/bge-small-en-v1.5"
    )

    if not os.path.exists(PERSIST_DIR):
        # load the documents and create the index
        documents = SimpleDirectoryReader("data").load_data()
        index = VectorStoreIndex.from_documents(documents)
        # store it for later
        index.storage_context.persist(persist_dir=PERSIST_DIR)
    else:
        # load the existing index
        storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
        index = load_index_from_storage(storage_context)


    # Either way we can now query the index
    query_engine = index.as_query_engine()
    response = query_engine.query(prompt_test)
    print(response)




if __name__ == "__main__":
    main()