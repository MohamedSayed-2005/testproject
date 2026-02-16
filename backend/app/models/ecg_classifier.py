"""ECG Classification using deep learning"""
import numpy as np
from typing import Dict, Any
import json


class ECGClassifier:
    """
    ECG classifier using a simple CNN model
    This is a simplified version for demonstration
    """
    
    def __init__(self):
        self.classes = [
            "Normal Sinus Rhythm (NSR)",
            "Atrial Fibrillation (AF)",
            "ST-Elevation Myocardial Infarction (STEMI)",
            "Right Bundle Branch Block (RBBB)",
            "Left Bundle Branch Block (LBBB)"
        ]
        self.is_loaded = False
        
    def load_model(self):
        """Load pretrained model (simplified for demo)"""
        # In a real implementation, this would load actual weights
        # For demo purposes, we'll use rule-based classification with some randomness
        self.is_loaded = True
        
    def preprocess(self, ecg_data: np.ndarray, sampling_rate: int = 500) -> np.ndarray:
        """
        Preprocess ECG data for model input
        
        Args:
            ecg_data: Multi-channel ECG data (samples, channels)
            sampling_rate: Sampling rate in Hz
        
        Returns:
            Preprocessed data
        """
        # Normalize each channel
        preprocessed = np.zeros_like(ecg_data)
        for i in range(ecg_data.shape[1]):
            channel = ecg_data[:, i]
            preprocessed[:, i] = (channel - np.mean(channel)) / (np.std(channel) + 1e-8)
        
        return preprocessed
    
    def predict(self, ecg_data: np.ndarray, sampling_rate: int = 500) -> Dict[str, Any]:
        """
        Predict ECG classification
        
        Args:
            ecg_data: Multi-channel ECG data (samples, channels)
            sampling_rate: Sampling rate in Hz
        
        Returns:
            Dictionary with prediction, confidence, and probabilities
        """
        if not self.is_loaded:
            self.load_model()
        
        # Preprocess
        preprocessed = self.preprocess(ecg_data, sampling_rate)
        
        # Feature extraction for rule-based classification
        features = self._extract_features(preprocessed, sampling_rate)
        
        # Rule-based classification (simplified for demo)
        probabilities = self._classify_by_rules(features)
        
        # Get top prediction
        top_idx = np.argmax(probabilities)
        prediction = self.classes[top_idx]
        confidence = probabilities[top_idx]
        
        return {
            "prediction": prediction,
            "confidence": float(confidence),
            "all_probabilities": {
                cls: float(prob) for cls, prob in zip(self.classes, probabilities)
            }
        }
    
    def _extract_features(self, ecg_data: np.ndarray, sampling_rate: int) -> Dict[str, float]:
        """Extract key features from ECG data"""
        features = {}
        
        # Multi-channel analysis
        num_channels = ecg_data.shape[1]
        
        # Variance across channels
        channel_variance = np.var(ecg_data, axis=0)
        features['mean_channel_variance'] = np.mean(channel_variance)
        features['std_channel_variance'] = np.std(channel_variance)
        
        # Amplitude statistics
        features['mean_amplitude'] = np.mean(np.abs(ecg_data))
        features['max_amplitude'] = np.max(np.abs(ecg_data))
        
        # Frequency domain (simplified)
        for i in range(min(3, num_channels)):
            fft = np.fft.fft(ecg_data[:, i])
            power_spectrum = np.abs(fft) ** 2
            features[f'ch{i}_dominant_freq'] = np.argmax(power_spectrum[:len(fft)//2])
        
        # Peak detection (simplified)
        for i in range(min(3, num_channels)):
            signal = ecg_data[:, i]
            threshold = 0.5 * np.max(signal)
            peaks = np.where(signal > threshold)[0]
            if len(peaks) > 1:
                peak_intervals = np.diff(peaks)
                features[f'ch{i}_mean_peak_interval'] = np.mean(peak_intervals)
                features[f'ch{i}_std_peak_interval'] = np.std(peak_intervals)
            else:
                features[f'ch{i}_mean_peak_interval'] = 0
                features[f'ch{i}_std_peak_interval'] = 0
        
        return features
    
    def _classify_by_rules(self, features: Dict[str, float]) -> np.ndarray:
        """
        Rule-based classification (simulating neural network output)
        
        In production, this would be replaced with actual neural network inference
        """
        probabilities = np.random.dirichlet(np.ones(len(self.classes)) * 2)
        
        # Adjust probabilities based on features
        mean_var = features.get('mean_channel_variance', 0)
        std_var = features.get('std_channel_variance', 0)
        
        # Normal rhythm tends to have consistent variance
        if mean_var < 0.5 and std_var < 0.3:
            probabilities[0] *= 2.0  # NSR more likely
        
        # High variance suggests AF
        elif std_var > 0.5:
            probabilities[1] *= 1.8  # AF more likely
        
        # Check peak intervals for bundle branch blocks
        if 'ch0_std_peak_interval' in features:
            std_interval = features['ch0_std_peak_interval']
            if std_interval > 50:
                probabilities[3] *= 1.5  # RBBB more likely
                probabilities[4] *= 1.5  # LBBB more likely
        
        # Normalize
        probabilities = probabilities / np.sum(probabilities)
        
        return probabilities
