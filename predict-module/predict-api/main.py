from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import numpy as np
import pandas as pd
import torch
import os
import glob
from model_utils import (
    load_data, add_time_features,
    train_models, MultivariateLSTM, device
)
from datetime import datetime, timedelta

import pickle
import threading

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

def create_features_multivariate_full(df, feature_cols, target_cols=None, window=10):
    X, y = [], []
    for i in range(len(df) - window):
        X.append(df[feature_cols].iloc[i:i+window].values)
        if target_cols:
            y.append(df[target_cols].iloc[i+window].values)

    X = np.array(X)
    y = np.array(y) if target_cols else None
    return X, y

@app.get("/predict/gasfee")
def predict_next_gas_fee():
    df = load_data()
    df = add_time_features(df)

    # Charger les scalers
    with open(f"{MODEL_DIR}/multivariate/scaler_x.pkl", "rb") as f:
        scaler_x = pickle.load(f)
    with open(f"{MODEL_DIR}/multivariate/scaler_y.pkl", "rb") as f:
        scaler_y = pickle.load(f)

    # Charger le modèle entraîné
    latest_model_path = sorted(glob.glob(f"{MODEL_DIR}/multivariate/multivariate_lstm_*.pt"))[-1]
    model = MultivariateLSTM(input_size=9, hidden_size=300).to(device)
    model.load_state_dict(torch.load(latest_model_path, map_location=device))
    model.eval()

    # Préparer les données d'entrée
    feature_cols = ['low_gas_price', 'medium_gas_price', 'high_gas_price',
                    'hour', 'minute', 'dayofweek', 'day', 'month', 'year']
    window = 10
    X_seq, _ = create_features_multivariate_full(df, feature_cols, target_cols=None, window=window)

    # Appliquer la normalisation
    X_last = X_seq[-1:]  # (1, window, features)
    X_last_2d = X_last.reshape(-1, X_last.shape[2])
    X_scaled_2d = scaler_x.transform(X_last_2d)
    X_scaled = X_scaled_2d.reshape(X_last.shape)

    X_input = torch.tensor(X_scaled.astype(np.float32)).to(device)

    # Prédiction
    with torch.no_grad():
        pred_scaled = model(X_input).cpu().numpy()
    pred = scaler_y.inverse_transform(pred_scaled)[0]  # (low, medium, high)

    return {
        "predicted_gas_fee": {
            "low": round(float(pred[0]), 4),
            "medium": round(float(pred[1]), 4),
            "high": round(float(pred[2]), 4)
        }
    }

@app.get("/predict/now")
def predict_until_now():
    # 1. Charger les données et features
    df = load_data()
    df = add_time_features(df)

    feature_cols = ['low_gas_price', 'medium_gas_price', 'high_gas_price',
                    'hour', 'minute', 'dayofweek', 'day', 'month', 'year']
    targets = ['low_gas_price', 'medium_gas_price', 'high_gas_price']
    window = 10

    # 2. Charger les scalers
    with open(f"{MODEL_DIR}/multivariate/scaler_x.pkl", "rb") as f:
        scaler_x = pickle.load(f)
    with open(f"{MODEL_DIR}/multivariate/scaler_y.pkl", "rb") as f:
        scaler_y = pickle.load(f)

    # 3. Charger le modèle
    latest_model_path = sorted(glob.glob(f"{MODEL_DIR}/multivariate/multivariate_lstm_*.pt"))[-1]
    model = MultivariateLSTM(input_size=len(feature_cols), hidden_size=300).to(device)
    model.load_state_dict(torch.load(latest_model_path, map_location=device))
    model.eval()

    # 4. Boucle jusqu'à now
    current_time = datetime.utcnow()
    timestamp_model = latest_model_path.split("_")[-2]+"_"+latest_model_path.split("_")[-1].split(".pt")[0]
    last_timestamp = datetime.strptime(timestamp_model, "%Y%m%d_%H%M%S")# pd.to_datetime(df['timestamp'].iloc[-1])
    print("Last time train: ", last_timestamp)

    df = df.copy()
    t=None
    if (current_time-last_timestamp).total_seconds()//60 >= 10:
        print("Retrain a new model more update to date")
        t=threading.Thread(target=retrain_models).start()

    c=0
    while last_timestamp < current_time:
        # Générer X_seq
        X_seq, _ = create_features_multivariate_full(df, feature_cols, targets, window)
        X_input = X_seq[-1:]
        X_input_scaled = scaler_x.transform(X_input.reshape(-1, X_input.shape[2])).reshape(X_input.shape)

        X_input_t = torch.tensor(X_input_scaled, dtype=torch.float32).to(device)

        with torch.no_grad():
            pred_scaled = model(X_input_t).cpu().numpy()

        pred = scaler_y.inverse_transform(pred_scaled)[0]

        # Générer un faux bloc prédictif à t+1 minute
        last_timestamp += timedelta(minutes=1)

        new_row = {
            'timestamp': last_timestamp,
            'low_gas_price': pred[0],
            'medium_gas_price': pred[1],
            'high_gas_price': pred[2],
        }

        # Ajouter les time features
        time_parts = pd.to_datetime([last_timestamp])
        new_row.update({
            'hour': time_parts.hour[0],
            'minute': time_parts.minute[0],
            'dayofweek': time_parts.dayofweek[0],
            'day': time_parts.day[0],
            'month': time_parts.month[0],
            'year': time_parts.year[0],
        })

        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        c+=1

    print(f"Needed {c} step to predict current gas fee")
    if t is not None:
        t.join()
    # Renvoyer la dernière prédiction
    return {
        "predicted_gas_fee_at_now": {
            "timestamp": str(last_timestamp),
            "low": round(float(pred[0]), 2),
            "medium": round(float(pred[1]), 2),
            "high": round(float(pred[2]), 2),
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
def predict_next_n_steps(n_steps: int = Query(1, ge=1, le=600), key:str=Query("medium_gas_price")):
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
    key_priority = key if key in ['low_gas_price', 'medium_gas_price', 'high_gas_price'] else 'medium_gas_price'
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