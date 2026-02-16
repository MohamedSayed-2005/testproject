import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Slider,
  Button,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import Plot from 'react-plotly.js';
import { PlayArrow, Upload } from '@mui/icons-material';
import { acousticApi } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AcousticPage() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Doppler simulation state
  const [velocity, setVelocity] = useState(60); // km/h
  const [frequency, setFrequency] = useState(440); // Hz
  const [dopplerData, setDopplerData] = useState<any>(null);
  
  // Drone detection state
  const [droneResult, setDroneResult] = useState<any>(null);

  const handleGenerateDoppler = async () => {
    setLoading(true);
    try {
      const response = await acousticApi.generateDoppler(velocity, frequency, 5);
      setDopplerData(response.data);
    } catch (error) {
      console.error('Error generating Doppler sound:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectDrone = async () => {
    setLoading(true);
    try {
      const response = await acousticApi.detectDrone(undefined, 5);
      setDroneResult(response.data);
    } catch (error) {
      console.error('Error detecting drone:', error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (audioData: number[], sampleRate: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, audioData.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < audioData.length; i++) {
      channelData[i] = audioData[i];
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  };

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Acoustic Signal Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Doppler effect simulation, velocity estimation, and drone sound detection
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="Doppler Effect" />
          <Tab label="Drone Detection" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Vehicle Doppler Effect Simulation
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Simulate the sound of a vehicle passing by with Doppler effect
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Parameters
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      Vehicle Velocity: {velocity} km/h
                    </Typography>
                    <Slider
                      value={velocity}
                      onChange={(_, value) => setVelocity(value as number)}
                      min={0}
                      max={200}
                      step={5}
                      marks={[
                        { value: 0, label: '0' },
                        { value: 100, label: '100' },
                        { value: 200, label: '200 km/h' },
                      ]}
                    />
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      Horn Frequency: {frequency} Hz
                    </Typography>
                    <Slider
                      value={frequency}
                      onChange={(_, value) => setFrequency(value as number)}
                      min={100}
                      max={2000}
                      step={10}
                      marks={[
                        { value: 100, label: '100' },
                        { value: 1000, label: '1000' },
                        { value: 2000, label: '2000 Hz' },
                      ]}
                    />
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleGenerateDoppler}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                    >
                      Generate Sound
                    </Button>
                  </Box>

                  {dopplerData && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => playAudio(dopplerData.audio, dopplerData.sample_rate)}
                      >
                        Play Audio
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                {dopplerData && (
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Waveform
                    </Typography>
                    <Plot
                      data={[
                        {
                          y: dopplerData.audio.slice(0, 2000),
                          type: 'scatter',
                          mode: 'lines',
                          line: { color: '#90caf9' },
                        },
                      ]}
                      layout={{
                        height: 300,
                        xaxis: { title: 'Sample' },
                        yaxis: { title: 'Amplitude' },
                        margin: { l: 50, r: 20, t: 20, b: 40 },
                      }}
                      style={{ width: '100%' }}
                      config={{ responsive: true }}
                    />
                  </Paper>
                )}
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Doppler Effect Formula:</strong> f_observed = f_source × (c / (c ± v))
                  <br />
                  where c = 343 m/s (speed of sound), v = vehicle velocity
                </Typography>
              </Alert>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Drone/Submarine Sound Detection
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Detect characteristic drone sounds in audio using spectral analysis
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleDetectDrone}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
              >
                Analyze Demo Audio
              </Button>
            </Box>

            {droneResult && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity={droneResult.detection_result.detected ? 'warning' : 'success'}>
                    <Typography variant="subtitle1">
                      {droneResult.detection_result.detected 
                        ? '🚁 Drone Sound Detected!' 
                        : '✓ No Drone Sound Detected'}
                    </Typography>
                    <Typography variant="body2">
                      Confidence: {(droneResult.detection_result.confidence * 100).toFixed(1)}%
                    </Typography>
                  </Alert>
                </Grid>

                {droneResult.detection_result.detected && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Characteristic Frequencies (Hz):
                      </Typography>
                      <Typography variant="body2">
                        {droneResult.detection_result.characteristic_frequencies.join(', ')}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Spectrogram
                    </Typography>
                    <Plot
                      data={[
                        {
                          z: droneResult.detection_result.spectrogram.power,
                          x: droneResult.detection_result.spectrogram.times,
                          y: droneResult.detection_result.spectrogram.frequencies,
                          type: 'heatmap',
                          colorscale: 'Hot',
                          colorbar: { title: 'dB' },
                        },
                      ]}
                      layout={{
                        height: 400,
                        xaxis: { title: 'Time (s)' },
                        yaxis: { title: 'Frequency (Hz)' },
                      }}
                      style={{ width: '100%' }}
                      config={{ responsive: true }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}
