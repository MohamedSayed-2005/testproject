# Data Directory

This directory is for storing sample datasets and user-uploaded files.

## Demo Data

The application generates synthetic demo data automatically for all domains:

### Medical Signals
- **Format**: Multi-channel ECG data
- **Channels**: 12 (standard ECG leads: I, II, III, aVR, aVL, aVF, V1-V6)
- **Sampling Rate**: 500 Hz
- **Duration**: 10 seconds (default)
- **Generated automatically** via API endpoint `/api/medical/demo-ecg`

### Acoustic Signals
- **Doppler Effect**: Generated based on velocity and frequency parameters
- **Drone Detection**: Synthetic audio with drone-like frequency patterns
- **Sample Rate**: 44100 Hz
- **Generated automatically** via API endpoints

### Stock Market Data
- **Source**: Yahoo Finance API (yfinance library)
- **Fallback**: Synthetic data using random walk
- **Symbols**: Stocks (AAPL, GOOGL, etc.), Currencies, Commodities
- **Fetched automatically** via API endpoints

### Microbiome Data
- **Format**: Bacterial abundance profiles
- **Samples**: 20 patient samples
- **Taxa**: 15 bacterial species
- **Disease Categories**: Healthy, IBD, IBS
- **Generated automatically** via API endpoint `/api/microbiome/demo-data`

## Real Data Integration

### For Medical ECG Data

You can upload your own ECG data in the following formats:

#### NumPy Format (.npy)
```python
import numpy as np

# ECG data should be 2D array: (num_samples, num_channels)
# Example: 5000 samples, 12 channels
ecg_data = np.random.randn(5000, 12)
np.save('my_ecg.npy', ecg_data)
```

#### CSV Format (.csv)
```csv
ch1,ch2,ch3,ch4,ch5,ch6,ch7,ch8,ch9,ch10,ch11,ch12
0.1,0.2,0.15,0.18,0.22,0.19,0.21,0.17,0.16,0.14,0.23,0.20
...
```

### For Acoustic Audio Data

Upload audio files in NumPy format:

```python
import numpy as np
import librosa

# Load audio file
audio, sr = librosa.load('vehicle_sound.wav', sr=44100)

# Save as NumPy array
np.save('vehicle_sound.npy', audio)
```

## Dataset Downloads

For research and testing, you can use these public datasets:

### Medical ECG Datasets
- **PTB-XL ECG Database**: https://physionet.org/content/ptb-xl/1.0.3/
  - 21,837 clinical 12-lead ECGs from 18,885 patients
  - Multiple diagnostic labels
  - Format: WFDB format (can be converted to NumPy)

- **MIT-BIH Arrhythmia Database**: https://physionet.org/content/mitdb/1.0.0/
  - 48 half-hour excerpts of two-channel ECGs
  - Beat annotations

### Microbiome Datasets
- **Human Microbiome Project (HMP)**: https://hmpdacc.org/
- **iHMP (Integrative HMP)**: https://ibdmdb.org/
- **American Gut Project**: https://github.com/biocore/American-Gut

### Stock Market Data
- Automatically fetched from **Yahoo Finance** via the yfinance API
- No manual download required

### Acoustic Datasets
- **UrbanSound8K**: https://urbansounddataset.weebly.com/urbansound8k.html
  - 8732 labeled sound excerpts
- **ESC-50**: Environmental Sound Classification dataset
  - 2000 environmental audio recordings

## File Structure

```
data/
├── README.md              # This file
├── medical/              # Medical ECG files (optional)
│   ├── sample_ecg.npy
│   └── sample_ecg.csv
├── acoustic/             # Acoustic audio files (optional)
│   ├── doppler_sample.npy
│   └── drone_sample.npy
├── microbiome/           # Microbiome datasets (optional)
│   └── sample_abundance.csv
└── downloads/            # Downloaded datasets (ignored by git)
```

## Notes

- All demo data is **generated synthetically** by the backend
- The application works **immediately** without downloading large datasets
- Upload your own data through the web interface
- Large dataset files are automatically ignored by git (see `.gitignore`)
- For production use, ensure proper data validation and privacy compliance

## Data Privacy

When using real patient or sensitive data:
- Ensure data is **anonymized**
- Follow **HIPAA** or relevant regulations
- Do not commit sensitive data to version control
- Use proper **encryption** for data storage and transmission
- Implement **access controls** for sensitive endpoints
