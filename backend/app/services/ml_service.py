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
        # 1. Validação mínima de dados
        num_registros = len(df)
        if num_registros < (self.lag_features + 1):
            raise ValueError(
                f"Dados insuficientes (mínimo {self.lag_features + 1} meses)."
            )

        # 2. Definição dinâmica do horizonte de previsão
        # Regra: 2 meses -> 1 mês de previsão; até 1 ano (12 meses) -> 6 meses (máximo)
        if num_registros <= 2:
            meses_a_prever = 1
        else:
            # Proporção aproximada ou teto de 6 meses
            meses_a_prever = min(6, num_registros // 2)
            # Garante pelo menos 1 mês se tiver dados suficientes para o lag
            meses_a_prever = max(1, meses_a_prever)

        # 3. Preparação e Treino
        X, y = self._prepare_data(df.copy())
        self.model.fit(X, y)

        # 4. Identificar a data do último registro para começar a partir do mês seguinte
        # Assume-se que o df tem as colunas 'ano' e 'mes' vindas da query
        ultimo_registro = df.iloc[-1]
        data_base = datetime(
            int(ultimo_registro["ano"]), int(ultimo_registro["mes"]), 1
        )

        # 5. Predição Iterativa
        predictions = []
        last_data = df.tail(self.lag_features)["quantidade"].values.tolist()

        for i in range(meses_a_prever):
            input_lags = np.array(last_data[-self.lag_features :]).reshape(1, -1)
            input_scaled = self.scaler_X.transform(input_lags)

            pred_scaled = self.model.predict(input_scaled)
            pred_final = self.scaler_y.inverse_transform(pred_scaled.reshape(-1, 1))[0][
                0
            ]
            pred_final = max(0, int(round(pred_final)))

            # Data é sempre o mês seguinte ao registro anterior
            forecast_date = data_base + relativedelta(months=i + 1)

            pred_entry = {
                "ano": forecast_date.year,
                "mes": forecast_date.month,
                "quantidade": pred_final,
                "categoria": key_value if key_type == "category" else None,
                "name": key_value if key_type == "name" else None,
            }
            predictions.append(pred_entry)
            last_data.append(pred_final)

        # 6. Persistência
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
