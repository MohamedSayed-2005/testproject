"""Classic ML models for signal classification"""
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, Tuple
from scipy import stats


class ECGArrhythmiaDetector:
    """Classic ML-based arrhythmia detector using hand-crafted features"""
    
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def extract_features(self, ecg_signal: np.ndarray, r_peaks: np.ndarray, 
                        sampling_rate: int = 500) -> np.ndarray:
        """
        Extract hand-crafted features from ECG signal
        
        Args:
            ecg_signal: Single-channel ECG signal
            r_peaks: R-peak indices
            sampling_rate: Sampling rate in Hz
        
        Returns:
            Feature vector
        """
        features = []
        
        if len(r_peaks) < 2:
            return np.zeros(15)
        
        # RR intervals
        rr_intervals = np.diff(r_peaks) / sampling_rate
        
        # Statistical features of RR intervals
        features.extend([
            np.mean(rr_intervals),
            np.std(rr_intervals),
            np.min(rr_intervals),
            np.max(rr_intervals),
            np.median(rr_intervals)
        ])
        
        # HRV features
        rr_diff = np.diff(rr_intervals)
        features.extend([
            np.sqrt(np.mean(rr_diff ** 2)),  # RMSSD
            np.sum(np.abs(rr_diff) > 0.05) / len(rr_diff) if len(rr_diff) > 0 else 0,  # pNN50
            60.0 / np.mean(rr_intervals)  # Mean heart rate
        ])
        
        # Signal statistics
        features.extend([
            np.mean(ecg_signal),
            np.std(ecg_signal),
            stats.skew(ecg_signal),
            stats.kurtosis(ecg_signal)
        ])
        
        # Autocorrelation at lag 1
        if len(ecg_signal) > 1:
            features.append(np.corrcoef(ecg_signal[:-1], ecg_signal[1:])[0, 1])
        else:
            features.append(0)
        
        # Approximate entropy
        features.append(self._approximate_entropy(ecg_signal))
        
        # QRS width (approximate)
        if len(r_peaks) > 0:
            qrs_widths = []
            for peak in r_peaks:
                start = max(0, peak - int(0.05 * sampling_rate))
                end = min(len(ecg_signal), peak + int(0.05 * sampling_rate))
                qrs_widths.append(end - start)
            features.append(np.mean(qrs_widths) / sampling_rate)
        else:
            features.append(0)
        
        return np.array(features)
    
    def _approximate_entropy(self, signal: np.ndarray, m: int = 2, r: float = 0.2) -> float:
        """Calculate approximate entropy"""
        def _maxdist(x_i, x_j):
            return max([abs(ua - va) for ua, va in zip(x_i, x_j)])
        
        def _phi(m):
            x = [[signal[j] for j in range(i, i + m - 1 + 1)] for i in range(len(signal) - m + 1)]
            C = [len([1 for x_j in x if _maxdist(x_i, x_j) <= r * np.std(signal)]) / 
                 (len(signal) - m + 1.0) for x_i in x]
            return (len(signal) - m + 1.0) ** (-1) * sum(np.log(C))
        
        try:
            return abs(_phi(m + 1) - _phi(m))
        except:
            return 0.0
    
    def predict(self, ecg_signal: np.ndarray, r_peaks: np.ndarray, 
                sampling_rate: int = 500) -> Dict[str, Any]:
        """
        Predict arrhythmia using rule-based and feature analysis
        
        Args:
            ecg_signal: Single-channel ECG signal
            r_peaks: R-peak indices
            sampling_rate: Sampling rate in Hz
        
        Returns:
            Dictionary with prediction results
        """
        features = self.extract_features(ecg_signal, r_peaks, sampling_rate)
        
        # Rule-based classification
        mean_rr = features[0]
        std_rr = features[1]
        rmssd = features[5]
        mean_hr = features[7]
        
        # Simple rule-based classification
        prediction = "Normal Sinus Rhythm (NSR)"
        confidence = 0.75
        
        # Irregular rhythm detection (possible AF)
        if std_rr > 0.15 and rmssd > 0.1:
            prediction = "Atrial Fibrillation (AF)"
            confidence = 0.70
        # Tachycardia
        elif mean_hr > 100:
            prediction = "Sinus Tachycardia"
            confidence = 0.65
        # Bradycardia
        elif mean_hr < 60:
            prediction = "Sinus Bradycardia"
            confidence = 0.65
        # Very irregular
        elif std_rr > 0.2:
            prediction = "Irregular Rhythm"
            confidence = 0.60
        
        return {
            "prediction": prediction,
            "confidence": confidence,
            "features": {
                "mean_rr_interval": float(mean_rr),
                "std_rr_interval": float(std_rr),
                "rmssd": float(rmssd),
                "mean_heart_rate": float(mean_hr)
            }
        }
