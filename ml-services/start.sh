#!/bin/bash
echo "Training ML model..."
python train.py
echo "Starting FastAPI server..."
uvicorn app:app --host 0.0.0.0 --port $PORT
```

Make sure `ml-service/requirements.txt` contains exactly:
```
fastapi==0.115.0
uvicorn==0.30.0
scikit-learn==1.5.0
numpy==1.26.4
pandas==2.2.0
joblib==1.4.2