import os
import tempfile
from typing import List
from fastapi import UploadFile
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from app.core.logger_config import logger
from sentence_transformers import SentenceTransformer
from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams


qdrant_url = os.getenv("QDRANT_ENDPOINT")
collection_name = os.getenv("RAG_VECTOR_DB_COLLECTION_NAME")
model_path = Path(os.getcwd()) / "models" / "all-MiniLM-L6-v2"
embed_model = SentenceTransformer(str(model_path), trust_remote_code=True)
client = QdrantClient(url=qdrant_url)


# Step 1: Chunk PDF into text segments
async def create_file_chunk(file: UploadFile) -> List[Document]:
    try:
        logger.info(f"📄 Chunking file: {file.filename}")

        # Save the uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Load and split the document
        loader = PyMuPDFLoader(file_path=tmp_path)
        pages = loader.load()
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_documents(pages)

        logger.info(f"✅ Created {len(chunks)} chunks for {file.filename}")
        return chunks

    except Exception:
        logger.exception("❌ Failed to create chunks from uploaded file")
        raise
    finally:
        if "tmp_path" in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)


# Step 2: Embed and store in Qdrant
def create_embedding_from_chunk(documents: List[Document]):
    try:
        logger.info(f"🧠 Creating embeddings from {len(documents)} chunks")

        texts = [doc.page_content for doc in documents]

        # ✅ Generate embeddings

        # logger.info("============================= texts to be embedded ==================")
        logger.error("Texts to be embedded :: %s", texts)
        # logger.info("============================= texts to be embedded completed ===================")

        embeddings = embed_model.encode(texts)

        # logger.info("============================= Embedding initiated ==================")
        logger.info("Created embeddings :: %s", embeddings)
        # logger.info("============================= Embedding completed ===================")

        # ✅ Ensure config exists
        if not qdrant_url or not collection_name:
            raise ValueError(
                "Missing QDRANT_ENDPOINT or VECTOR_DB_COLLECTION_NAME in env"
            )

        # ✅ Create collection if missing
        existing = [c.name for c in client.get_collections().collections]
        if collection_name not in existing:
            client.recreate_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=len(embeddings[0]), distance=Distance.COSINE
                ),
            )

        # ✅ Upload to Qdrant
        client.upload_collection(
            collection_name=collection_name,
            vectors=embeddings,
            payload=[
                {
                    **doc.metadata,  # existing metadata fields
                    "page_content": doc.page_content,  # add page content here explicitly
                }
                for doc in documents
            ],
            ids=None,
            batch_size=64,
        )

        logger.info("✅ Embeddings successfully stored in Qdrant")
        return {"status": "success", "vector_count": len(documents)}

    except Exception:
        logger.exception("❌ Embedding creation failed.")
        raise


def get_matched_content_from_vector_store(query: str):
    try:

        logger.info(f"🧠 Extracting query from the database {query}")

        top_k = 5
        query_vector = embed_model.encode(query).tolist()
        search_result = client.search(
            collection_name=collection_name, query_vector=query_vector, limit=top_k
        )

        results = []
        for item in search_result:
            # Create a LangChain Document with page_content and metadata
            doc = Document(
                page_content=item.payload.get("page_content", ""),
                metadata=item.payload.get("metadata") or {},
            )
            # Optionally add score to metadata
            doc.metadata["score"] = item.score
            results.append(doc)
        return results

    except Exception as e:
        logger.error(f"🧠 Extracting query from the database failed, error: {e}")
        raise e
