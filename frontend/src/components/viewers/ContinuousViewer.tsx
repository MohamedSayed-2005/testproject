import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import {
  Box,
  FormControl,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  Button,
  ButtonGroup,
  Slider,
  Typography,
  Paper,
  Grid,
  IconButton,
  Popover,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  ZoomIn,
  ZoomOut,
  Settings,
} from '@mui/icons-material';

interface ContinuousViewerProps {
  data: {
    data: number[][];
    time: number[];
    sampling_rate: number;
    num_channels: number;
  };
}

export default function ContinuousViewer({ data }: ContinuousViewerProps) {
  const [displayMode, setDisplayMode] = useState<'grid' | 'overlay'>('overlay');
  const [visibleChannels, setVisibleChannels] = useState<boolean[]>(
    new Array(data.num_channels).fill(true)
  );
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [windowSize, setWindowSize] = useState(2); // seconds
  const [currentPosition, setCurrentPosition] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [channelColors, setChannelColors] = useState<string[]>([
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
    '#aec7e8',
    '#ffbb78',
  ]);
  const [lineWidth, setLineWidth] = useState(2);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);

  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (playing) {
      const interval = setInterval(() => {
        setCurrentPosition((prev) => {
          const newPos = prev + (speed * 0.1);
          const maxPos = data.time[data.time.length - 1] - windowSize;
          return newPos > maxPos ? 0 : newPos;
        });
      }, 100);
      animationRef.current = interval as any;
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [playing, speed, windowSize, data.time]);

  const handleChannelToggle = (index: number) => {
    const newVisible = [...visibleChannels];
    newVisible[index] = !newVisible[index];
    setVisibleChannels(newVisible);
  };

  const getVisibleData = () => {
    const startIdx = Math.floor(currentPosition * data.sampling_rate);
    const endIdx = Math.floor((currentPosition + windowSize) * data.sampling_rate);
    
    const visibleTime = data.time.slice(startIdx, endIdx);
    const traces = [];

    for (let ch = 0; ch < data.num_channels; ch++) {
      if (!visibleChannels[ch]) continue;

      const channelData = data.data.map(row => row[ch]).slice(startIdx, endIdx);

      traces.push({
        x: visibleTime,
        y: channelData,
        type: 'scatter',
        mode: 'lines',
        name: `Channel ${ch + 1}`,
        line: {
          color: channelColors[ch % channelColors.length],
          width: lineWidth,
        },
      });
    }

    return traces;
  };

  const getGridData = () => {
    const startIdx = Math.floor(currentPosition * data.sampling_rate);
    const endIdx = Math.floor((currentPosition + windowSize) * data.sampling_rate);
    
    const visibleTime = data.time.slice(startIdx, endIdx);
    const traces = [];

    let plotIndex = 0;
    for (let ch = 0; ch < data.num_channels; ch++) {
      if (!visibleChannels[ch]) continue;

      const channelData = data.data.map(row => row[ch]).slice(startIdx, endIdx);

      traces.push({
        x: visibleTime,
        y: channelData,
        type: 'scatter',
        mode: 'lines',
        name: `Channel ${ch + 1}`,
        line: {
          color: channelColors[ch % channelColors.length],
          width: lineWidth,
        },
        xaxis: `x${plotIndex + 1}`,
        yaxis: `y${plotIndex + 1}`,
      });
      plotIndex++;
    }

    return traces;
  };

  const getGridLayout = () => {
    const numVisible = visibleChannels.filter(v => v).length;
    const rows = Math.ceil(numVisible / 3);
    const cols = Math.min(numVisible, 3);

    const layout: any = {
      grid: { rows, columns: cols, pattern: 'independent' },
      height: rows * 200,
      showlegend: false,
    };

    return layout;
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm="auto">
            <FormControl component="fieldset">
              <FormLabel component="legend">Display Mode</FormLabel>
              <RadioGroup
                row
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value as 'grid' | 'overlay')}
              >
                <FormControlLabel value="overlay" control={<Radio />} label="Overlay" />
                <FormControlLabel value="grid" control={<Radio />} label="Grid" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm="auto">
            <ButtonGroup>
              <Button
                onClick={() => setPlaying(!playing)}
                startIcon={playing ? <Pause /> : <PlayArrow />}
              >
                {playing ? 'Pause' : 'Play'}
              </Button>
            </ButtonGroup>
          </Grid>

          <Grid item xs={12} sm="auto">
            <Typography variant="body2" gutterBottom>
              Speed: {speed}x
            </Typography>
            <ButtonGroup size="small">
              <Button onClick={() => setSpeed(0.5)}>0.5x</Button>
              <Button onClick={() => setSpeed(1)}>1x</Button>
              <Button onClick={() => setSpeed(2)}>2x</Button>
              <Button onClick={() => setSpeed(4)}>4x</Button>
            </ButtonGroup>
          </Grid>

          <Grid item xs={12} sm="auto">
            <Typography variant="body2" gutterBottom>
              Window: {windowSize}s
            </Typography>
            <Slider
              value={windowSize}
              onChange={(_, value) => setWindowSize(value as number)}
              min={1}
              max={5}
              step={0.5}
              sx={{ width: 100 }}
            />
          </Grid>

          <Grid item xs={12} sm="auto">
            <IconButton onClick={(e) => setSettingsAnchor(e.currentTarget)}>
              <Settings />
            </IconButton>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Visible Channels:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {visibleChannels.map((visible, idx) => (
              <FormControlLabel
                key={idx}
                control={
                  <Checkbox
                    checked={visible}
                    onChange={() => handleChannelToggle(idx)}
                    size="small"
                  />
                }
                label={`Ch${idx + 1}`}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {displayMode === 'overlay' ? (
          <Plot
            data={getVisibleData() as any}
            layout={{
              title: 'ECG Signal - Overlay Mode',
              xaxis: { title: 'Time (s)' },
              yaxis: { title: 'Amplitude' },
              height: 500,
              showlegend: true,
            }}
            style={{ width: '100%' }}
            config={{ responsive: true }}
          />
        ) : (
          <Plot
            data={getGridData() as any}
            layout={{
              title: 'ECG Signal - Grid Mode',
              ...getGridLayout(),
            }}
            style={{ width: '100%' }}
            config={{ responsive: true }}
          />
        )}
      </Paper>

      <Popover
        open={Boolean(settingsAnchor)}
        anchorEl={settingsAnchor}
        onClose={() => setSettingsAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            Line Width
          </Typography>
          <Slider
            value={lineWidth}
            onChange={(_, value) => setLineWidth(value as number)}
            min={1}
            max={5}
            step={0.5}
          />
        </Box>
      </Popover>
    </Box>
  );
}
