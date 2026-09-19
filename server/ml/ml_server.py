#!/usr/bin/env python3
"""
Flask server for KaamAI demand forecasting ML model.
POST /predict -> returns per-SKU demand % for tomorrow.
"""

import os
import numpy as np
import joblib
from flask import Flask, request, jsonify

app = Flask(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.joblib')
bundle = joblib.load(MODEL_PATH)
models = bundle['models']
skus = bundle['skus']

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'kaamai-ml', 'skus': skus})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True) or {}
    # Normalize input
    dow_map = {k: i for i, k in enumerate(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'])}
    dow = dow_map.get(str(data.get('dayOfWeek', '')).lower(), 0)
    rain = float(data.get('rain', 0.0))
    exam = float(data.get('examSeason', False))
    fest = float(data.get('fest', False))
    prior = float(data.get('priorSales', 0.6))
    roll = float(data.get('rollAvg', 0.6))

    X = np.array([[dow, rain, exam, fest, prior, roll]])

    result = {}
    for sku in skus:
        pct = float(models[sku].predict(X)[0])
        pct = max(0.05, min(0.99, pct))
        result[sku] = {
            'pct': round(pct * 100),
            'trend': '+15%' if pct > 0.85 else '+8%' if pct > 0.7 else '+2%'
        }

    return jsonify(result)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print("[KaamAI] ML server starting on port " + str(port))
    app.run(host='0.0.0.0', port=port)