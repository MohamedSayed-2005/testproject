# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Clone the Repository
```bash
git clone https://github.com/MohamedSayed-2005/testproject.git
cd testproject
```

### Step 2: Start the Application

**Option A - Using Docker (Recommended):**
```bash
docker-compose up --build
```

**Option B - Manual Start:**
```bash
chmod +x start.sh
./start.sh
```

### Step 3: Open Your Browser
- **Frontend:** http://localhost:5173 (or http://localhost:80 with Docker)
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

---

## 📱 Using the Application

### Medical Signals
1. Click **"Medical Signals"** in the navigation
2. Click **"Load Demo ECG"** to generate synthetic 12-channel ECG data
3. View the **AI classification notification** at the top
4. Compare **AI vs Classic ML** results
5. Switch between viewer tabs:
   - **Continuous Viewer** - Real-time playback
   - **XOR Graph** - Cardiac cycle comparison
   - **Polar Graph** - Circular representation
   - **Recurrence Graph** - Channel correlation

### Controls
- **Play/Pause** - Control playback
- **Speed** - Adjust speed (0.5x - 4x)
- **Window Size** - Change visible time
- **Channels** - Show/hide individual channels
- **Colormap** - Customize visualization colors

### Acoustic Signals
1. Click **"Acoustic Signals"**
2. Adjust **velocity** (0-200 km/h) and **frequency** (100-2000 Hz)
3. Click **"Generate Sound"** to simulate Doppler effect
4. Click **"Play Audio"** to hear the sound
5. Try **Drone Detection** tab for sound analysis

### Stock Market
1. Click **"Stock Market"**
2. Select a **symbol** (AAPL, GOOGL, etc.)
3. Choose a **time period** (1W, 1M, 1Y, etc.)
4. View candlestick chart and 30-day predictions
5. Observe confidence intervals

### Microbiome
1. Click **"Microbiome"**
2. Explore bacterial composition charts
3. Adjust **colormap** on heatmap
4. View PCA clustering by disease
5. Check diversity metrics

---

## 🛠️ Manual Installation (Without Docker)

### Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup (in new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## 📦 Production Build

### Frontend
```bash
cd frontend
npm run build
# Output in: dist/
```

### Backend
```bash
cd backend
# Already production-ready with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## 🧪 Testing

### Test Backend APIs
```bash
# Health check
curl http://localhost:8000/health

# Get demo ECG
curl http://localhost:8000/api/medical/demo-ecg?duration=5

# List stock symbols
curl http://localhost:8000/api/stock/list

# Get microbiome data
curl http://localhost:8000/api/microbiome/demo-data
```

### View API Documentation
Open http://localhost:8000/docs in your browser to see interactive API documentation with Swagger UI.

---

## 📁 Project Structure
```
testproject/
├── frontend/          # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── backend/           # Python FastAPI
│   ├── app/
│   │   ├── routers/
│   │   ├── models/
│   │   └── services/
│   └── requirements.txt
├── data/              # Data directory
├── docker-compose.yml
├── README.md
└── start.sh
```

---

## ❓ Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000
# Kill the process
kill -9 <PID>
```

### Backend Not Starting
- Check Python version: `python3 --version` (should be 3.10+)
- Install dependencies: `pip install -r backend/requirements.txt`
- Check logs for errors

### Frontend Not Building
- Check Node version: `node --version` (should be 18+)
- Clear cache: `rm -rf frontend/node_modules && cd frontend && npm install`
- Check for TypeScript errors: `cd frontend && npm run build`

### Docker Issues
- Ensure Docker is running
- Clear containers: `docker-compose down -v`
- Rebuild: `docker-compose up --build`

---

## 📚 Learn More

- Full documentation: See [README.md](README.md)
- Implementation details: See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- Data formats: See [data/README.md](data/README.md)

---

## ✨ Features Highlights

✅ **4 Medical Viewer Types** - All implemented  
✅ **AI Classification** - Instant notifications  
✅ **Dark Theme** - Professional UI  
✅ **Real-time Analysis** - Interactive charts  
✅ **Multi-domain** - Medical, Acoustic, Stock, Microbiome  
✅ **Docker Ready** - Easy deployment  

---

**Enjoy exploring the Multi-Domain Signal Viewer! 🎉**
