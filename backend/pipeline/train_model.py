import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

df = pd.read_csv("labeled_sites_enriched.csv")

# distance/has_facility WAPAS NAHI liya — data leakage avoid karne ke liye
features = ['days_active', 'total_detections', 'avg_frp', 'max_frp',
            'avg_brightness', 'std_frp', 'night_ratio']
X = df[features]
y = df['weak_label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("Training sites:", len(X_train))
print("Testing sites:", len(X_test))

model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
model.fit(X_train, y_train)

predictions = model.predict(X_test)
print("=" * 50)
print("Accuracy:", accuracy_score(y_test, predictions))
print(classification_report(y_test, predictions))

print("=" * 50)
print("Feature Importance:")
for feat, imp in sorted(zip(features, model.feature_importances_), key=lambda x: -x[1]):
    print(f"  {feat}: {imp:.3f}")

joblib.dump(model, "wildfire_model.pkl")
print("Model saved: wildfire_model.pkl")