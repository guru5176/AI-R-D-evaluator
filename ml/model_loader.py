"""
model_loader.py
---------------
Downloads and caches the RandomForest evaluator model from Hugging Face Hub.
Model repo: https://huggingface.co/Guru5176/RandD_evaluator
"""

import os
import joblib
from huggingface_hub import hf_hub_download

# -- Config --------------------------------------------------------------------
HF_REPO_ID   = "Guru5176/RandD_evaluator"
MODEL_FILE   = "evaluator_model.pkl"
LOCAL_CACHE  = os.path.join(os.path.dirname(__file__), MODEL_FILE)

# -- Loader --------------------------------------------------------------------
def load_model():
    """
    Return the sklearn RandomForestRegressor.

    Priority:
    1. Local cache at ml/evaluator_model.pkl  (avoids re-download)
    2. Download from Hugging Face Hub and cache locally
    """
    if os.path.exists(LOCAL_CACHE):
        return joblib.load(LOCAL_CACHE)

    print(f"[model_loader] Downloading {MODEL_FILE} from HF Hub ...")
    path = hf_hub_download(
        repo_id=HF_REPO_ID,
        filename=MODEL_FILE,
        repo_type="model",
        local_dir=os.path.dirname(__file__),   # save into ml/
    )
    print(f"[model_loader] Saved to {path}")
    return joblib.load(path)


# Singleton - loaded once at import time
_model = None

def get_model():
    """Thread-safe lazy singleton loader."""
    global _model
    if _model is None:
        _model = load_model()
    return _model
