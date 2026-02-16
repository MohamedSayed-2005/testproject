import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import Plot from 'react-plotly.js';
import { Refresh } from '@mui/icons-material';
import { stockApi } from '../services/api';

export default function StockPage() {
  const [loading, setLoading] = useState(false);
  const [symbols, setSymbols] = useState<any>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [selectedPeriod, setSelectedPeriod] = useState('1y');
  const [stockData, setStockData] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    loadSymbols();
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      loadStockData();
    }
  }, [selectedSymbol, selectedPeriod]);

  const loadSymbols = async () => {
    try {
      const response = await stockApi.listSymbols();
      setSymbols(response.data);
    } catch (error) {
      console.error('Error loading symbols:', error);
    }
  };

  const loadStockData = async () => {
    setLoading(true);
    try {
      const [dataResponse, predictionResponse] = await Promise.all([
        stockApi.getData(selectedSymbol, selectedPeriod),
        stockApi.predict(selectedSymbol, 30, selectedPeriod),
      ]);
      
      setStockData(dataResponse.data);
      setPrediction(predictionResponse.data);
    } catch (error) {
      console.error('Error loading stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCandlestickData = () => {
    if (!stockData) return [];

    return [
      {
        x: stockData.data.date,
        open: stockData.data.open,
        high: stockData.data.high,
        low: stockData.data.low,
        close: stockData.data.close,
        type: 'candlestick',
        name: selectedSymbol,
        increasing: { line: { color: '#26a69a' } },
        decreasing: { line: { color: '#ef5350' } },
      },
    ];
  };

  const getLineChartData = () => {
    if (!stockData || !prediction) return [];

    const traces: any[] = [
      {
        x: stockData.data.date,
        y: stockData.data.close,
        type: 'scatter',
        mode: 'lines',
        name: 'Historical',
        line: { color: '#90caf9', width: 2 },
      },
    ];

    // Add prediction
    traces.push({
      x: prediction.predictions.dates,
      y: prediction.predictions.predictions,
      type: 'scatter',
      mode: 'lines',
      name: 'Predicted',
      line: { color: '#f48fb1', width: 2, dash: 'dash' },
    });

    // Add confidence intervals
    traces.push({
      x: prediction.predictions.dates,
      y: prediction.predictions.upper_bound,
      type: 'scatter',
      mode: 'lines',
      name: 'Upper Bound',
      line: { color: 'rgba(244, 143, 177, 0.3)', width: 1 },
      showlegend: false,
    });

    traces.push({
      x: prediction.predictions.dates,
      y: prediction.predictions.lower_bound,
      type: 'scatter',
      mode: 'lines',
      name: 'Lower Bound',
      fill: 'tonexty',
      fillcolor: 'rgba(244, 143, 177, 0.2)',
      line: { color: 'rgba(244, 143, 177, 0.3)', width: 1 },
      showlegend: false,
    });

    return traces;
  };

  const getVolumeData = () => {
    if (!stockData) return [];

    return [
      {
        x: stockData.data.date,
        y: stockData.data.volume,
        type: 'bar',
        name: 'Volume',
        marker: { color: 'rgba(144, 202, 249, 0.5)' },
      },
    ];
  };

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Stock Market Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Real-time stock, currency, and commodity data with AI-powered predictions
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Symbol</InputLabel>
              <Select
                value={selectedSymbol}
                label="Symbol"
                onChange={(e) => setSelectedSymbol(e.target.value)}
              >
                {symbols?.stocks?.map((stock: any) => (
                  <MenuItem key={stock.symbol} value={stock.symbol}>
                    {stock.name} ({stock.symbol})
                  </MenuItem>
                ))}
                {symbols?.currencies?.map((curr: any) => (
                  <MenuItem key={curr.symbol} value={curr.symbol}>
                    {curr.name} ({curr.symbol})
                  </MenuItem>
                ))}
                {symbols?.commodities?.map((comm: any) => (
                  <MenuItem key={comm.symbol} value={comm.symbol}>
                    {comm.name} ({comm.symbol})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select
                value={selectedPeriod}
                label="Period"
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <MenuItem value="1w">1 Week</MenuItem>
                <MenuItem value="1m">1 Month</MenuItem>
                <MenuItem value="3m">3 Months</MenuItem>
                <MenuItem value="6m">6 Months</MenuItem>
                <MenuItem value="1y">1 Year</MenuItem>
                <MenuItem value="5y">5 Years</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
              onClick={loadStockData}
              disabled={loading}
            >
              Refresh Data
            </Button>
          </Grid>
        </Grid>

        {stockData && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Last Price: <strong>${stockData.data.close[stockData.data.close.length - 1].toFixed(2)}</strong>
              {' | '}
              Data Source: {stockData.source === 'yahoo_finance' ? 'Yahoo Finance' : 'Synthetic'}
            </Typography>
          </Alert>
        )}
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && stockData && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Candlestick Chart
              </Typography>
              <Plot
                data={getCandlestickData() as any}
                layout={{
                  height: 400,
                  xaxis: { title: 'Date', rangeslider: { visible: false } },
                  yaxis: { title: 'Price ($)' },
                  margin: { l: 50, r: 20, t: 20, b: 40 },
                }}
                style={{ width: '100%' }}
                config={{ responsive: true }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Price Prediction (30 Days)
              </Typography>
              <Plot
                data={getLineChartData() as any}
                layout={{
                  height: 400,
                  xaxis: { title: 'Date' },
                  yaxis: { title: 'Price ($)' },
                  margin: { l: 50, r: 20, t: 20, b: 40 },
                  hovermode: 'x unified',
                }}
                style={{ width: '100%' }}
                config={{ responsive: true }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Trading Volume
              </Typography>
              <Plot
                data={getVolumeData() as any}
                layout={{
                  height: 250,
                  xaxis: { title: 'Date' },
                  yaxis: { title: 'Volume' },
                  margin: { l: 50, r: 20, t: 20, b: 40 },
                }}
                style={{ width: '100%' }}
                config={{ responsive: true }}
              />
            </Paper>
          </Grid>

          {prediction && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Prediction Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Trend Slope: <strong>{prediction.predictions.trend_slope.toFixed(4)}</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Volatility: <strong>{(prediction.predictions.volatility * 100).toFixed(2)}%</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}
