from fastapi import FastAPI, Query
from fastapi.responses import FileResponse
from model_utils import train_models, predict_next, save_prediction, load_latest_models, load_data
import os
import glob
import psycopg2

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "ok"}

results = None
df = None

def train_and_predict():
    global results, df
    results = train_models()
    df = load_data()
    # Sauvegarder les RMSE des modèles
    metrics = {
        f"{target}_{model}": info['rmse']
        for target, model_data in results.items()
        for model, info in model_data.items()
    }
    save_prediction({}, metrics)

@app.on_event("startup")
def startup_event():
    global results, df
    try:
        df = load_data()
        results = train_models()
        print("✅ Modèles entraînés et chargés au démarrage.")
    except Exception as e:
        print(f"❌ Erreur lors du chargement des modèles : {e}")

@app.get("/predict")
def get_latest_prediction():
    conn = psycopg2.connect(
        dbname=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        host=os.getenv('POSTGRES_HOST'),
        port=os.getenv('POSTGRES_PORT')
    )
    cur = conn.cursor()
    cur.execute("""
        SELECT model, value, created_at FROM predictions
        ORDER BY created_at DESC
        LIMIT 3
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {row[0]: float(row[1]) for row in rows}

@app.get("/predict/live")
def predict_live():
    global results, df
    if results is None or df is None:
        return {"error": "Modèles non disponibles. Relancez l'entraînement via /retrain?force=true"}
    
    pred = predict_next(results, df)
    # Aplatir les résultats pour les enregistrer (clé = target_model)
    flat_preds = {
        f"{target}_{model}": value
        for target, model_values in pred.items()
        for model, value in model_values.items()
    }
    save_prediction(flat_preds)
    return pred

@app.get("/history")
def get_prediction_history():
    conn = psycopg2.connect(
        dbname=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        host=os.getenv('POSTGRES_HOST'),
        port=os.getenv('POSTGRES_PORT')
    )
    cur = conn.cursor()
    cur.execute("""
        SELECT model, value, created_at
        FROM predictions
        ORDER BY created_at DESC
        LIMIT 100
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"model": row[0], "value": float(row[1]), "created_at": row[2]} for row in rows]

@app.get("/download/{model}/{timestamp}")
def download_model(model: str, timestamp: str):
    model_map = {
        "mlp": f"saved_models/mlp_{timestamp}.pkl",
        "rf": f"saved_models/rf_{timestamp}.pkl",
        "lstm": f"saved_models/lstm_{timestamp}.pt"
    }
    path = model_map.get(model)
    if not path or not os.path.exists(path):
        return {"error": "Model file not found."}
    return FileResponse(path, media_type='application/octet-stream', filename=os.path.basename(path))

@app.get("/models/available")
def list_model_versions():
    models = {"mlp": {}, "rf": {}, "lstm": {}}
    for target in ["high_gas_price", "medium_gas_price", "low_gas_price"]:
        for path in glob.glob(f"saved_models/{target}/*.pkl") + glob.glob(f"saved_models/{target}/*.pt"):
            name = os.path.basename(path)
            for model in models:
                if name.startswith(model):
                    timestamp = name.replace(f"{model}_", "").replace(".pkl", "").replace(".pt", "")
                    if not models[model].get(target, False):
                        models[model][target] = []
                    models[model][target].append(timestamp)
    return models

@app.get("/metrics")
def get_latest_metrics():
    conn = psycopg2.connect(
        dbname=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        host=os.getenv('POSTGRES_HOST'),
        port=os.getenv('POSTGRES_PORT')
    )
    cur = conn.cursor()
    cur.execute("""
        SELECT model, rmse, created_at
        FROM model_metrics
        WHERE created_at = (
            SELECT MAX(created_at)
            FROM model_metrics
        )
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {row[0]: float(row[1]) for row in rows}

@app.get("/retrain")
def retrain_models(force: bool = Query(False)):
    if not force:
        return {"message": "Ajoutez ?force=true pour relancer l'entraînement manuellement."}

    try:
        train_and_predict()
        return {"status": "success", "message": "Modèles réentraînés avec succès."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
