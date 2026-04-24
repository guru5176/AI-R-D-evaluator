"""
ml_evaluator.py
----------------
Uses the RandomForest model hosted on Hugging Face Hub
(Guru5176/RandD_evaluator) for real ensemble evaluation with
sampling-based uncertainty estimation.
"""

import numpy as np
import sys
import os

# Make sure ml/ is importable regardless of working directory
_ML_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml")
if _ML_DIR not in sys.path:
    sys.path.insert(0, os.path.abspath(_ML_DIR))

from model_loader import get_model
from feature_extractor import extract_features


def ml_evaluate_with_uncertainty(novelty_score: float, budget: float,
                                  text: str = "", n_samples: int = 10):
    """
    Real ML Ensemble Evaluation using the Hugging Face-hosted model.

    Args:
        novelty_score : 0-100 semantic novelty score
        budget        : budget in INR
        text          : full proposal text (for feature extraction)
        n_samples     : number of bootstrap samples for uncertainty

    Returns:
        list[float] - n_samples predictions (spread captures uncertainty)
    """
    model = get_model()
    features = extract_features(text, novelty_score, budget)   # shape (1, 4)

    predictions = []
    for _ in range(n_samples):
        # Bootstrap: slightly perturb features to estimate model variance
        noise = np.random.normal(0, 0.02, size=features.shape)
        perturbed = np.clip(features + noise, 0, 1)
        pred = float(model.predict(perturbed)[0])
        # Clamp to valid score range
        pred = max(0.0, min(100.0, pred))
        predictions.append(pred)

    return predictions
