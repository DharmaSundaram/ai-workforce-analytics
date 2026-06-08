import pickle
from pathlib import Path


MODULE_DIR = Path(__file__).resolve().parent
MODEL_PATH = MODULE_DIR / "model.pkl"


def load_future_productivity_model(path=MODEL_PATH):
    model_path = Path(path)
    with open(model_path, "rb") as model_file:
        return pickle.load(model_file)
