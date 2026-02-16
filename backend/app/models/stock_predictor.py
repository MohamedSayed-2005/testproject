"""Stock price prediction models"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.preprocessing import MinMaxScaler


class StockPredictor:
    """Stock price prediction using time series analysis"""
    
    def __init__(self):
        self.scaler = MinMaxScaler()
        self.window_size = 60
    
    def prepare_data(self, prices: np.ndarray) -> np.ndarray:
        """Prepare data for prediction"""
        return self.scaler.fit_transform(prices.reshape(-1, 1))
    
    def predict_future(self, historical_data: pd.DataFrame, days: int = 30) -> Dict[str, Any]:
        """
        Predict future stock prices
        
        Args:
            historical_data: DataFrame with historical prices
            days: Number of days to predict
        
        Returns:
            Dictionary with predictions and confidence intervals
        """
        prices = historical_data['close'].values
        
        # Simple trend-based prediction with noise
        # In production, this would use LSTM or Prophet
        
        # Calculate trend
        x = np.arange(len(prices))
        z = np.polyfit(x[-60:], prices[-60:], 1)  # Linear trend from last 60 days
        trend_slope = z[0]
        
        # Calculate volatility
        returns = np.diff(prices[-60:]) / prices[-60:-1]
        volatility = np.std(returns)
        
        # Generate predictions
        last_price = prices[-1]
        predictions = []
        lower_bound = []
        upper_bound = []
        
        for i in range(1, days + 1):
            # Trend + random walk
            predicted = last_price + trend_slope * i + np.random.normal(0, volatility * last_price * np.sqrt(i))
            
            # Confidence interval (95%)
            confidence_margin = 1.96 * volatility * last_price * np.sqrt(i)
            
            predictions.append(float(predicted))
            lower_bound.append(float(predicted - confidence_margin))
            upper_bound.append(float(predicted + confidence_margin))
        
        # Generate future dates
        last_date = historical_data['date'].iloc[-1]
        future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=days, freq='D')
        
        return {
            "predictions": predictions,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
            "dates": [d.strftime('%Y-%m-%d') for d in future_dates],
            "trend_slope": float(trend_slope),
            "volatility": float(volatility)
        }
    
    def calculate_moving_averages(self, prices: np.ndarray, windows: List[int] = [20, 50, 200]) -> Dict[str, List[float]]:
        """Calculate moving averages"""
        mas = {}
        for window in windows:
            if len(prices) >= window:
                ma = pd.Series(prices).rolling(window=window).mean()
                mas[f'ma_{window}'] = ma.fillna(method='bfill').tolist()
            else:
                mas[f'ma_{window}'] = [float(np.nan)] * len(prices)
        return mas
