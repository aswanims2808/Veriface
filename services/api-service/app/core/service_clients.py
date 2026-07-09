import logging
import requests
from app.core.config import Config

logger = logging.getLogger(__name__)

class InferenceServiceClient:
    def __init__(self, endpoint_url: str = Config.INFERENCE_SERVICE_URL):
        self.endpoint_url = endpoint_url

    def predict(self, filename: str, file_bytes: bytes) -> dict:
        url = f"{self.endpoint_url}/predict"
        logger.info(f"Connecting to inference service client at {url}...")
        files = {'file': (filename, file_bytes)}
        try:
            response = requests.post(url, files=files, timeout=60)
            if response.status_code == 200:
                return response.json()
            else:
                try:
                    res_json = response.json()
                    error_msg = res_json.get('error', f"Inference returned status {response.status_code}")
                except Exception:
                    error_msg = f"Inference error: {response.text}"
                return {"prediction": "ERROR", "error": error_msg}
        except Exception as e:
            error_msg = f"Failed to connect to inference service: {str(e)}"
            logger.error(error_msg)
            return {"prediction": "ERROR", "error": error_msg}

    def check_health(self) -> dict:
        url = f"{self.endpoint_url}/health"
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.json()
            return {"status": "unhealthy", "error": f"Status code {response.status_code}"}
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}

def get_inference_client() -> InferenceServiceClient:
    return InferenceServiceClient()
