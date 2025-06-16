import os
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
import numpy as np
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client['apiverse']
collection = db['apis']

model = SentenceTransformer('all-MiniLM-L12-v2')


def get_query_embedding(query: str) -> list:
    """
    Generate a vector embedding for a given query string.
    """
    if not isinstance(query, str):
        raise ValueError("Query must be a string.")
    return model.encode(query).tolist()


def cosine_similarity(a, b):
    """
    Compute cosine similarity between two vectors.
    """
    a = np.array(a)
    b = np.array(b)
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def serialize_doc(doc):
    doc["_id"] = str(doc["_id"])
    doc.pop("embedding", None)
    return doc

def search_apis(query: str, top_k: int = 5):
    query_vector = get_query_embedding(query)
    results = []

    for doc in collection.find({"embedding": {"$exists": True}}):
        doc_vector = doc.get("embedding", [])
        if not doc_vector or not isinstance(doc_vector, list):
            continue
        try:
            score = cosine_similarity(query_vector, doc_vector)
            results.append((score, doc))
        except Exception as e:
            print(f"Error comparing doc {doc.get('name', '')}: {e}")
            continue

    results.sort(reverse=True, key=lambda x: x[0])

    # 👇 Convert ObjectId to str before returning
    return [serialize_doc(doc) for _, doc in results[:top_k]]

    

    # Sort by similarity score in descending order
    results.sort(reverse=True, key=lambda x: x[0])

    return [doc for _, doc in results[:top_k]]


def embed_all_apis():
    """
    Generate and store embeddings for all APIs in the collection.
    """
    for doc in collection.find():
        embedding_text = f"""
        API Name: {doc.get('name', '')}
        Description: {doc.get('description', '')}
        Short Description: {doc.get('short_description', '')}
        Category: {doc.get('category', '')}
        Pricing: {doc.get('pricing', '')}
        Authentication: {doc.get('authentication_type', '')}
        CORS: {doc.get('cors_support', '')}
        Rating: {doc.get('rating', '')}
        Health Score: {doc.get('health_score', '')}
        """

        try:
            embedding = model.encode(embedding_text).tolist()
            collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"embedding": embedding}}
            )
            print(f"✅ Embedded and saved for: {doc.get('name', '')} | Vector Length: {len(embedding)}")
        except Exception as e:
            print(f"❌ Failed to embed {doc.get('name', '')}: {e}")


# Optional: Run embedding script manually if needed
# if __name__ == "__main__":
#     embed_all_apis()

def get_categories():
    """
    Retrieve all unique categories from the APIs collection.
    """
    try:
        category_strings = collection.distinct("category")
        category_count = {}

        for cat_str in category_strings:
            if cat_str:
                # Split and deduplicate within the string
                cats = set(c.strip().lower() for c in cat_str.split(",") if c.strip())
                for cat in cats:
                    if len(cat.split()) == 1:
                        category_count[cat] = category_count.get(cat, 0) + 1

        # Filter to only categories with more than 1 count
        filtered = {cat: count for cat, count in category_count.items() if count > 1}

        return filtered
    except Exception as e:
        print(f"Error retrieving categories: {e}")
        return {}
    
# print(get_categories())