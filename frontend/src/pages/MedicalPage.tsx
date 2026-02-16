import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Upload, Refresh } from '@mui/icons-material';
import { medicalApi } from '../services/api';
import ContinuousViewer from '../components/viewers/ContinuousViewer';
import XORGraph from '../components/viewers/XORGraph';
import PolarGraph from '../components/viewers/PolarGraph';
import ReoccurrenceGraph from '../components/viewers/ReoccurrenceGraph';

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
      id={`viewer-tabpanel-${index}`}
      aria-labelledby={`viewer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MedicalPage() {
  const [ecgData, setEcgData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    setLoading(true);
    try {
      const [ecgResponse, analysisResponse] = await Promise.all([
        medicalApi.getDemoECG(10, 500, 12),
        medicalApi.analyzeECG(undefined, 10, 500, 12),
      ]);

      setEcgData(ecgResponse.data);
      setAnalysis(analysisResponse.data);

      // Show AI classification notification
      const aiResult = analysisResponse.data.ai_classification;
      setNotification({
        open: true,
        message: `AI Classification: ${aiResult.prediction} (Confidence: ${(aiResult.confidence * 100).toFixed(1)}%)`,
        severity: 'info',
      });
    } catch (error) {
      console.error('Error loading demo data:', error);
      setNotification({
        open: true,
        message: 'Error loading demo data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const response = await medicalApi.uploadECG(file);
      const classification = response.data.classification;

      setNotification({
        open: true,
        message: `AI Classification: ${classification.prediction} (Confidence: ${(classification.confidence * 100).toFixed(1)}%)`,
        severity: 'success',
      });

      // Reload data
      await loadDemoData();
    } catch (error) {
      console.error('Error uploading file:', error);
      setNotification({
        open: true,
        message: 'Error uploading file',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Medical Signal Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Multi-channel ECG visualization with AI and classic ML classification
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadDemoData}
              disabled={loading}
            >
              Load Demo ECG
            </Button>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button
              variant="contained"
              component="label"
              startIcon={<Upload />}
              disabled={loading}
            >
              Upload ECG File
              <input
                type="file"
                hidden
                accept=".npy,.csv"
                onChange={handleFileUpload}
              />
            </Button>
          </Grid>
          {loading && (
            <Grid item xs={12} sm="auto">
              <CircularProgress size={24} />
            </Grid>
          )}
        </Grid>

        {analysis && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Alert severity="info">
                  <Typography variant="subtitle2">AI Classification</Typography>
                  <Typography variant="body2">
                    <strong>{analysis.ai_classification.prediction}</strong>
                    <br />
                    Confidence: {(analysis.ai_classification.confidence * 100).toFixed(1)}%
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={6}>
                <Alert severity="warning">
                  <Typography variant="subtitle2">Classic ML Classification</Typography>
                  <Typography variant="body2">
                    <strong>{analysis.classic_ml_classification.prediction}</strong>
                    <br />
                    Confidence: {(analysis.classic_ml_classification.confidence * 100).toFixed(1)}%
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Continuous Viewer" />
          <Tab label="XOR Graph" />
          <Tab label="Polar Graph" />
          <Tab label="Recurrence Graph" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {ecgData && <ContinuousViewer data={ecgData} />}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {ecgData && <XORGraph data={ecgData} />}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {ecgData && <PolarGraph data={ecgData} />}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {ecgData && <ReoccurrenceGraph data={ecgData} />}
        </TabPanel>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
