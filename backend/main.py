
import json
import joblib
import pandas as pd

from pathlib import Path
from contextlib import asynccontextmanager
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, ConfigDict


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

MODEL_PATH = MODEL_DIR / "conversion_model.joblib"
METADATA_PATH = MODEL_DIR / "model_metadata.json"

model = None
metadata = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, metadata

    with open(METADATA_PATH, "r") as f:
        metadata = json.load(f)

    # Load only our own trusted model artifact
    model = joblib.load(MODEL_PATH)

    yield

    model = None
    metadata = None


app = FastAPI(
    title="MATW-Inspired Conversion Prediction API",
    description=(
        "Experimental e-commerce purchase-conversion "
        "prediction system. Not validated for donor data."
    ),
    version="1.0.0",
    lifespan=lifespan
)


class SessionInput(BaseModel):

    model_config = ConfigDict(extra="forbid")

    Administrative: int = Field(ge=0)
    Administrative_Duration: float = Field(ge=0)

    Informational: int = Field(ge=0)
    Informational_Duration: float = Field(ge=0)

    ProductRelated: int = Field(ge=0)
    ProductRelated_Duration: float = Field(ge=0)

    BounceRates: float = Field(ge=0, le=1)
    SpecialDay: float = Field(ge=0, le=1)

    Month: Literal[
        "Feb", "Mar", "May", "June", "Jul",
        "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    OperatingSystems: str = Field(min_length=1)
    Browser: str = Field(min_length=1)
    Region: str = Field(min_length=1)
    TrafficType: str = Field(min_length=1)

    VisitorType: Literal[
        "New_Visitor",
        "Returning_Visitor",
        "Other"
    ]

    Weekend: bool


@app.get("/health")
def health():

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model unavailable"
        )

    return {
        "status": "healthy",
        "model": metadata["model_name"],
        "model_version": metadata["model_version"],
        "prediction_target": metadata["prediction_target"]
    }


@app.post("/predict")
def predict(session: SessionInput):

    if model is None or metadata is None:
        raise HTTPException(
            status_code=503,
            detail="Model unavailable"
        )

    # Convert validated input to DataFrame
    input_data = session.model_dump()

    input_df = pd.DataFrame(
        [input_data]
    )

    # Preserve exact training feature order
    feature_columns = metadata["input_features"]

    input_df = input_df[feature_columns]

    # Run trained model
    probability = float(
        model.predict_proba(input_df)[0, 1]
    )

    threshold = float(
        metadata["classification_threshold"]
    )

    prediction = int(
        probability >= threshold
    )

    return {
        "prediction": prediction,
        "predicted_class": (
            "Purchase" if prediction == 1
            else "No Purchase"
        ),
        "purchase_probability": round(
            probability, 6
        ),
        "classification_threshold": threshold,
        "model_name": metadata["model_name"],
        "prediction_target": metadata["prediction_target"],
        "donor_model_validated": False
    }
