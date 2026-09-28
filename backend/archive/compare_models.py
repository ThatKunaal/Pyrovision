import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, ExtraTreesClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
import joblib

df = pd.read_csv("labeled_sites_enriched.csv")

features = ['days_active', 'total_detections', 'avg_frp', 'max_frp',
            'avg_brightness', 'std_frp', 'night_ratio']
X = df[features]
y = df['weak_label']

# Labels ko numbers mein convert karo (XGBoost ke liye zaroori hai)
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# SAME split sabke liye — fair comparison ke liye zaroori
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

models = {
    "Random Forest (current)": RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced'),
    "XGBoost": XGBClassifier(n_estimators=200, max_depth=4, learning_rate=0.05, random_state=42, eval_metric='logloss'),
    "LightGBM": LGBMClassifier(n_estimators=200, max_depth=4, learning_rate=0.05, random_state=42, verbose=-1),
    "Gradient Boosting": GradientBoostingClassifier(n_estimators=150, max_depth=3, random_state=42),
    "Extra Trees": ExtraTreesClassifier(n_estimators=100, random_state=42, class_weight='balanced'),
    "Logistic Regression": LogisticRegression(max_iter=1000, class_weight='balanced'),
    "SVM": SVC(kernel='rbf', class_weight='balanced', random_state=42),
}

results = []
for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    results.append({"Model": name, "Accuracy": round(acc, 4)})
    print(f"\n{'=' * 50}")
    print(f"{name} — Accuracy: {acc:.4f}")
    print(classification_report(y_test, preds, target_names=le.classes_))

print("\n" + "=" * 60)
print("FINAL COMPARISON:")
results_df = pd.DataFrame(results).sort_values("Accuracy", ascending=False)
print(results_df.to_string(index=False))

best_name = results_df.iloc[0]["Model"]
best_model = models[best_name]
joblib.dump(best_model, "wildfire_model_best.pkl")
print(f"\nBest model: {best_name} — saved as wildfire_model_best.pkl")