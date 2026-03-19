import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib

np.random.seed(42)
n = 2000

# High confidence: low delay, long answers, ANY typing speed
high_conf = pd.DataFrame({
    'response_delay_ms': np.random.normal(1500, 600, n//4).clip(300, 4000),
    'typing_speed_wpm':  np.random.normal(45, 20, n//4).clip(10, 120),  # wide range ok
    'answer_length_words': np.random.normal(90, 25, n//4).clip(50, 200),
    'confidence_score':  np.random.normal(82, 7, n//4).clip(65, 100),
})

# Slow typer but confident: low delay, long answer, slow typing
slow_but_confident = pd.DataFrame({
    'response_delay_ms': np.random.normal(1800, 500, n//4).clip(500, 3500),
    'typing_speed_wpm':  np.random.normal(18, 5, n//4).clip(8, 28),  # slow typing
    'answer_length_words': np.random.normal(85, 20, n//4).clip(55, 180),  # but long answer
    'confidence_score':  np.random.normal(76, 8, n//4).clip(60, 92),  # still high score
})

# Moderate: medium delay, medium answers
mid_conf = pd.DataFrame({
    'response_delay_ms': np.random.normal(5000, 1500, n//4).clip(2000, 9000),
    'typing_speed_wpm':  np.random.normal(40, 15, n//4).clip(15, 80),
    'answer_length_words': np.random.normal(45, 15, n//4).clip(15, 90),
    'confidence_score':  np.random.normal(52, 9, n//4).clip(35, 70),
})

# High anxiety: very long delay, short answers
low_conf = pd.DataFrame({
    'response_delay_ms': np.random.normal(10000, 3000, n//4).clip(5000, 20000),
    'typing_speed_wpm':  np.random.normal(25, 10, n//4).clip(5, 55),
    'answer_length_words': np.random.normal(20, 10, n//4).clip(3, 50),
    'confidence_score':  np.random.normal(28, 8, n//4).clip(8, 48),
})

df = pd.concat([high_conf, slow_but_confident, mid_conf, low_conf]).reset_index(drop=True)

X = df[['response_delay_ms', 'typing_speed_wpm', 'answer_length_words']]
y = df['confidence_score']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

preds = model.predict(X_test)
print(f"MAE: {mean_absolute_error(y_test, preds):.2f}")
print(f"\nFeature importances (should show delay as dominant):")
for feat, imp in zip(X.columns, model.feature_importances_):
    print(f"  {feat}: {imp:.3f}")

joblib.dump(model, 'model.pkl')
print("\nModel saved — retrain complete.")