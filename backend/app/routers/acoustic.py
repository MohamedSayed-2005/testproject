"""Acoustic signals API endpoints"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import numpy as np
import io
import wave

from app.models.doppler import DopplerAnalyzer

router = APIRouter()

# Initialize analyzer
doppler_analyzer = DopplerAnalyzer()


class DopplerGenerationRequest(BaseModel):
    velocity_kmh: float = 60.0
    frequency_hz: float = 440.0
    duration: float = 5.0


@router.post("/generate-doppler")
async def generate_doppler(request: DopplerGenerationRequest):
    """Generate Doppler effect sound"""
    try:
        audio, sample_rate = doppler_analyzer.generate_doppler_sound(
            request.velocity_kmh,
            request.frequency_hz,
            request.duration
        )
        
        return {
            "audio": audio.tolist(),
            "sample_rate": sample_rate,
            "duration": request.duration,
            "parameters": {
                "velocity_kmh": request.velocity_kmh,
                "frequency_hz": request.frequency_hz
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-doppler")
async def analyze_doppler(file: UploadFile = File(...)):
    """Analyze uploaded audio for Doppler effect"""
    try:
        contents = await file.read()
        
        # Load audio (simplified - in production use librosa)
        try:
            # Try numpy format
            audio = np.load(io.BytesIO(contents))
            sample_rate = 44100  # Default
        except:
            raise HTTPException(status_code=400, detail="Unsupported audio format. Use .npy for now")
        
        # Analyze
        result = doppler_analyzer.analyze_doppler_shift(audio, sample_rate)
        
        return {
            "filename": file.filename,
            "analysis": result,
            "message": "Doppler analysis completed"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detect-drone")
async def detect_drone(file: Optional[UploadFile] = File(None),
                      duration: float = 5.0):
    """Detect drone/submarine sounds in audio"""
    try:
        if file:
            contents = await file.read()
            try:
                audio = np.load(io.BytesIO(contents))
                sample_rate = 44100
            except:
                raise HTTPException(status_code=400, detail="Unsupported audio format")
        else:
            # Generate demo audio with drone-like sound
            sample_rate = 44100
            t = np.linspace(0, duration, int(duration * sample_rate))
            
            # Simulate drone sound (mix of frequencies)
            audio = (
                np.sin(2 * np.pi * 150 * t) +
                0.5 * np.sin(2 * np.pi * 300 * t) +
                0.3 * np.sin(2 * np.pi * 450 * t) +
                0.2 * np.random.randn(len(t))
            )
            audio = audio / np.max(np.abs(audio))
        
        # Detect
        result = doppler_analyzer.detect_drone_sound(audio, sample_rate)
        
        return {
            "detection_result": result,
            "audio_duration": len(audio) / sample_rate
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/demo-spectrogram")
async def get_demo_spectrogram(frequency: float = 440.0, duration: float = 2.0):
    """Generate demo audio and its spectrogram"""
    try:
        sample_rate = 44100
        t = np.linspace(0, duration, int(duration * sample_rate))
        
        # Generate tone
        audio = np.sin(2 * np.pi * frequency * t)
        
        # Compute spectrogram
        from scipy import signal
        f, t_spec, Sxx = signal.spectrogram(audio, sample_rate, nperseg=2048)
        
        return {
            "audio": audio.tolist(),
            "sample_rate": sample_rate,
            "spectrogram": {
                "frequencies": f.tolist(),
                "times": t_spec.tolist(),
                "power": (10 * np.log10(Sxx + 1e-10)).tolist()
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
