import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  Typography,
  Paper,
  Grid,
  FormLabel,
} from '@mui/material';

interface PolarGraphProps {
  data: {
    data: number[][];
    time: number[];
    sampling_rate: number;
    num_channels: number;
  };
}

export default function PolarGraph({ data }: PolarGraphProps) {
  const [mode, setMode] = useState<'latest' | 'cumulative'>('cumulative');
  const [chunkPeriod, setChunkPeriod] = useState(2); // seconds
  const [selectedChannel, setSelectedChannel] = useState(0);

  const generatePolarData = () => {
    const channelData = data.data.map(row => row[selectedChannel]);
    const chunkSize = Math.floor(chunkPeriod * data.sampling_rate);
    const numChunks = Math.floor(channelData.length / chunkSize);

    const traces = [];

    for (let chunk = 0; chunk < numChunks; chunk++) {
      // In 'latest' mode, only show the last chunk
      if (mode === 'latest' && chunk < numChunks - 1) continue;

      const startIdx = chunk * chunkSize;
      const endIdx = Math.min(startIdx + chunkSize, channelData.length);
      const chunkValues = channelData.slice(startIdx, endIdx);

      // Map time to theta (0 to 2π)
      const theta = chunkValues.map((_, i) => (i / chunkValues.length) * 360);
      
      // Map signal amplitude to r
      const r = chunkValues.map(v => Math.abs(v));

      traces.push({
        type: 'scatterpolar',
        r: r,
        theta: theta,
        mode: 'lines',
        name: mode === 'cumulative' ? `Chunk ${chunk + 1}` : 'Current Window',
        line: {
          color: mode === 'cumulative' 
            ? `hsla(${(chunk * 30) % 360}, 70%, 60%, 0.6)` 
            : '#90caf9',
          width: 2,
        },
      });
    }

    return traces;
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Display Mode</FormLabel>
              <RadioGroup
                row
                value={mode}
                onChange={(e) => setMode(e.target.value as 'latest' | 'cumulative')}
              >
                <FormControlLabel value="latest" control={<Radio />} label="Latest Window" />
                <FormControlLabel value="cumulative" control={<Radio />} label="Cumulative" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body2" gutterBottom>
              Chunk Period: {chunkPeriod}s
            </Typography>
            <Slider
              value={chunkPeriod}
              onChange={(_, value) => setChunkPeriod(value as number)}
              min={0.5}
              max={5}
              step={0.5}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body2" gutterBottom>
              Selected Channel: {selectedChannel + 1}
            </Typography>
            <Slider
              value={selectedChannel}
              onChange={(_, value) => setSelectedChannel(value as number)}
              min={0}
              max={data.num_channels - 1}
              step={1}
              marks
            />
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Polar Graph: Signal magnitude (r) vs time mapped to angle (θ). 
          {mode === 'latest' 
            ? ' Shows only the current time window.'
            : ' Accumulates all previous chunks for pattern comparison.'}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Plot
          data={generatePolarData() as any}
          layout={{
            title: `Polar Graph - ${mode === 'latest' ? 'Latest Window' : 'Cumulative'}`,
            polar: {
              radialaxis: {
                visible: true,
                title: 'Amplitude',
              },
              angularaxis: {
                direction: 'clockwise',
              },
            },
            height: 600,
            showlegend: mode === 'cumulative',
          }}
          style={{ width: '100%' }}
          config={{ responsive: true }}
        />
      </Paper>
    </Box>
  );
}
