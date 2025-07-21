from langchain.schema import Document
from langchain.schema import BaseRetriever, Document
from typing import List
from app.service.doc_processor_service import get_matched_content_from_vector_store


class CustomVectorRetriever(BaseRetriever):
    def get_relevant_documents(self, query: str) -> List[Document]:
        return get_matched_content_from_vector_store(query)
