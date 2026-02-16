import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Paper,
  Grid,
} from '@mui/material';

interface ReoccurrenceGraphProps {
  data: {
    data: number[][];
    time: number[];
    sampling_rate: number;
    num_channels: number;
  };
}

const colormaps = [
  'Viridis',
  'Plasma',
  'Inferno',
  'Magma',
  'Hot',
  'Cool',
  'Blues',
  'Reds',
  'Greens',
  'YlOrRd',
  'RdBu',
];

export default function ReoccurrenceGraph({ data }: ReoccurrenceGraphProps) {
  const [channelX, setChannelX] = useState(0);
  const [channelY, setChannelY] = useState(1);
  const [colormap, setColormap] = useState('Viridis');

  const generateRecurrenceData = () => {
    const xData = data.data.map(row => row[channelX]);
    const yData = data.data.map(row => row[channelY]);

    // Create 2D histogram for density plot
    const numBins = 50;
    
    // Calculate bins
    const xMin = Math.min(...xData);
    const xMax = Math.max(...xData);
    const yMin = Math.min(...yData);
    const yMax = Math.max(...yData);

    const xBinSize = (xMax - xMin) / numBins;
    const yBinSize = (yMax - yMin) / numBins;

    // Initialize histogram
    const histogram: number[][] = Array(numBins)
      .fill(0)
      .map(() => Array(numBins).fill(0));

    // Fill histogram
    for (let i = 0; i < xData.length; i++) {
      const xBin = Math.min(Math.floor((xData[i] - xMin) / xBinSize), numBins - 1);
      const yBin = Math.min(Math.floor((yData[i] - yMin) / yBinSize), numBins - 1);
      histogram[yBin][xBin]++;
    }

    // Generate bin edges for heatmap
    const xBins = Array(numBins).fill(0).map((_, i) => xMin + i * xBinSize);
    const yBins = Array(numBins).fill(0).map((_, i) => yMin + i * yBinSize);

    return {
      z: histogram,
      x: xBins,
      y: yBins,
      type: 'heatmap',
      colorscale: colormap,
      colorbar: {
        title: 'Count',
      },
    };
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>X-Axis Channel</InputLabel>
              <Select
                value={channelX}
                label="X-Axis Channel"
                onChange={(e) => setChannelX(e.target.value as number)}
              >
                {Array.from({ length: data.num_channels }, (_, i) => (
                  <MenuItem key={i} value={i}>
                    Channel {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Y-Axis Channel</InputLabel>
              <Select
                value={channelY}
                label="Y-Axis Channel"
                onChange={(e) => setChannelY(e.target.value as number)}
              >
                {Array.from({ length: data.num_channels }, (_, i) => (
                  <MenuItem key={i} value={i}>
                    Channel {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Colormap</InputLabel>
              <Select
                value={colormap}
                label="Colormap"
                onChange={(e) => setColormap(e.target.value)}
              >
                {colormaps.map((cm) => (
                  <MenuItem key={cm} value={cm}>
                    {cm}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Recurrence Graph: 2D intensity map showing the relationship between two channels.
          X-axis shows Channel {channelX + 1} values, Y-axis shows Channel {channelY + 1} values.
          Color intensity indicates how frequently each combination occurs.
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Plot
          data={[generateRecurrenceData() as any]}
          layout={{
            title: `Recurrence Plot: Channel ${channelX + 1} vs Channel ${channelY + 1}`,
            xaxis: {
              title: `Channel ${channelX + 1} Amplitude`,
            },
            yaxis: {
              title: `Channel ${channelY + 1} Amplitude`,
            },
            height: 600,
            width: 700,
          }}
          style={{ width: '100%' }}
          config={{ responsive: true }}
        />
      </Paper>
    </Box>
  );
}
