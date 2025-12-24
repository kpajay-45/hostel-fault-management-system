import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
import joblib

def train_and_save_models():
    """
    Reads fault data, trains classification models for category and priority,
    and saves the trained pipelines to disk.
    """
    # 1. Load and prepare data
    try:
        df = pd.read_csv('fault_data.csv')
        # Drop rows where description might be missing
        df.dropna(subset=['description', 'category', 'priority'], inplace=True)
    except FileNotFoundError:
        print("Error: 'fault_data.csv' not found. Please create it with your training data.")
        return

    X = df['description']
    y_category = df['category']
    y_priority = df['priority']

    # 2. Train Category Model
    print("Training category classification model...")
    # Create a pipeline that first vectorizes the text, then applies the classifier
    category_pipeline = make_pipeline(TfidfVectorizer(), MultinomialNB())
    category_pipeline.fit(X, y_category)
    print("Category model training complete.")

    # 3. Train Priority Model
    print("Training priority classification model...")
    priority_pipeline = make_pipeline(TfidfVectorizer(), MultinomialNB())
    priority_pipeline.fit(X, y_priority)
    print("Priority model training complete.")

    # 4. Save the models/pipelines to disk
    joblib.dump(category_pipeline, 'category_model.joblib')
    joblib.dump(priority_pipeline, 'priority_model.joblib')

    print("\nModels have been successfully trained and saved as:")
    print("- category_model.joblib")
    print("- priority_model.joblib")

if __name__ == '__main__':
    # This block runs when you execute `py train.py`
    train_and_save_models()