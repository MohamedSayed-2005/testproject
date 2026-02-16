"""Stock market API endpoints"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
from datetime import datetime, timedelta

from app.models.stock_predictor import StockPredictor
from app.services.data_loader import generate_stock_data

router = APIRouter()

# Initialize predictor
predictor = StockPredictor()

# Cache for stock data
stock_cache = {}


class StockRequest(BaseModel):
    symbol: str
    period: str = "1y"  # 1w, 1m, 3m, 6m, 1y, 5y


@router.get("/data/{symbol}")
async def get_stock_data(symbol: str, period: str = "1y"):
    """
    Get stock data for a symbol
    Supports stocks, currencies, and commodities
    """
    try:
        # Map period to days
        period_map = {
            "1w": 7,
            "1m": 30,
            "3m": 90,
            "6m": 180,
            "1y": 365,
            "5y": 1825
        }
        
        days = period_map.get(period, 365)
        
        # Check cache
        cache_key = f"{symbol}_{period}"
        if cache_key in stock_cache:
            return stock_cache[cache_key]
        
        # Try to fetch real data using yfinance
        try:
            import yfinance as yf
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)
            
            if len(hist) == 0:
                raise ValueError("No data available")
            
            hist = hist.reset_index()
            data = {
                "symbol": symbol,
                "data": {
                    "date": [d.strftime('%Y-%m-%d') for d in hist['Date']],
                    "open": hist['Open'].tolist(),
                    "high": hist['High'].tolist(),
                    "low": hist['Low'].tolist(),
                    "close": hist['Close'].tolist(),
                    "volume": hist['Volume'].tolist()
                },
                "source": "yahoo_finance"
            }
        except:
            # Fall back to synthetic data
            df = generate_stock_data(symbol, days)
            data = {
                "symbol": symbol,
                "data": {
                    "date": [d.strftime('%Y-%m-%d') for d in df['date']],
                    "open": df['open'].tolist(),
                    "high": df['high'].tolist(),
                    "low": df['low'].tolist(),
                    "close": df['close'].tolist(),
                    "volume": df['volume'].tolist()
                },
                "source": "synthetic"
            }
        
        # Cache the result
        stock_cache[cache_key] = data
        
        return data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/predict/{symbol}")
async def predict_stock(symbol: str, days: int = 30, period: str = "1y"):
    """Predict future stock prices"""
    try:
        # Get historical data
        stock_data = await get_stock_data(symbol, period)
        
        # Convert to DataFrame
        df = pd.DataFrame(stock_data['data'])
        df['date'] = pd.to_datetime(df['date'])
        
        # Predict
        predictions = predictor.predict_future(df, days)
        
        # Calculate moving averages
        mas = predictor.calculate_moving_averages(df['close'].values)
        
        return {
            "symbol": symbol,
            "predictions": predictions,
            "moving_averages": mas,
            "last_price": float(df['close'].iloc[-1]),
            "last_date": df['date'].iloc[-1].strftime('%Y-%m-%d')
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
async def list_symbols():
    """List available stock symbols"""
    return {
        "stocks": [
            {"symbol": "AAPL", "name": "Apple Inc.", "type": "stock"},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "type": "stock"},
            {"symbol": "MSFT", "name": "Microsoft Corporation", "type": "stock"},
            {"symbol": "TSLA", "name": "Tesla Inc.", "type": "stock"},
            {"symbol": "AMZN", "name": "Amazon.com Inc.", "type": "stock"}
        ],
        "currencies": [
            {"symbol": "EURUSD=X", "name": "EUR/USD", "type": "currency"},
            {"symbol": "GBPUSD=X", "name": "GBP/USD", "type": "currency"},
            {"symbol": "JPYUSD=X", "name": "JPY/USD", "type": "currency"}
        ],
        "commodities": [
            {"symbol": "GC=F", "name": "Gold", "type": "commodity"},
            {"symbol": "SI=F", "name": "Silver", "type": "commodity"},
            {"symbol": "CL=F", "name": "Crude Oil", "type": "commodity"}
        ]
    }


@router.get("/moving-averages/{symbol}")
async def get_moving_averages(symbol: str, period: str = "1y"):
    """Calculate moving averages for a symbol"""
    try:
        stock_data = await get_stock_data(symbol, period)
        df = pd.DataFrame(stock_data['data'])
        
        prices = df['close'].values
        mas = predictor.calculate_moving_averages(prices, windows=[20, 50, 200])
        
        return {
            "symbol": symbol,
            "moving_averages": mas,
            "dates": df['date'].tolist()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
