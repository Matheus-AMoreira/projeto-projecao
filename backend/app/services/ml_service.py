from datetime import datetime

import numpy as np
import pandas as pd
from dateutil.relativedelta import relativedelta
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

from app.models.prediction import Prediction


class MLService:
    def __init__(self, lag_features=3):
        self.lag_features = lag_features
        self.scaler_X = StandardScaler()
        self.scaler_y = StandardScaler()
        self.model = LinearRegression()

    def _prepare_data(self, df: pd.DataFrame):
        """Cria lags e escala os dados."""
        target = "quantidade"
        for lag in range(1, self.lag_features + 1):
            df[f"lag_{lag}"] = df[target].shift(lag)

        df = df.dropna().reset_index(drop=True)
        X = df[[f"lag_{i}" for i in range(1, self.lag_features + 1)]].values
        y = df[target].values.reshape(-1, 1)

        X_scaled = self.scaler_X.fit_transform(X)
        y_scaled = self.scaler_y.fit_transform(y).flatten()
        return X_scaled, y_scaled

    def train_and_predict(self, db, df: pd.DataFrame, key_type: str, key_value: str):
        if len(df) < (self.lag_features + 1):
            raise ValueError(
                f"Dados insuficientes (mínimo {self.lag_features + 1} meses)."
            )

        # 1. Preparação e Treino
        X, y = self._prepare_data(df.copy())
        self.model.fit(X, y)

        # 2. Predição Iterativa (Próximos 6 meses)
        predictions = []
        last_data = df.tail(self.lag_features)["quantidade"].values.tolist()
        current_date = datetime.now()

        for i in range(6):
            input_lags = np.array(last_data[-self.lag_features :]).reshape(1, -1)
            input_scaled = self.scaler_X.transform(input_lags)

            pred_scaled = self.model.predict(input_scaled)
            pred_final = self.scaler_y.inverse_transform(pred_scaled.reshape(-1, 1))[0][
                0
            ]
            pred_final = max(0, int(round(pred_final)))

            forecast_date = current_date + relativedelta(months=i + 1)

            pred_entry = {
                "ano": forecast_date.year,
                "mes": forecast_date.month,
                "quantidade": pred_final,
                "categoria": key_value if key_type == "category" else None,
                "name": key_value if key_type == "name" else None,
            }
            predictions.append(pred_entry)
            last_data.append(pred_final)

        # 3. Persistência no Banco (Responsabilidade do Serviço)
        self._save_to_db(db, predictions, key_type, key_value)
        return predictions

    def _save_to_db(self, db, predictions, key_type, key_value):
        query = db.query(Prediction)
        if key_type == "category":
            query = query.filter(Prediction.categoria == key_value)
        else:
            query = query.filter(Prediction.name == key_value)

        query.delete()

        for p in predictions:
            db.add(Prediction(**p))
        db.commit()


ml_service = MLService()
