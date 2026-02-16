"""Medical signals API endpoints"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import io

from app.models.ecg_classifier import ECGClassifier
from app.services.classic_ml import ECGArrhythmiaDetector
from app.services.signal_processing import (
    generate_synthetic_ecg,
    detect_r_peaks,
    calculate_hrv_features
)

router = APIRouter()

# Initialize models
ecg_classifier = ECGClassifier()
arrhythmia_detector = ECGArrhythmiaDetector()


class ECGAnalysisRequest(BaseModel):
    duration: float = 10.0
    sampling_rate: int = 500
    num_channels: int = 12


@router.get("/demo-ecg")
async def get_demo_ecg(duration: float = 10.0, sampling_rate: int = 500, num_channels: int = 12):
    """Generate synthetic ECG data for demonstration"""
    try:
        ecg_data = generate_synthetic_ecg(duration, sampling_rate, num_channels)
        
        return {
            "data": ecg_data.tolist(),
            "sampling_rate": sampling_rate,
            "num_channels": num_channels,
            "duration": duration,
            "time": np.linspace(0, duration, ecg_data.shape[0]).tolist()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze")
async def analyze_ecg(file: Optional[UploadFile] = File(None), 
                     duration: float = 10.0,
                     sampling_rate: int = 500,
                     num_channels: int = 12):
    """
    Analyze ECG data and return both AI and classic ML predictions
    """
    try:
        # Load or generate ECG data
        if file:
            contents = await file.read()
            # Try to parse as numpy array
            try:
                ecg_data = np.load(io.BytesIO(contents))
            except:
                # Try CSV format
                import pandas as pd
                df = pd.read_csv(io.BytesIO(contents))
                ecg_data = df.values
        else:
            # Generate synthetic data
            ecg_data = generate_synthetic_ecg(duration, sampling_rate, num_channels)
        
        # Ensure 2D array
        if len(ecg_data.shape) == 1:
            ecg_data = ecg_data.reshape(-1, 1)
        
        # AI Classification (on all channels)
        ai_result = ecg_classifier.predict(ecg_data, sampling_rate)
        
        # Classic ML Classification (on first channel)
        first_channel = ecg_data[:, 0]
        r_peaks = detect_r_peaks(first_channel, sampling_rate)
        classic_result = arrhythmia_detector.predict(first_channel, r_peaks, sampling_rate)
        
        # HRV features
        if len(r_peaks) > 1:
            rr_intervals = np.diff(r_peaks) / sampling_rate
            hrv_features = calculate_hrv_features(rr_intervals)
        else:
            hrv_features = {}
        
        return {
            "ai_classification": ai_result,
            "classic_ml_classification": classic_result,
            "hrv_features": hrv_features,
            "r_peaks": r_peaks.tolist(),
            "data_info": {
                "num_samples": ecg_data.shape[0],
                "num_channels": ecg_data.shape[1],
                "duration": ecg_data.shape[0] / sampling_rate,
                "sampling_rate": sampling_rate
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/r-peaks")
async def detect_peaks(channel_index: int = 0,
                      duration: float = 10.0,
                      sampling_rate: int = 500):
    """Detect R-peaks in ECG signal"""
    try:
        # Generate demo ECG
        ecg_data = generate_synthetic_ecg(duration, sampling_rate, 12)
        
        if channel_index >= ecg_data.shape[1]:
            raise HTTPException(status_code=400, detail="Invalid channel index")
        
        channel = ecg_data[:, channel_index]
        r_peaks = detect_r_peaks(channel, sampling_rate)
        
        # Calculate RR intervals
        rr_intervals = np.diff(r_peaks) / sampling_rate
        hrv = calculate_hrv_features(rr_intervals) if len(rr_intervals) > 0 else {}
        
        return {
            "r_peaks": r_peaks.tolist(),
            "rr_intervals": rr_intervals.tolist(),
            "hrv_features": hrv,
            "signal": channel.tolist(),
            "time": np.linspace(0, duration, len(channel)).tolist()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_ecg(file: UploadFile = File(...)):
    """Upload and analyze ECG file"""
    try:
        contents = await file.read()
        
        # Try different formats
        ecg_data = None
        try:
            ecg_data = np.load(io.BytesIO(contents))
        except:
            try:
                import pandas as pd
                df = pd.read_csv(io.BytesIO(contents))
                ecg_data = df.values
            except:
                raise HTTPException(status_code=400, detail="Unsupported file format. Use .npy or .csv")
        
        if len(ecg_data.shape) == 1:
            ecg_data = ecg_data.reshape(-1, 1)
        
        # Analyze
        sampling_rate = 500  # Default
        ai_result = ecg_classifier.predict(ecg_data, sampling_rate)
        
        return {
            "filename": file.filename,
            "classification": ai_result,
            "data_shape": ecg_data.shape,
            "message": "File uploaded and analyzed successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
