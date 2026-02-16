"""Doppler effect simulation and analysis"""
import numpy as np
from typing import Dict, Any, Tuple
from scipy import signal as sp_signal


class DopplerAnalyzer:
    """Analyze and simulate Doppler effect in vehicle sounds"""
    
    def __init__(self, speed_of_sound: float = 343.0):
        self.speed_of_sound = speed_of_sound
    
    def generate_doppler_sound(self, velocity_kmh: float, frequency_hz: float, 
                              duration: float = 5.0, sample_rate: int = 44100) -> Tuple[np.ndarray, int]:
        """
        Generate sound of a vehicle passing with Doppler effect
        
        Args:
            velocity_kmh: Vehicle velocity in km/h
            frequency_hz: Horn frequency in Hz
            duration: Duration in seconds
            sample_rate: Audio sample rate
        
        Returns:
            Tuple of (audio signal, sample rate)
        """
        velocity_ms = velocity_kmh / 3.6  # Convert to m/s
        t = np.linspace(0, duration, int(duration * sample_rate))
        
        # Distance from observer over time (vehicle passes at t = duration/2)
        # Assume vehicle passes at distance d = 10m from observer
        d = 10.0
        vehicle_position = velocity_ms * (t - duration/2)
        distance = np.sqrt(vehicle_position**2 + d**2)
        
        # Doppler shifted frequency
        # f_observed = f_source * (c + v_observer) / (c + v_source)
        # v_source is the radial velocity (component towards/away from observer)
        radial_velocity = velocity_ms * vehicle_position / distance
        f_doppler = frequency_hz * self.speed_of_sound / (self.speed_of_sound + radial_velocity)
        
        # Generate signal with time-varying frequency
        phase = 2 * np.pi * np.cumsum(f_doppler) / sample_rate
        audio = np.sin(phase)
        
        # Add amplitude envelope (loudness decreases with distance)
        amplitude = 1.0 / (distance / d)
        audio *= amplitude
        
        # Normalize
        audio = audio / np.max(np.abs(audio)) * 0.8
        
        return audio.astype(np.float32), sample_rate
    
    def analyze_doppler_shift(self, audio: np.ndarray, sample_rate: int) -> Dict[str, Any]:
        """
        Analyze audio to extract Doppler shift parameters
        
        Args:
            audio: Audio signal
            sample_rate: Sample rate
        
        Returns:
            Dictionary with estimated velocity and frequency
        """
        # Compute spectrogram
        f, t, Sxx = sp_signal.spectrogram(audio, sample_rate, nperseg=2048, noverlap=1536)
        Sxx_db = 10 * np.log10(Sxx + 1e-10)
        
        # Track dominant frequency over time
        dominant_freq_idx = np.argmax(Sxx_db, axis=0)
        dominant_freq = f[dominant_freq_idx]
        
        # Smooth the frequency track
        from scipy.ndimage import median_filter
        dominant_freq_smooth = median_filter(dominant_freq, size=5)
        
        # Find approach and recede frequencies
        mid_point = len(dominant_freq_smooth) // 2
        f_approach = np.mean(dominant_freq_smooth[:mid_point])
        f_recede = np.mean(dominant_freq_smooth[mid_point:])
        
        # Estimate source frequency and velocity
        f_source = 2 * f_approach * f_recede / (f_approach + f_recede)
        
        # v = c * (f_approach - f_recede) / (f_approach + f_recede)
        velocity_ms = self.speed_of_sound * (f_approach - f_recede) / (f_approach + f_recede)
        velocity_kmh = abs(velocity_ms) * 3.6
        
        return {
            "estimated_velocity_kmh": float(velocity_kmh),
            "estimated_frequency_hz": float(f_source),
            "approach_frequency_hz": float(f_approach),
            "recede_frequency_hz": float(f_recede),
            "frequency_track": dominant_freq_smooth.tolist(),
            "time_points": t.tolist()
        }
    
    def detect_drone_sound(self, audio: np.ndarray, sample_rate: int) -> Dict[str, Any]:
        """
        Detect drone/submarine sounds in audio
        
        Args:
            audio: Audio signal
            sample_rate: Sample rate
        
        Returns:
            Detection results
        """
        # Compute spectrogram
        f, t, Sxx = sp_signal.spectrogram(audio, sample_rate, nperseg=2048, noverlap=1536)
        Sxx_db = 10 * np.log10(Sxx + 1e-10)
        
        # Drone characteristic frequencies: 100-500 Hz with harmonics
        drone_band_idx = np.where((f >= 100) & (f <= 500))[0]
        drone_power = np.sum(Sxx[drone_band_idx, :], axis=0)
        
        # Threshold detection
        threshold = np.mean(drone_power) + 2 * np.std(drone_power)
        detections = drone_power > threshold
        
        # Find detection regions
        detection_times = t[detections]
        confidence = float(np.sum(detections) / len(detections))
        
        # Analyze harmonics
        harmonic_peaks = []
        for time_idx in np.where(detections)[0][:10]:  # Check first 10 detections
            spectrum = Sxx[:, time_idx]
            peaks, _ = sp_signal.find_peaks(spectrum[drone_band_idx], height=np.mean(spectrum) * 2)
            if len(peaks) > 0:
                harmonic_peaks.extend(f[drone_band_idx][peaks].tolist())
        
        return {
            "detected": confidence > 0.2,
            "confidence": confidence,
            "detection_times": detection_times.tolist() if len(detection_times) > 0 else [],
            "characteristic_frequencies": list(set([round(freq, 1) for freq in harmonic_peaks[:10]])),
            "spectrogram": {
                "frequencies": f.tolist(),
                "times": t.tolist(),
                "power": Sxx_db.tolist()
            }
        }
