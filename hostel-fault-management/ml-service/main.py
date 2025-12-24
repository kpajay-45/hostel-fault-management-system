from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

# Load the trained models when the application starts
try:
    category_pipeline = joblib.load('category_model.joblib')
    priority_pipeline = joblib.load('priority_model.joblib')
    print("ML models loaded successfully.")
except FileNotFoundError:
    category_pipeline = None
    priority_pipeline = None
    print("Warning: ML models not found. Please run train.py to generate them.")

# Define the structure of the request body
class FaultInput(BaseModel):
    description: str

@app.post("/predict")
def predict(fault_input: FaultInput):
    """
    Predicts priority and category using trained models.
    """
    if not category_pipeline or not priority_pipeline:
        return {"priority": "Low", "category": "General", "error": "Models not loaded."}
        
    # The input description needs to be in a list for the pipeline
    description = [fault_input.description]
    
    # Predict using the loaded pipelines
    priority = priority_pipeline.predict(description)[0]
    category = category_pipeline.predict(description)[0]
    
    return {"priority": priority, "category": category}