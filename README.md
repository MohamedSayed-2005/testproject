# Multi-Domain Signal Viewer

A comprehensive web application for analyzing and visualizing signals across multiple domains: **Medical (ECG)**, **Acoustic (Doppler, Drone Detection)**, **Stock Market**, and **Microbiome** data.

## 🌟 Features

### Medical Signal Analysis
- **Multi-channel ECG visualization** with 12-lead support
- **AI-powered arrhythmia classification** using deep learning
- **Classic ML comparison** with traditional HRV analysis
- **Four visualization modes:**
  - **Continuous Viewer**: Grid and overlay modes with synchronized playback
  - **XOR Graph**: Time-chunk overlay with XOR operation
  - **Polar Graph**: Amplitude-time polar representation
  - **Recurrence Graph**: Channel correlation heatmap
- Real-time R-peak detection and HRV analysis
- File upload support (.npy, .csv)

### Acoustic Signal Processing
- **Doppler Effect Simulation**: Generate vehicle passing sounds
- **Velocity Estimation**: Analyze real audio to estimate vehicle speed
- **Drone/Submarine Detection**: Spectral analysis for characteristic sounds
- Interactive spectrogram visualization
- Real-time audio playback

### Stock Market Analysis
- **Real-time data** from Yahoo Finance API
- Support for **stocks, currencies, and commodities**
- **Candlestick charts** with volume visualization
- **AI-powered price prediction** (30-day forecast)
- Moving averages (SMA 20, 50, 200)
- Confidence intervals for predictions

### Microbiome Analysis
- **Bacterial composition** stacked bar charts
- **Abundance heatmaps** with customizable colormaps
- **PCA visualization** for dimensionality reduction
- **Diversity metrics**: Shannon, Simpson, Richness indices
- **Disease prediction** using Random Forest classifier
- Patient profile estimation from microbiome data

## 🏗️ Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** for fast builds
- **Material-UI** for UI components
- **Plotly.js** for interactive charts
- **D3.js** for custom visualizations
- **Axios** for API communication

### Backend
- **Python 3.10+** with **FastAPI**
- **NumPy**, **SciPy**, **Pandas** for data processing
- **Scikit-learn** for machine learning
- **TensorFlow** for deep learning models
- **Librosa** for audio processing
- **yfinance** for stock market data

## 📦 Installation

### Prerequisites
- **Docker** and **Docker Compose** (recommended)
- OR **Python 3.10+** and **Node.js 18+** for manual installation

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/MohamedSayed-2005/testproject.git
cd testproject

# Start both frontend and backend
docker-compose up --build

# Access the application
# Frontend: http://localhost:80
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Option 2: Manual Installation

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:5173
```

## 🚀 Usage

### Medical Signal Analysis

1. Navigate to **Medical Signals** page
2. Click **"Load Demo ECG"** to load synthetic 12-channel ECG data
3. Or click **"Upload ECG File"** to analyze your own data (.npy or .csv format)
4. View AI classification results in the notification banner
5. Compare AI vs Classic ML predictions
6. Switch between viewer modes:
   - **Continuous**: Real-time playback with speed control
   - **XOR**: Overlay cardiac cycles with difference highlighting
   - **Polar**: Circular time-amplitude representation
   - **Recurrence**: Channel correlation analysis

#### Controls
- **Play/Pause**: Control signal playback
- **Speed**: Adjust playback speed (0.5x - 4x)
- **Window Size**: Change visible time window (1-5 seconds)
- **Channel Selection**: Show/hide individual channels
- **Colormap**: Customize visualization colors

### Acoustic Signal Processing

1. Navigate to **Acoustic Signals** page
2. **Doppler Effect Tab:**
   - Adjust vehicle velocity (0-200 km/h)
   - Set horn frequency (100-2000 Hz)
   - Click "Generate Sound" to simulate
   - Play the generated audio
3. **Drone Detection Tab:**
   - Click "Analyze Demo Audio" for drone sound detection
   - View spectrogram and characteristic frequencies
   - Upload your own audio files for analysis

### Stock Market Analysis

1. Navigate to **Stock Market** page
2. Select a symbol (AAPL, GOOGL, currencies, commodities)
3. Choose time period (1W, 1M, 3M, 6M, 1Y, 5Y)
4. View:
   - Candlestick chart with OHLC data
   - 30-day price prediction with confidence intervals
   - Trading volume bar chart
   - Trend and volatility metrics

### Microbiome Analysis

1. Navigate to **Microbiome** page
2. View automatically loaded demo dataset (20 samples, 15 taxa)
3. Explore:
   - **Stacked Bar Chart**: Bacterial composition per sample
   - **Heatmap**: Abundance visualization (customizable colormap)
   - **PCA Plot**: Sample clustering by disease status
   - **Diversity Metrics**: Shannon, Simpson, Richness indices
4. Machine learning model predicts disease status from bacterial profiles

## 📊 Data Formats

### ECG Data Format
- **NumPy (.npy)**: 2D array of shape `(samples, channels)`
- **CSV (.csv)**: Each column represents a channel
- Sampling rate: 500 Hz (default)
- Number of channels: 12 (standard ECG leads)

### Audio Data Format
- **NumPy (.npy)**: 1D array of audio samples
- Sample rate: 44100 Hz
- Normalized amplitude range: [-1, 1]

## 🎨 Features Showcase

### AI vs Classic ML Comparison
The medical module demonstrates the difference between modern deep learning and traditional signal processing:
- **AI Model**: Multi-channel CNN for pattern recognition
- **Classic ML**: Hand-crafted HRV features with rule-based classification
- Side-by-side comparison helps users understand the strengths of each approach

### Interactive Visualizations
- **Synchronized viewers**: Pan, zoom, and playback controls affect all views
- **Real-time updates**: Changes reflect immediately across all charts
- **Responsive design**: Works on desktop and tablet devices
- **Dark/Light theme**: Toggle between themes for comfortable viewing

## 🔧 API Endpoints

### Medical
- `GET /api/medical/demo-ecg` - Generate demo ECG data
- `POST /api/medical/analyze` - Analyze ECG with AI and classic ML
- `POST /api/medical/upload` - Upload ECG file
- `GET /api/medical/r-peaks` - Detect R-peaks

### Acoustic
- `POST /api/acoustic/generate-doppler` - Generate Doppler sound
- `POST /api/acoustic/analyze-doppler` - Analyze audio for Doppler shift
- `POST /api/acoustic/detect-drone` - Detect drone sounds
- `GET /api/acoustic/demo-spectrogram` - Generate demo spectrogram

### Stock
- `GET /api/stock/data/{symbol}` - Get stock data
- `GET /api/stock/predict/{symbol}` - Predict future prices
- `GET /api/stock/list` - List available symbols
- `GET /api/stock/moving-averages/{symbol}` - Calculate moving averages

### Microbiome
- `GET /api/microbiome/demo-data` - Get demo microbiome data
- `GET /api/microbiome/diversity` - Calculate diversity metrics
- `GET /api/microbiome/pca` - Get PCA coordinates
- `GET /api/microbiome/heatmap-data` - Get heatmap data
- `POST /api/microbiome/predict` - Predict patient profile

Full API documentation available at: `http://localhost:8000/docs`

## 🧪 Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build

# Backend uses production ASGI server (uvicorn)
```

## 📝 Project Structure

```
testproject/
├── frontend/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── viewers/       # Signal viewer components
│   │   │   │   ├── ContinuousViewer.tsx
│   │   │   │   ├── XORGraph.tsx
│   │   │   │   ├── PolarGraph.tsx
│   │   │   │   └── ReoccurrenceGraph.tsx
│   │   │   └── Layout.tsx
│   │   ├── pages/             # Route pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── MedicalPage.tsx
│   │   │   ├── AcousticPage.tsx
│   │   │   ├── StockPage.tsx
│   │   │   └── MicrobiomePage.tsx
│   │   ├── services/          # API layer
│   │   │   └── api.ts
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                   # Python FastAPI backend
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── routers/          # API routes
│   │   │   ├── medical.py
│   │   │   ├── acoustic.py
│   │   │   ├── stock.py
│   │   │   └── microbiome.py
│   │   ├── models/           # AI/ML models
│   │   │   ├── ecg_classifier.py
│   │   │   ├── doppler.py
│   │   │   ├── stock_predictor.py
│   │   │   └── microbiome_profiler.py
│   │   └── services/         # Business logic
│   │       ├── signal_processing.py
│   │       ├── classic_ml.py
│   │       └── data_loader.py
│   └── requirements.txt
├── docker-compose.yml
└── README.md
```

## 🎓 Educational Value

This project demonstrates:
- **Full-stack development** with modern frameworks
- **AI/ML integration** in web applications
- **Signal processing** techniques across domains
- **Real-time data visualization**
- **Microservices architecture** with Docker
- **RESTful API design**
- **TypeScript** for type-safe frontend development

## 🐛 Troubleshooting

### Backend Issues
- **ModuleNotFoundError**: Ensure all dependencies are installed with `pip install -r requirements.txt`
- **Port 8000 already in use**: Change port in docker-compose.yml or kill the process using that port

### Frontend Issues
- **Module not found**: Run `npm install` to install dependencies
- **Blank page**: Check browser console for errors, ensure backend is running
- **API connection failed**: Verify backend is running on http://localhost:8000

### Docker Issues
- **Build failed**: Ensure Docker has enough memory (at least 4GB recommended)
- **Container crashed**: Check logs with `docker-compose logs backend` or `docker-compose logs frontend`

## 📄 License

This project is open-source and available under the MIT License.

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Note**: This application includes demo/synthetic data for immediate testing. For production use with real data, ensure proper data validation and privacy compliance.