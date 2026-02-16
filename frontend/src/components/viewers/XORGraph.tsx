import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  Checkbox,
  Slider,
  Typography,
  Paper,
  Grid,
} from '@mui/material';

interface XORGraphProps {
  data: {
    data: number[][];
    time: number[];
    sampling_rate: number;
    num_channels: number;
  };
}

export default function XORGraph({ data }: XORGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visibleChannels, setVisibleChannels] = useState<boolean[]>([true]);
  const [chunkPeriod, setChunkPeriod] = useState(2); // seconds
  const [selectedChannel, setSelectedChannel] = useState(0);

  useEffect(() => {
    drawXORGraph();
  }, [data, chunkPeriod, selectedChannel]);

  const drawXORGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#132f4c';
    ctx.fillRect(0, 0, width, height);

    // Extract channel data
    const channelData = data.data.map(row => row[selectedChannel]);
    
    // Calculate chunk size
    const chunkSize = Math.floor(chunkPeriod * data.sampling_rate);
    const numChunks = Math.floor(channelData.length / chunkSize);

    // Normalize data to canvas height
    const minVal = Math.min(...channelData);
    const maxVal = Math.max(...channelData);
    const range = maxVal - minVal;

    // Store previous chunk for XOR
    let previousBinary: boolean[] | null = null;

    for (let chunk = 0; chunk < numChunks; chunk++) {
      const startIdx = chunk * chunkSize;
      const endIdx = Math.min(startIdx + chunkSize, channelData.length);
      const chunkValues = channelData.slice(startIdx, endIdx);

      // Convert to binary representation (above/below threshold)
      const threshold = (maxVal + minVal) / 2;
      const currentBinary = chunkValues.map(v => v > threshold);

      // Draw with XOR
      ctx.beginPath();
      ctx.strokeStyle = `hsl(${(chunk * 30) % 360}, 70%, 60%)`;
      ctx.lineWidth = 1.5;

      for (let i = 0; i < currentBinary.length; i++) {
        const x = (i / currentBinary.length) * width;
        let shouldDraw = currentBinary[i];

        // XOR with previous chunk
        if (previousBinary && i < previousBinary.length) {
          shouldDraw = currentBinary[i] !== previousBinary[i]; // XOR operation
        }

        if (shouldDraw) {
          const normalizedValue = (chunkValues[i] - minVal) / range;
          const y = height - (normalizedValue * height * 0.8 + height * 0.1);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      }

      ctx.stroke();
      previousBinary = currentBinary;
    }

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i / 10) * height);
      ctx.lineTo(width, (i / 10) * height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo((i / 10) * width, 0);
      ctx.lineTo((i / 10) * width, height);
      ctx.stroke();
    }

    // Draw axes labels
    ctx.fillStyle = '#90caf9';
    ctx.font = '12px Arial';
    ctx.fillText('Time →', width - 60, height - 10);
    ctx.save();
    ctx.translate(15, 60);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Amplitude →', 0, 0);
    ctx.restore();
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
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
            <FormControl fullWidth>
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
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          XOR Graph: Overlays time chunks with XOR operation. Identical regions cancel out (disappear),
          highlighting differences between cardiac cycles.
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          width={1000}
          height={500}
          style={{ maxWidth: '100%', height: 'auto', border: '1px solid #90caf9' }}
        />
      </Paper>
    </Box>
  );
}
