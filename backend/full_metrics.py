import time
import os
import psutil
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import (accuracy_score, precision_recall_fscore_support,
                              roc_auc_score, confusion_matrix)
from xgboost import XGBClassifier
import joblib

# Install karo agar nahi hai: pip install psutil

df = pd.read_csv("labeled_sites_enriched.csv")
features = ['days_active', 'total_detections', 'avg_frp', 'max_frp',
            'avg_brightness', 'std_frp', 'night_ratio']
X = df[features]
y = df['weak_label'].map({'Gas Flare': 0, 'Wildfire': 1})

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

model = XGBClassifier(n_estimators=200, max_depth=4, learning_rate=0.05, random_state=42, eval_metric='logloss')

# ============ PERFORMANCE METRICS ============
process = psutil.Process(os.getpid())
mem_before = process.memory_info().rss / 1024 / 1024  # MB

start = time.time()
model.fit(X_train, y_train)
train_time = time.time() - start

mem_after = process.memory_info().rss / 1024 / 1024

# Single-prediction latency
single_row = X_test.iloc[[0]]
start = time.time()
model.predict(single_row)
single_inference_ms = (time.time() - start) * 1000

# Batch-throughput
start = time.time()
preds_proba = model.predict_proba(X_test)
preds = model.predict(X_test)
batch_time_ms = (time.time() - start) * 1000
throughput = len(X_test) / (batch_time_ms / 1000)  # predictions/second

joblib.dump(model, "temp_model.pkl")
model_size_kb = os.path.getsize("temp_model.pkl") / 1024
os.remove("temp_model.pkl")

# ============ ML METRICS ============
acc = accuracy_score(y_test, preds)
precision, recall, f1, support = precision_recall_fscore_support(y_test, preds, average=None)
macro_precision, macro_recall, macro_f1, _ = precision_recall_fscore_support(y_test, preds, average='macro')
weighted_precision, weighted_recall, weighted_f1, _ = precision_recall_fscore_support(y_test, preds, average='weighted')
roc_auc = roc_auc_score(y_test, preds_proba[:, 1])
cm = confusion_matrix(y_test, preds)

# ============ PRINT SAB KUCH ============
print("=" * 55)
print("PERFORMANCE METRICS")
print("=" * 55)
print(f"Training time:              {train_time:.3f} seconds")
print(f"Single-prediction latency:  {single_inference_ms:.2f} ms")
print(f"Batch throughput:           {throughput:.0f} predictions/second")
print(f"Memory footprint:           {mem_after - mem_before:.2f} MB (delta during training)")
print(f"Model file size:            {model_size_kb:.1f} KB")

print("\n" + "=" * 55)
print("ML METRICS")
print("=" * 55)
print(f"Accuracy:                   {acc:.4f}")
print(f"Macro Precision:            {macro_precision:.4f}")
print(f"Macro Recall:               {macro_recall:.4f}")
print(f"Macro F1-Score:             {macro_f1:.4f}")
print(f"Weighted Precision:         {weighted_precision:.4f}")
print(f"Weighted Recall:            {weighted_recall:.4f}")
print(f"Weighted F1-Score:          {weighted_f1:.4f}")
print(f"ROC-AUC Score:              {roc_auc:.4f}")
print(f"\nPer-Class Metrics:")
print(f"  Gas Flare  — Precision: {precision[0]:.3f}, Recall: {recall[0]:.3f}, F1: {f1[0]:.3f}")
print(f"  Wildfire   — Precision: {precision[1]:.3f}, Recall: {recall[1]:.3f}, F1: {f1[1]:.3f}")
print(f"\nConfusion Matrix:")
print(f"                Predicted-GasFlare  Predicted-Wildfire")
print(f"Actual-GasFlare        {cm[0][0]:>4}                {cm[0][1]:>4}")
print(f"Actual-Wildfire        {cm[1][0]:>4}                {cm[1][1]:>4}")