from minio import Minio
import os
from fastapi import UploadFile
from app.core.logger_config import logger
from minio.error import S3Error

minio_client = Minio(
    os.getenv("MINIO_ENDPOINT"),
    access_key=os.getenv("MINIO_ROOT_USER"),
    secret_key=os.getenv("MINIO_ROOT_PASSWORD"),
    secure=False
)

def upload_files_to_bucket(file: UploadFile, bucket_name: str):
    try:
        logger.info(f"📦 Uploading file '{file.filename}' to bucket '{bucket_name}'")

        if not minio_client.bucket_exists(bucket_name):
            minio_client.make_bucket(bucket_name)

        # Reset file pointer just in case
        file.file.seek(0)

        # Get file size from UploadFile (you can get from headers or content_length)
        # If not available, you might need to read the bytes first (less efficient).
        file.file.seek(0, 2)  # Move to end of file
        file_size = file.file.tell()
        file.file.seek(0)     # Reset to start

        # Upload using put_object: bucket, object_name, data, length, content_type
        minio_client.put_object(
            bucket_name=bucket_name,
            object_name=file.filename,
            data=file.file,
            length=file_size,
            content_type=file.content_type or "application/octet-stream"
        )

        logger.info(f"✅ File '{file.filename}' uploaded successfully to bucket '{bucket_name}'")

    except Exception as e:
        logger.error(f"❌ File upload failed for file '{file.filename}': {e}")
        raise


def list_files_in_bucket(bucket_name: str, prefix: str = "") -> list[str]:
    logger.info(f"📄 Listing files in bucket '{bucket_name}' with prefix '{prefix}'...")
    try:
        objects = minio_client.list_objects(bucket_name, prefix=prefix, recursive=True)
        file_list = [obj.object_name for obj in objects]
        logger.info(f"✅ Found {len(file_list)} file(s) in bucket '{bucket_name}'")
        return file_list
    except S3Error as e:
        logger.error(f"❌ S3Error while listing files in bucket '{bucket_name}': {e}")
        raise
    except Exception as e:
        logger.error(f"❌ Failed to list files in bucket '{bucket_name}': {e}")
        raise

