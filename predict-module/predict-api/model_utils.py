import os
import math
import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import psycopg2
from datetime import datetime
from sklearn.metrics import mean_squared_error
from sklearn.ensemble import RandomForestRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import MinMaxScaler
from concurrent.futures import ThreadPoolExecutor
import pickle

# Database configuration
DB_PARAMS = {
    'dbname': os.getenv('POSTGRES_DB'),
    'user': os.getenv('POSTGRES_USER'),
    'password': os.getenv('POSTGRES_PASSWORD'),
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': os.getenv('POSTGRES_PORT', 5432)
}

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Models
class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=50):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.linear = nn.Linear(hidden_size, 1)

    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        return self.linear(lstm_out[:, -1, :])
    
class MultivariateLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, output_size=3,): 
        super(MultivariateLSTM, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size) 
        self.activation = nn.Softplus() 

    def forward(self, x):
        out, _ = self.lstm(x)
        out = out[:, -1, :]  # Keep last output for each sequence
        out = self.fc(out)
        return self.activation(out)

# Data loading and preprocessing
def load_data():
    conn = psycopg2.connect(**DB_PARAMS)
    df = pd.read_sql("SELECT * FROM gas_history ORDER BY block_number ASC", conn)
    conn.close()
    return df

def add_time_features(df):
    df = df.copy()
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')
    df['hour'] = df['timestamp'].dt.hour
    df['minute'] = df['timestamp'].dt.minute
    df['dayofweek'] = df['timestamp'].dt.dayofweek
    df['day'] = df['timestamp'].dt.day
    df['month'] = df['timestamp'].dt.month
    df['year'] = df['timestamp'].dt.year
    return df

def create_features_multivariate(df, target_col, window=10):
    df = add_time_features(df)
    feature_cols = ['low_gas_price', 'medium_gas_price', 'high_gas_price', 'hour', 'minute', 'dayofweek', 'day', 'month', 'year']
    data = df[feature_cols].values
    target = df[target_col].values

    X, y = [], []
    for i in range(window, len(data)):
        X.append(data[i-window:i])
        y.append(target[i])
    return np.array(X), np.array(y)

# Model predict

def predict_next(models_dict, scalers_dict, df, window: int = 10):
    result = {}

    targets = ['low_gas_price', 'medium_gas_price', 'high_gas_price']

    for target in targets:
        # Extract windowed features for this target
        window_vals = df[target].values[-window:]
        x_input = window_vals.reshape(1, -1)

        # Scale input
        scaler_x = scalers_dict[target]['scaler_x']
        scaler_y = scalers_dict[target]['scaler_y']
        x_scaled = scaler_x.transform(x_input)

        # Models
        mlp = models_dict[target]['mlp']
        rf = models_dict[target]['random_forest']
        lstm = models_dict[target]['lstm']

        # Predictions
        mlp_pred = scaler_y.inverse_transform(mlp.predict(x_scaled).reshape(-1, 1))[0][0]
        rf_pred = rf.predict(x_input)[0]

        lstm_input = torch.tensor(x_input.reshape(1, window, 1), dtype=torch.float32)
        lstm_out = lstm(lstm_input).detach().numpy().ravel()[0]
        lstm_pred = scaler_y.inverse_transform([[lstm_out]])[0][0]

        result[target] = {
            "random_forest": round(float(rf_pred), 4),
            "mlp": round(float(mlp_pred), 4),
            "lstm": round(float(lstm_pred), 4)
        }

    return result


# Model training
def train_model_for_target_and_type(df, target_col, model_type):
    X, y = create_features_multivariate(df, target_col)
    split = int(len(X) * 0.8)
    X_train, y_train = X[:split], y[:split]
    X_test, y_test = X[split:], y[split:]

    scaler_x = None
    scaler_y = None
    model = None
    rmse = None

    if model_type != 'lstm':
        X_train_flat = X_train.reshape((X_train.shape[0], -1))
        X_test_flat = X_test.reshape((X_test.shape[0], -1))

        if model_type != 'random_forest':
            scaler_x = MinMaxScaler().fit(X_train_flat)
            scaler_y = MinMaxScaler().fit(y_train.reshape(-1, 1))
            X_train_s = scaler_x.transform(X_train_flat)
            X_test_s = scaler_x.transform(X_test_flat)
            y_train_s = scaler_y.transform(y_train.reshape(-1, 1)).ravel()

    if model_type == 'mlp':
        model = MLPRegressor(hidden_layer_sizes=(64, 64), max_iter=300)
        model.fit(X_train_s, y_train_s)
        preds = scaler_y.inverse_transform(model.predict(X_test_s).reshape(-1, 1)).ravel()
        rmse = math.sqrt(mean_squared_error(y_test, preds))

    elif model_type == 'random_forest':
        model = RandomForestRegressor(n_estimators=100)
        model.fit(X_train_flat, y_train)
        preds = model.predict(X_test_flat)
        rmse = math.sqrt(mean_squared_error(y_test, preds))

    elif model_type == 'lstm':
        num_features = X.shape[2]
        model = LSTMModel(input_size=num_features, hidden_size=50).to(device)
        loss_fn = torch.nn.MSELoss()
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

        X_train_lstm = torch.tensor(X_train, dtype=torch.float32).to(device)
        y_train_lstm = torch.tensor(y_train.reshape(-1, 1), dtype=torch.float32).to(device)
        X_test_lstm = torch.tensor(X_test, dtype=torch.float32).to(device)

        for epoch in range(50):
            model.train()
            output = model(X_train_lstm)
            loss = loss_fn(output, y_train_lstm)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        model.eval()
        with torch.no_grad():
            preds = model(X_test_lstm).cpu().detach().numpy().ravel()
        rmse = math.sqrt(mean_squared_error(y_test, preds))

    return {
        'target': target_col,
        'model_type': model_type,
        'model': model,
        'scaler_x': scaler_x,
        'scaler_y': scaler_y,
        'rmse': rmse
    }

def save_models(mlp=None, rf=None, lstm=None, multivariate_lstm=None, folder="saved_models"):
    os.makedirs(folder, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if mlp:
        joblib.dump(mlp, f"{folder}/mlp_{timestamp}.pkl")
    if rf:      
        joblib.dump(rf, f"{folder}/rf_{timestamp}.pkl")
    if lstm:
        torch.save(lstm.state_dict(), f"{folder}/lstm_{timestamp}.pt")
    if multivariate_lstm:
        torch.save(multivariate_lstm.state_dict(), f"{folder}/multivariate_lstm_{timestamp}.pt")

def create_features_multivariate_full(df, feature_cols, target_cols, window=10):
    df = add_time_features(df)
    data = df[feature_cols].values
    target = df[target_cols].values
    X, y = [], []
    for i in range(window, len(df)):
        X.append(data[i-window:i])  # fenêtre glissante de features
        y.append(target[i])         # valeur cible au temps i (prochaine étape)
    return np.array(X), np.array(y)

def train_models(): 
    df = load_data()
    targets = ['low_gas_price', 'medium_gas_price', 'high_gas_price']
    model_types = ['mlp', 'random_forest', 'lstm']
    results = {}

    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(train_model_for_target_and_type, df, t, m) for t in targets for m in model_types]
        for future in futures:
            res = future.result()
            target = res['target']
            model_type = res['model_type']
            if target not in results:
                results[target] = {}
            results[target][model_type] = {
                'model': res['model'],
                'scaler_x': res['scaler_x'],
                'scaler_y': res['scaler_y'],
                'rmse': res['rmse']
            }
            save_models(
                mlp=res['model'] if model_type == 'mlp' else None,
                rf=res['model'] if model_type == 'random_forest' else None,
                lstm=res['model'] if model_type == 'lstm' else None,
                folder=f"saved_models/{target}"
            )
    
    feature_cols = ['low_gas_price', 'medium_gas_price', 'high_gas_price',
                    'hour', 'minute', 'dayofweek', 'day', 'month', 'year']

    window = 10

    df = add_time_features(df)

    X_seq, y_seq = create_features_multivariate_full(df, feature_cols, targets, window)
    scaler_x = MinMaxScaler()
    X_seq_2d = X_seq.reshape(-1, X_seq.shape[2])
    X_seq_scaled_2d = scaler_x.fit_transform(X_seq_2d)
    X_seq_scaled = X_seq_scaled_2d.reshape(X_seq.shape)

    scaler_y = MinMaxScaler()
    y_seq_scaled = scaler_y.fit_transform(y_seq)

    split = int(len(X_seq) * 0.8)
    X_train, X_test = X_seq_scaled[:split], X_seq_scaled[split:]
    y_train, y_test = y_seq_scaled[:split], y_seq_scaled[split:]

    X_train_t = torch.tensor(X_train, dtype=torch.float32).to(device)
    y_train_t = torch.tensor(y_train, dtype=torch.float32).to(device)
    X_test_t = torch.tensor(X_test, dtype=torch.float32).to(device)
    y_test_t = torch.tensor(y_test, dtype=torch.float32).to(device)

    model = MultivariateLSTM(input_size=X_train.shape[2], hidden_size=300).to(device)
    # loss_fn = nn.MSELoss()

    def custom_loss(y_pred, y_true):
        base_loss = nn.MSELoss()(y_pred, y_true)

        # Pénalise les ordres incorrects
        order_penalty = torch.mean(torch.relu(y_pred[:, 0] - y_pred[:, 1]) +
                                torch.relu(y_pred[:, 1] - y_pred[:, 2]))

        # Pénalise les valeurs négatives
        neg_penalty = torch.mean(torch.relu(-y_pred))

        return base_loss + 10 * order_penalty + 10 * neg_penalty
    
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    epochs = 80
    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        output = model(X_train_t)
        loss = custom_loss(output, y_train_t) #loss_fn(output, y_train_t)
        loss.backward()
        optimizer.step()

        if (epoch + 1) % 10 == 0 or epoch == 0:
            model.eval()
            with torch.no_grad():
                val_preds = model(X_test_t)
                val_loss = custom_loss(val_preds, y_test_t) #loss_fn(val_preds, y_test_t)
            print(f"Epoch {epoch+1}/{epochs} - Train Loss: {loss.item():.4f} - Val Loss: {val_loss.item():.4f}")

    model.eval()
    with torch.no_grad():
        preds_scaled = model(X_test_t).cpu().numpy()
    preds = scaler_y.inverse_transform(preds_scaled)
    y_test_orig = scaler_y.inverse_transform(y_test)

    rmse = math.sqrt(mean_squared_error(y_test_orig, preds))

    results['multivariate'] = {
        'model_type': model_type,
        'model': model,
        'rmse': rmse
    }
    save_dir = "saved_models/multivariate"
    with open(os.path.join(save_dir, "scaler_x.pkl"), "wb") as f:
        pickle.dump(scaler_x, f)
    with open(os.path.join(save_dir, "scaler_y.pkl"), "wb") as f:
        pickle.dump(scaler_y, f)

    save_models(
        multivariate_lstm=model,
        folder=save_dir
    )

    return results