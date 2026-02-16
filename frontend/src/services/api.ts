import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Medical API
export const medicalApi = {
  getDemoECG: (duration = 10, samplingRate = 500, numChannels = 12) =>
    api.get(`/api/medical/demo-ecg?duration=${duration}&sampling_rate=${samplingRate}&num_channels=${numChannels}`),
  
  analyzeECG: (formData?: FormData, duration = 10, samplingRate = 500, numChannels = 12) =>
    api.post(`/api/medical/analyze?duration=${duration}&sampling_rate=${samplingRate}&num_channels=${numChannels}`, formData, {
      headers: formData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }),
  
  uploadECG: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/medical/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  detectRPeaks: (channelIndex = 0, duration = 10, samplingRate = 500) =>
    api.get(`/api/medical/r-peaks?channel_index=${channelIndex}&duration=${duration}&sampling_rate=${samplingRate}`),
};

// Acoustic API
export const acousticApi = {
  generateDoppler: (velocityKmh: number, frequencyHz: number, duration = 5) =>
    api.post('/api/acoustic/generate-doppler', {
      velocity_kmh: velocityKmh,
      frequency_hz: frequencyHz,
      duration,
    }),
  
  analyzeDoppler: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/acoustic/analyze-doppler', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  detectDrone: (file?: File, duration = 5) => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/api/acoustic/detect-drone', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post(`/api/acoustic/detect-drone?duration=${duration}`);
  },
  
  getDemoSpectrogram: (frequency = 440, duration = 2) =>
    api.get(`/api/acoustic/demo-spectrogram?frequency=${frequency}&duration=${duration}`),
};

// Stock API
export const stockApi = {
  getData: (symbol: string, period = '1y') =>
    api.get(`/api/stock/data/${symbol}?period=${period}`),
  
  predict: (symbol: string, days = 30, period = '1y') =>
    api.get(`/api/stock/predict/${symbol}?days=${days}&period=${period}`),
  
  listSymbols: () =>
    api.get('/api/stock/list'),
  
  getMovingAverages: (symbol: string, period = '1y') =>
    api.get(`/api/stock/moving-averages/${symbol}?period=${period}`),
};

// Microbiome API
export const microbiomeApi = {
  getDemoData: () =>
    api.get('/api/microbiome/demo-data'),
  
  getDiversity: () =>
    api.get('/api/microbiome/diversity'),
  
  getPCA: () =>
    api.get('/api/microbiome/pca'),
  
  predict: (abundances: number[]) =>
    api.post('/api/microbiome/predict', abundances),
  
  getHeatmapData: () =>
    api.get('/api/microbiome/heatmap-data'),
  
  getTaxaSummary: () =>
    api.get('/api/microbiome/taxa-summary'),
  
  getDiseaseComparison: () =>
    api.get('/api/microbiome/disease-comparison'),
};

export default api;
