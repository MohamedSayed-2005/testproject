"""Signal processing utilities"""
import numpy as np
from scipy import signal
from typing import Tuple, List, Dict, Any


def generate_synthetic_ecg(duration: float = 10.0, sampling_rate: int = 500, num_channels: int = 12) -> np.ndarray:
    """
    Generate synthetic multi-channel ECG data
    
    Args:
        duration: Duration in seconds
        sampling_rate: Sampling rate in Hz
        num_channels: Number of ECG channels (default 12)
    
    Returns:
        ECG data array of shape (num_samples, num_channels)
    """
    num_samples = int(duration * sampling_rate)
    t = np.linspace(0, duration, num_samples)
    
    # Heart rate ~70 bpm = ~1.17 Hz
    heart_rate = 1.17
    
    ecg_data = np.zeros((num_samples, num_channels))
    
    for ch in range(num_channels):
        # P wave
        p_wave = 0.25 * np.sin(2 * np.pi * heart_rate * t)
        
        # QRS complex (sharp peak)
        qrs_complex = np.zeros_like(t)
        beat_period = 1.0 / heart_rate
        for i in range(int(duration * heart_rate)):
            peak_time = i * beat_period
            # Use gaussian function from scipy.signal.windows
            from scipy.signal.windows import gaussian
            gauss_window = gaussian(num_samples, std=sampling_rate*0.02)
            qrs_complex += 1.5 * gauss_window * \
                          np.roll(np.eye(1, num_samples)[0], int(peak_time * sampling_rate))
        
        # T wave
        t_wave = 0.3 * np.sin(2 * np.pi * heart_rate * t - np.pi/4)
        
        # Combine and add channel-specific variation
        channel_variation = 1.0 + 0.3 * np.sin(ch * np.pi / num_channels)
        ecg_data[:, ch] = (p_wave + qrs_complex + t_wave) * channel_variation
        
        # Add small noise
        ecg_data[:, ch] += 0.05 * np.random.randn(num_samples)
    
    return ecg_data


def detect_r_peaks(ecg_signal: np.ndarray, sampling_rate: int = 500) -> np.ndarray:
    """
    Simple R-peak detection using Pan-Tompkins-like algorithm
    
    Args:
        ecg_signal: 1D ECG signal
        sampling_rate: Sampling rate in Hz
    
    Returns:
        Array of R-peak indices
    """
    # Band-pass filter
    b, a = signal.butter(2, [5, 15], btype='band', fs=sampling_rate)
    filtered = signal.filtfilt(b, a, ecg_signal)
    
    # Differentiation
    diff = np.diff(filtered)
    
    # Squaring
    squared = diff ** 2
    
    # Moving window integration
    window_size = int(0.15 * sampling_rate)
    integrated = np.convolve(squared, np.ones(window_size)/window_size, mode='same')
    
    # Find peaks
    threshold = 0.3 * np.max(integrated)
    peaks, _ = signal.find_peaks(integrated, height=threshold, distance=int(0.6 * sampling_rate))
    
    return peaks


def calculate_hrv_features(rr_intervals: np.ndarray) -> Dict[str, float]:
    """
    Calculate Heart Rate Variability features
    
    Args:
        rr_intervals: Array of RR intervals in seconds
    
    Returns:
        Dictionary of HRV features
    """
    if len(rr_intervals) < 2:
        return {}
    
    # Time domain features
    rr_diff = np.diff(rr_intervals)
    
    features = {
        "mean_rr": float(np.mean(rr_intervals)),
        "std_rr": float(np.std(rr_intervals)),
        "rmssd": float(np.sqrt(np.mean(rr_diff ** 2))),
        "pnn50": float(np.sum(np.abs(rr_diff) > 0.05) / len(rr_diff) * 100),
        "mean_hr": float(60.0 / np.mean(rr_intervals)),
        "std_hr": float(np.std(60.0 / rr_intervals))
    }
    
    return features


def apply_bandpass_filter(signal_data: np.ndarray, lowcut: float, highcut: float, 
                         fs: int, order: int = 4) -> np.ndarray:
    """
    Apply bandpass filter to signal
    
    Args:
        signal_data: Input signal
        lowcut: Low cutoff frequency
        highcut: High cutoff frequency
        fs: Sampling rate
        order: Filter order
    
    Returns:
        Filtered signal
    """
    nyquist = 0.5 * fs
    low = lowcut / nyquist
    high = highcut / nyquist
    b, a = signal.butter(order, [low, high], btype='band')
    return signal.filtfilt(b, a, signal_data)


def compute_spectrogram(audio_signal: np.ndarray, sr: int, 
                       n_fft: int = 2048, hop_length: int = 512) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Compute spectrogram of audio signal
    
    Args:
        audio_signal: Audio signal
        sr: Sample rate
        n_fft: FFT window size
        hop_length: Hop length
    
    Returns:
        Tuple of (frequencies, times, spectrogram)
    """
    f, t, Sxx = signal.spectrogram(audio_signal, sr, nperseg=n_fft, noverlap=n_fft-hop_length)
    return f, t, 10 * np.log10(Sxx + 1e-10)  # Convert to dB
