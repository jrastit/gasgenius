import math
import numpy as np
import os
import psycopg2
import pandas as pd
import torch
import torch.nn as nn
from concurrent.futures import ProcessPoolExecutor
from sklearn.metrics import mean_squared_error


DB_PARAMS = {
    'dbname': os.getenv('POSTGRES_DB'),
    'user': os.getenv('POSTGRES_USER'),
    'password': os.getenv('POSTGRES_PASSWORD'),
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': os.getenv('POSTGRES_PORT', 5432)
}

import joblib
from datetime import datetime
import os
import glob

def save_models(mlp=None, rf=None, lstm=None, folder="saved_models"):
    os.makedirs(folder, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    if mlp:
        joblib.dump(mlp, f"{folder}/mlp_{timestamp}.pkl")
    if rf:
        joblib.dump(rf, f"{folder}/rf_{timestamp}.pkl")
    if lstm:
        torch.save(lstm.state_dict(), f"{folder}/lstm_{timestamp}.pt")

class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=50):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.linear = nn.Linear(hidden_size, 1)

    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        return self.linear(lstm_out[:, -1, :])

def load_data():
    conn = psycopg2.connect(**DB_PARAMS)
    df = pd.read_sql("SELECT * FROM gas_history ORDER BY block_number ASC", conn)
    conn.close()
    return df

def create_features(df, window=10):
    data = df['avg_gas_price_gwei'].values
    X, y = [], []
    for i in range(window, len(data)):
        X.append(data[i-window:i])
        y.append(data[i])
    return np.array(X), np.array(y)

# def train_mlp(X_train_s, y_train_s, X_test_s, y_test, scaler_y):
#     from sklearn.neural_network import MLPRegressor

#     mlp = MLPRegressor(hidden_layer_sizes=(64, 64), max_iter=300)
#     mlp.fit(X_train_s, y_train_s)
#     preds = mlp.predict(X_test_s)
#     rmse = math.sqrt(mean_squared_error(y_test, scaler_y.inverse_transform(preds.reshape(-1, 1))))
#     return mlp, rmse

# def train_rf(X_train, y_train, X_test, y_test):
#     from sklearn.ensemble import RandomForestRegressor

#     rf = RandomForestRegressor(n_estimators=100)
#     rf.fit(X_train, y_train)
#     preds = rf.predict(X_test)
#     rmse = math.sqrt(mean_squared_error(y_test, preds))
#     return rf, rmse

# def train_lstm(X_train, y_train, X_test, y_test):
#     from model_utils import LSTMModel  # Assure que cette importation est en haut si nécessaire

#     model = LSTMModel()
#     loss_fn = torch.nn.MSELoss()
#     optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

#     X_train_lstm = torch.tensor(X_train.reshape((-1, 10, 1)), dtype=torch.float32)
#     y_train_lstm = torch.tensor(y_train.reshape(-1, 1), dtype=torch.float32)
#     X_test_lstm = torch.tensor(X_test.reshape((-1, 10, 1)), dtype=torch.float32)
#     y_test_tensor = torch.tensor(y_test.reshape(-1, 1), dtype=torch.float32)

#     for _ in range(50):
#         model.train()
#         output = model(X_train_lstm)
#         loss = loss_fn(output, y_train_lstm)
#         optimizer.zero_grad()
#         loss.backward()
#         optimizer.step()

#     model.eval()
#     with torch.no_grad():
#         preds = model(X_test_lstm).numpy().ravel()

#     rmse = math.sqrt(mean_squared_error(y_test, preds))
#     return model, rmse

# def train_models():
#     from sklearn.preprocessing import MinMaxScaler

#     df = load_data()
#     X, y = create_features(df)
#     split = int(len(X) * 0.8)
#     X_train, y_train = X[:split], y[:split]
#     X_test, y_test = X[split:], y[split:]

#     scaler_x = MinMaxScaler().fit(X_train)
#     scaler_y = MinMaxScaler().fit(y_train.reshape(-1, 1))

#     X_train_s = scaler_x.transform(X_train)
#     X_test_s = scaler_x.transform(X_test)
#     y_train_s = scaler_y.transform(y_train.reshape(-1, 1)).ravel()

#     with ProcessPoolExecutor() as executor:
#         futures = {
#             "mlp": executor.submit(train_mlp, X_train_s, y_train_s, X_test_s, y_test, scaler_y),
#             "rf": executor.submit(train_rf, X_train, y_train, X_test, y_test),
#             "lstm": executor.submit(train_lstm, X_train, y_train, X_test, y_test)
#         }

#         mlp, rf, lstm = None, None, None
#         metrics = {}

#         for name, future in futures.items():
#             model, rmse = future.result()
#             metrics[name] = rmse
#             if name == "mlp":
#                 mlp = model
#             elif name == "rf":
#                 rf = model
#             elif name == "lstm":
#                 lstm = model

#     save_models(mlp, rf, lstm)

#     return mlp, rf, lstm, scaler_x, scaler_y, df, metrics

import concurrent.futures
import math
from sklearn.metrics import mean_squared_error
from sklearn.ensemble import RandomForestRegressor
from sklearn.neural_network import MLPRegressor
from model_utils import LSTMModel
from sklearn.preprocessing import MinMaxScaler

import concurrent.futures
import math
from sklearn.metrics import mean_squared_error

def create_features_multivariate(df, target_col, window=10):
    data = df[target_col].values
    X, y = [], []
    for i in range(window, len(data)):
        X.append(data[i-window:i])
        y.append(data[i])
    return np.array(X), np.array(y)

def train_model_for_target_and_type(df, target_col, model_type):
    X, y = create_features_multivariate(df, target_col)
    split = int(len(X) * 0.8)
    X_train, y_train = X[:split], y[:split]
    X_test, y_test = X[split:], y[split:]

    scaler_x = MinMaxScaler().fit(X_train)
    scaler_y = MinMaxScaler().fit(y_train.reshape(-1, 1))
    X_train_s = scaler_x.transform(X_train)
    X_test_s = scaler_x.transform(X_test)
    y_train_s = scaler_y.transform(y_train.reshape(-1, 1)).ravel()

    model = None
    rmse = None

    if model_type == 'mlp':
        model = MLPRegressor(hidden_layer_sizes=(64, 64), max_iter=300)
        model.fit(X_train_s, y_train_s)
        preds = scaler_y.inverse_transform(model.predict(X_test_s).reshape(-1, 1)).ravel()
        rmse = math.sqrt(mean_squared_error(y_test, preds))

    elif model_type == 'random_forest':
        model = RandomForestRegressor(n_estimators=100)
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        rmse = math.sqrt(mean_squared_error(y_test, preds))

    elif model_type == 'lstm':
        model = LSTMModel()
        loss_fn = torch.nn.MSELoss()
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

        X_lstm = torch.tensor(X.reshape((-1, 10, 1)), dtype=torch.float32)
        y_lstm = torch.tensor(y.reshape(-1, 1), dtype=torch.float32)

        for epoch in range(50):
            model.train()
            output = model(X_lstm)
            loss = loss_fn(output, y_lstm)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        model.eval()
        with torch.no_grad():
            lstm_preds = model(torch.tensor(X_test.reshape((-1, 10, 1)), dtype=torch.float32)).numpy().ravel()
        rmse = math.sqrt(mean_squared_error(y_test, lstm_preds))

    return {
        'target': target_col,
        'model_type': model_type,
        'model': model,
        'scaler_x': scaler_x if model_type != 'random_forest' else None,
        'scaler_y': scaler_y if model_type != 'random_forest' else None,
        'rmse': rmse
    }


def train_models():
    df = load_data()
    targets = ['low_gas_price', 'medium_gas_price', 'high_gas_price']
    model_types = ['mlp', 'random_forest', 'lstm']

    results = {}

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        for target in targets:
            for model_type in model_types:
                futures.append(executor.submit(train_model_for_target_and_type, df, target, model_type))

        for future in concurrent.futures.as_completed(futures):
            res = future.result()
            target = res['target']
            model_type = res['model_type']
            print(f"Finished training {model_type} for {target}")

            if target not in results:
                results[target] = {}

            results[target][model_type] = {
                'model': res['model'],
                'scaler_x': res['scaler_x'],
                'scaler_y': res['scaler_y'],
                'rmse': res['rmse']
            }

            # Save model to folder
            save_models(
                mlp=res['model'] if model_type == 'mlp' else None,
                rf=res['model'] if model_type == 'random_forest' else None,
                lstm=res['model'] if model_type == 'lstm' else None,
                folder=f"saved_models/{target}"
            )
    print("Finished training models")
    return results


def save_prediction(predictions, metrics=None):
    with psycopg2.connect(**DB_PARAMS) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id SERIAL PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                model TEXT NOT NULL,
                value NUMERIC NOT NULL
            );
            CREATE TABLE IF NOT EXISTS model_metrics (
                id SERIAL PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                model TEXT NOT NULL,
                rmse NUMERIC NOT NULL
            );
        """)

        for model, value in predictions.items():
            cursor.execute("INSERT INTO predictions (model, value) VALUES (%s, %s)", (model, value))

        if metrics:
            for model, rmse in metrics.items():
                cursor.execute("INSERT INTO model_metrics (model, rmse) VALUES (%s, %s)", (model, rmse))

        conn.commit()

def load_latest_models(folder="saved_models"):
    def latest_file(pattern):
        files = glob.glob(pattern)
        return max(files, key=os.path.getctime) if files else None

    mlp_path = latest_file(f"{folder}/mlp_*.pkl")
    rf_path = latest_file(f"{folder}/rf_*.pkl")
    lstm_path = latest_file(f"{folder}/lstm_*.pt")

    if not all([mlp_path, rf_path, lstm_path]):
        return None, None, None

    mlp = joblib.load(mlp_path)
    rf = joblib.load(rf_path)
    lstm = LSTMModel()
    lstm.load_state_dict(torch.load(lstm_path))
    lstm.eval()
    return mlp, rf, lstm

def predict_next(results, df):
    predictions = {}

    for target, models in results.items():
        window = df[target].values[-10:]
        x_input = window.reshape(1, -1)

        preds = {}

        # MLP
        if 'mlp' in models:
            scaler_x = models['mlp']['scaler_x']
            scaler_y = models['mlp']['scaler_y']
            model = models['mlp']['model']
            x_scaled = scaler_x.transform(x_input)
            pred = model.predict(x_scaled)
            preds['mlp'] = round(float(scaler_y.inverse_transform(pred.reshape(-1, 1))[0][0]), 4)

        # Random Forest
        if 'random_forest' in models:
            model = models['random_forest']['model']
            preds['random_forest'] = round(float(model.predict(x_input)[0]), 4)

        # LSTM
        if 'lstm' in models:
            model = models['lstm']['model']
            x_lstm = torch.tensor(window.reshape(1, 10, 1), dtype=torch.float32)
            model.eval()
            with torch.no_grad():
                lstm_pred = model(x_lstm).numpy().ravel()[0]
            preds['lstm'] = round(float(lstm_pred), 4)

        predictions[target] = preds

    return predictions

