"""Data loading and generation utilities"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List


def generate_demo_microbiome_data(num_samples: int = 20, num_taxa: int = 15) -> pd.DataFrame:
    """
    Generate synthetic microbiome abundance data
    
    Args:
        num_samples: Number of patient samples
        num_taxa: Number of bacterial taxa
    
    Returns:
        DataFrame with microbiome data
    """
    np.random.seed(42)
    
    taxa_names = [
        "Bacteroides", "Firmicutes", "Actinobacteria", "Proteobacteria",
        "Verrucomicrobia", "Fusobacteria", "Cyanobacteria", "Spirochaetes",
        "Tenericutes", "Lentisphaerae", "Chloroflexi", "Planctomycetes",
        "Acidobacteria", "Gemmatimonadetes", "Nitrospirae"
    ][:num_taxa]
    
    data = {
        "sample_id": [f"Sample_{i+1}" for i in range(num_samples)],
        "disease_status": np.random.choice(["Healthy", "IBD", "IBS"], num_samples, p=[0.5, 0.3, 0.2])
    }
    
    # Generate abundance data
    for taxa in taxa_names:
        # Different abundance patterns for different conditions
        abundances = []
        for status in data["disease_status"]:
            if status == "Healthy":
                base = np.random.uniform(0.5, 2.0)
            elif status == "IBD":
                base = np.random.uniform(0.2, 1.5)
            else:  # IBS
                base = np.random.uniform(0.3, 1.8)
            
            abundances.append(base * np.random.lognormal(0, 0.5))
        
        data[taxa] = abundances
    
    return pd.DataFrame(data)


def generate_stock_data(symbol: str, days: int = 365) -> pd.DataFrame:
    """
    Generate synthetic stock price data
    
    Args:
        symbol: Stock symbol
        days: Number of days of data
    
    Returns:
        DataFrame with OHLCV data
    """
    np.random.seed(hash(symbol) % (2**32))
    
    dates = pd.date_range(end=pd.Timestamp.now(), periods=days, freq='D')
    
    # Generate price using random walk
    returns = np.random.normal(0.0005, 0.02, days)
    price = 100 * np.exp(np.cumsum(returns))
    
    # Generate OHLCV
    data = {
        "date": dates,
        "open": price * (1 + np.random.uniform(-0.01, 0.01, days)),
        "high": price * (1 + np.random.uniform(0, 0.02, days)),
        "low": price * (1 - np.random.uniform(0, 0.02, days)),
        "close": price,
        "volume": np.random.randint(1000000, 10000000, days)
    }
    
    df = pd.DataFrame(data)
    df['high'] = df[['open', 'close', 'high']].max(axis=1)
    df['low'] = df[['open', 'close', 'low']].min(axis=1)
    
    return df


def calculate_diversity_metrics(abundance_data: np.ndarray) -> Dict[str, float]:
    """
    Calculate diversity metrics for microbiome data
    
    Args:
        abundance_data: Array of species abundances
    
    Returns:
        Dictionary of diversity metrics
    """
    # Normalize abundances
    abundances = abundance_data / np.sum(abundance_data)
    abundances = abundances[abundances > 0]  # Remove zeros
    
    # Shannon diversity
    shannon = -np.sum(abundances * np.log(abundances))
    
    # Simpson diversity
    simpson = 1 - np.sum(abundances ** 2)
    
    # Species richness
    richness = len(abundances)
    
    # Pielou's evenness
    evenness = shannon / np.log(richness) if richness > 1 else 0
    
    return {
        "shannon": float(shannon),
        "simpson": float(simpson),
        "richness": int(richness),
        "evenness": float(evenness)
    }
