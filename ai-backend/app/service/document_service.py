from typing import List
from fastapi import UploadFile
from app.core.logger_config import logger
from app.service.doc_processor_service import (
    create_embedding_from_chunk,
    create_file_chunk,
)
from app.service.minio_service import upload_files_to_bucket
import os
from langchain_core.documents import Document


async def handle_file_upload(file: UploadFile):

    try:
        logger.info("Initiating the file upload processing")

        bucket_name = os.getenv("MINIO_DOCUMENT_BUCKET")
        logger.info(f"🗂️ Attempting file upload to bucket: {bucket_name}")
        # 1. Chreating the chunks first
        chunks: List[Document] = await create_file_chunk(file)
        # 2. Embedding creating fromt the chunks
        create_embedding_from_chunk(chunks)

        # 3. Uploading the files to the minio buckets
        upload_files_to_bucket(file=file, bucket_name=bucket_name)
        return {"status": 201, "message": f"File name is {file.filename}."}
    except Exception as e:
        logger.info("File upload processing failed", e)
        raise e
