from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import numpy as np
import torch
import os
import glob
from model_utils import (
    load_data, add_time_features, create_features_multivariate,
    train_models, MultivariateLSTM, device
)
from datetime import timedelta

import pickle

app = FastAPI()

MODEL_DIR = "saved_models"

class PredictRequest(BaseModel):
    timestamp: Optional[str] = None
    model_type: Optional[str] = "multivariate"

@app.get("/models")
def list_models():
    models = {}
    for target_folder in glob.glob(os.path.join(MODEL_DIR, '*')):
        model_files = glob.glob(os.path.join(target_folder, '*'))
        models[os.path.basename(target_folder)] = [os.path.basename(f) for f in model_files]
    return models

@app.get("/metrics")
def get_model_metrics():
    metrics = {}
    for target_folder in glob.glob(os.path.join(MODEL_DIR, '*')):
        model_files = glob.glob(os.path.join(target_folder, '*'))
        for f in model_files:
            if f.endswith(".pkl") or f.endswith(".pt"):
                # Assume RMSE is part of filename, or extract from metadata in future
                metrics.setdefault(os.path.basename(target_folder), []).append({"model": os.path.basename(f)})
    return metrics

@app.get("/retrain")
def retrain_models():
    results = train_models()
    summary = {}
    for key, value in results.items():
        if key == 'multivariate':
            summary[key] = {"model_type": value["model_type"], "rmse": value["rmse"]}
        else:
            summary[key] = {model_type: {"rmse": model_data["rmse"]} for model_type, model_data in value.items()}
    return summary

@app.get("/predict/gasfee")
def predict_next_gas_fee():
    df = load_data()
    df = add_time_features(df)

    latest_model_path = sorted(glob.glob(f"{MODEL_DIR}/multivariate/multivariate_lstm_*.pt"))[-1]
    model = MultivariateLSTM(input_size=9, hidden_size=300).to(device)
    model.load_state_dict(torch.load(latest_model_path, map_location=device))
    model.eval()

    X, _ = create_features_multivariate(df, target_col='medium_gas_price')
    X_input = torch.tensor(X[-1:].astype(np.float32)).to(device)
    with torch.no_grad():
        pred = model(X_input).cpu().numpy().ravel()

    return {
        "predicted_gas_fee": {
            "low": float(pred[0]),
            "medium": float(pred[1]),
            "high": float(pred[2])
        }
    }

def load_model_and_scalers(model_path, scaler_x_path, scaler_y_path):
    model = MultivariateLSTM(input_size=9, hidden_size=300).to(device)
    model.load_state_dict(torch.load(model_path))
    model.eval()

    with open(scaler_x_path, "rb") as f:
        scaler_x = pickle.load(f)
    with open(scaler_y_path, "rb") as f:
        scaler_y = pickle.load(f)

    return model, scaler_x, scaler_y

@app.get("/predict/next_n_steps")
def predict_next_n_steps(n_steps: int = Query(1, ge=1, le=60), key:str=Query("low_gas_price")):
    model_path = sorted(glob.glob(f"{MODEL_DIR}/multivariate/multivariate_lstm_*.pt"))
    if not model_path:
        raise HTTPException(status_code=404, detail="Modèle multivarié non trouvé.")
    
    model_file = model_path[-1]
    scaler_x_path = "saved_models/multivariate/scaler_x.pkl"
    scaler_y_path = "saved_models/multivariate/scaler_y.pkl"

    model, scaler_x, scaler_y = load_model_and_scalers(model_file, scaler_x_path, scaler_y_path)

    df = load_data()
    df = df.sort_values("timestamp").reset_index(drop=True)

    feature_cols = ['low_gas_price', 'medium_gas_price', 'high_gas_price',
                    'hour', 'minute', 'dayofweek', 'day', 'month', 'year']
    window = 10

    df = add_time_features(df)

    features = df[feature_cols].values
    input_seq = features[-window:]

    input_seq_scaled = scaler_x.transform(input_seq)
    current_seq = torch.tensor(input_seq_scaled, dtype=torch.float32).unsqueeze(0).to(device)

    last_timestamp = df['timestamp'].iloc[-1]
    preds = []

    for step in range(1, n_steps + 1):
        with torch.no_grad():
            output_scaled = model(current_seq)
        
        output_scaled_np = output_scaled.cpu().numpy()
        output_np = scaler_y.inverse_transform(output_scaled_np).reshape(-1)

        pred_gas = output_np[:3]
        preds.append(pred_gas.tolist()+[last_timestamp+timedelta(minutes=step-1)])

        next_time = last_timestamp + timedelta(minutes=step)
        next_features = np.array([
            pred_gas[0],
            pred_gas[1],
            pred_gas[2],
            next_time.hour,
            next_time.minute,
            next_time.dayofweek,
            next_time.day,
            next_time.month,
            next_time.year,
        ]).reshape(1, 9)

        next_features_scaled = scaler_x.transform(next_features).reshape(1, 1, 9)
        next_features_tensor = torch.tensor(next_features_scaled, dtype=torch.float32).to(device)

        current_seq = torch.cat([current_seq[:, 1:, :], next_features_tensor], dim=1)

    results = []
    key_priority = key if key in ['low_gas_price', 'medium_gas_price', 'high_gas_price'] else 'low_gas_price'
    for i, p in enumerate(preds, 1):
        results.append({
            "step": i,
            "low_gas_price": float(p[0]),
            "medium_gas_price": float(p[1]),
            "high_gas_price": float(p[2]),
            "timestamp": p[3]
        })
    
    top_k = sorted([{"step":prices["step"], key_priority:prices[key_priority], "timestamp":prices["timestamp"]} for prices in results], key=lambda e: e[key_priority])[:5]

    return {"predictions": top_k}