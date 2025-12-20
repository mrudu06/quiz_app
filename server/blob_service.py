import os
import io
import zipfile
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

load_dotenv()

class BlobStorageService:
    def __init__(self):
        self.connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.container_name = os.getenv("AZURE_CONTAINER_NAME", "cricket-data")
        
        if not self.connection_string:
            raise ValueError("AZURE_STORAGE_CONNECTION_STRING environment variable is not set.")
            
        self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
        self.container_client = self.blob_service_client.get_container_client(self.container_name)
        
        # Create container if it doesn't exist
        if not self.container_client.exists():
            self.container_client.create_container()

    def list_blobs(self):
        """Lists all blobs in the container."""
        try:
            blob_list = self.container_client.list_blobs()
            return [blob.name for blob in blob_list]
        except Exception as e:
            return f"Error listing blobs: {str(e)}"

    def get_blob_content(self, blob_name):
        """Downloads and returns the content of a blob. Unzips if it's a .zip file."""
        try:
            blob_client = self.container_client.get_blob_client(blob_name)
            download_stream = blob_client.download_blob()
            data = download_stream.readall()

            if blob_name.lower().endswith('.zip'):
                content_accumulator = []
                try:
                    with zipfile.ZipFile(io.BytesIO(data)) as z:
                        for filename in z.namelist():
                            # Skip directories
                            if filename.endswith('/'):
                                continue
                                
                            with z.open(filename) as f:
                                try:
                                    # Attempt to decode as UTF-8
                                    text = f.read().decode('utf-8')
                                    content_accumulator.append(f"--- File: {filename} ---\n{text}\n")
                                except UnicodeDecodeError:
                                    content_accumulator.append(f"--- File: {filename} (Skipped: Binary or non-UTF-8) ---\n")
                    
                    if not content_accumulator:
                        return "Empty zip file or no readable text files found."
                    return "\n".join(content_accumulator)
                except zipfile.BadZipFile:
                    return f"Error: The file '{blob_name}' is not a valid zip file."

            else:
                # Assume plain text for non-zip files
                return data.decode('utf-8')

        except Exception as e:
            return f"Error reading blob '{blob_name}': {str(e)}"

    def upload_blob(self, blob_name, data):
        """Uploads data to a blob."""
        try:
            blob_client = self.container_client.get_blob_client(blob_name)
            blob_client.upload_blob(data, overwrite=True)
            return f"Successfully uploaded {blob_name}"
        except Exception as e:
            return f"Error uploading blob '{blob_name}': {str(e)}"
