import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import Plot from 'react-plotly.js';
import { microbiomeApi } from '../services/api';

export default function MicrobiomePage() {
  const [loading, setLoading] = useState(false);
  const [microbiomeData, setMicrobiomeData] = useState<any>(null);
  const [diversity, setDiversity] = useState<any>(null);
  const [pcaData, setPcaData] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [selectedColormap, setSelectedColormap] = useState('Viridis');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dataRes, diversityRes, pcaRes, heatmapRes] = await Promise.all([
        microbiomeApi.getDemoData(),
        microbiomeApi.getDiversity(),
        microbiomeApi.getPCA(),
        microbiomeApi.getHeatmapData(),
      ]);

      setMicrobiomeData(dataRes.data);
      setDiversity(diversityRes.data);
      setPcaData(pcaRes.data);
      setHeatmapData(heatmapRes.data);
    } catch (error) {
      console.error('Error loading microbiome data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStackedBarData = () => {
    if (!microbiomeData) return [];

    const traces = microbiomeData.taxa_names.map((taxa: string, idx: number) => ({
      x: microbiomeData.samples.map((s: any) => s.sample_id),
      y: microbiomeData.samples.map((s: any) => s[taxa]),
      name: taxa,
      type: 'bar',
      marker: {
        color: `hsl(${(idx * 360) / microbiomeData.taxa_names.length}, 70%, 60%)`,
      },
    }));

    return traces;
  };

  const getDiversityData = () => {
    if (!diversity) return [];

    const metrics = ['shannon', 'simpson', 'richness'];
    const traces = metrics.map((metric) => ({
      x: diversity.metrics.map((m: any) => m.sample_id),
      y: diversity.metrics.map((m: any) => m[metric]),
      name: metric.charAt(0).toUpperCase() + metric.slice(1),
      type: 'bar',
    }));

    return traces;
  };

  const getPCAScatterData = () => {
    if (!pcaData) return [];

    const diseaseGroups = [...new Set(pcaData.labels)];
    const traces = diseaseGroups.map((disease: string, idx: number) => {
      const indices = pcaData.labels
        .map((label: string, i: number) => (label === disease ? i : -1))
        .filter((i: number) => i !== -1);

      return {
        x: indices.map((i: number) => pcaData.pca_coords[i][0]),
        y: indices.map((i: number) => pcaData.pca_coords[i][1]),
        mode: 'markers',
        type: 'scatter',
        name: disease,
        text: indices.map((i: number) => pcaData.sample_ids[i]),
        marker: {
          size: 10,
          color: `hsl(${(idx * 360) / diseaseGroups.length}, 70%, 60%)`,
        },
      };
    });

    return traces;
  };

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Microbiome Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Bacterial composition analysis, diversity metrics, and disease prediction
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && microbiomeData && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                Dataset: {microbiomeData.num_samples} samples, {microbiomeData.taxa_names.length} bacterial taxa
                <br />
                Disease categories: {microbiomeData.disease_categories.join(', ')}
              </Typography>
            </Alert>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Bacterial Composition (Stacked Bar Chart)
              </Typography>
              <Plot
                data={getStackedBarData() as any}
                layout={{
                  height: 500,
                  xaxis: { title: 'Sample ID' },
                  yaxis: { title: 'Abundance' },
                  barmode: 'stack',
                  margin: { l: 50, r: 20, t: 20, b: 100 },
                }}
                style={{ width: '100%' }}
                config={{ responsive: true }}
              />
            </Paper>
          </Grid>

          {heatmapData && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Abundance Heatmap
                  </Typography>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Colormap</InputLabel>
                    <Select
                      value={selectedColormap}
                      label="Colormap"
                      onChange={(e) => setSelectedColormap(e.target.value)}
                      size="small"
                    >
                      {['Viridis', 'Plasma', 'Inferno', 'Magma', 'Hot', 'Cool', 'Blues', 'Reds'].map((cm) => (
                        <MenuItem key={cm} value={cm}>
                          {cm}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Plot
                  data={[
                    {
                      z: heatmapData.log_abundance_matrix,
                      x: heatmapData.taxa_names,
                      y: heatmapData.sample_ids,
                      type: 'heatmap',
                      colorscale: selectedColormap,
                      colorbar: { title: 'log10(abundance)' },
                    },
                  ]}
                  layout={{
                    height: 600,
                    xaxis: { title: 'Taxa', tickangle: -45 },
                    yaxis: { title: 'Sample ID' },
                    margin: { l: 100, r: 50, t: 50, b: 150 },
                  }}
                  style={{ width: '100%' }}
                  config={{ responsive: true }}
                />
              </Paper>
            </Grid>
          )}

          {pcaData && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  PCA Visualization
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Principal Component Analysis for dimensionality reduction
                </Typography>
                <Plot
                  data={getPCAScatterData() as any}
                  layout={{
                    height: 500,
                    xaxis: {
                      title: `PC1 (${(pcaData.explained_variance[0] * 100).toFixed(1)}%)`,
                    },
                    yaxis: {
                      title: `PC2 (${(pcaData.explained_variance[1] * 100).toFixed(1)}%)`,
                    },
                    hovermode: 'closest',
                  }}
                  style={{ width: '100%' }}
                  config={{ responsive: true }}
                />
              </Paper>
            </Grid>
          )}

          {diversity && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Diversity Metrics
                </Typography>
                <Plot
                  data={getDiversityData() as any}
                  layout={{
                    height: 400,
                    xaxis: { title: 'Sample ID', tickangle: -45 },
                    yaxis: { title: 'Diversity Index' },
                    barmode: 'group',
                    margin: { l: 50, r: 20, t: 20, b: 100 },
                  }}
                  style={{ width: '100%' }}
                  config={{ responsive: true }}
                />
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Mean Shannon Index:</strong> {diversity.summary.mean_shannon.toFixed(3)}
                    {' | '}
                    <strong>Mean Simpson Index:</strong> {diversity.summary.mean_simpson.toFixed(3)}
                    {' | '}
                    <strong>Mean Richness:</strong> {diversity.summary.mean_richness.toFixed(1)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12}>
            <Alert severity="success">
              <Typography variant="subtitle2">
                Machine Learning Integration
              </Typography>
              <Typography variant="body2">
                A Random Forest classifier has been trained on this dataset to predict patient disease status
                from microbiome profiles. The model achieves good accuracy by analyzing bacterial abundance patterns.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
