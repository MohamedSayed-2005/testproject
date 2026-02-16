"""Microbiome API endpoints"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import numpy as np

from app.models.microbiome_profiler import MicrobiomeProfiler
from app.services.data_loader import generate_demo_microbiome_data

router = APIRouter()

# Initialize profiler and data
profiler = MicrobiomeProfiler()
demo_data = None


def get_demo_data():
    """Get or generate demo microbiome data"""
    global demo_data, profiler
    
    if demo_data is None:
        demo_data = generate_demo_microbiome_data(num_samples=20, num_taxa=15)
        # Train profiler
        profiler.train(demo_data)
    
    return demo_data


@router.get("/demo-data")
async def get_microbiome_data():
    """Get demo microbiome data"""
    try:
        df = get_demo_data()
        
        return {
            "samples": df.to_dict(orient='records'),
            "taxa_names": [col for col in df.columns if col not in ['sample_id', 'disease_status']],
            "num_samples": len(df),
            "disease_categories": df['disease_status'].unique().tolist()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/diversity")
async def get_diversity_metrics():
    """Calculate diversity metrics for all samples"""
    try:
        df = get_demo_data()
        metrics = profiler.calculate_diversity_metrics(df)
        
        return {
            "metrics": metrics,
            "summary": {
                "mean_shannon": float(np.mean([m['shannon'] for m in metrics])),
                "mean_simpson": float(np.mean([m['simpson'] for m in metrics])),
                "mean_richness": float(np.mean([m['richness'] for m in metrics]))
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pca")
async def get_pca_visualization():
    """Get PCA visualization data"""
    try:
        df = get_demo_data()
        pca_data = profiler.compute_pca(df)
        
        return pca_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict")
async def predict_patient_profile(abundances: List[float]):
    """Predict patient disease status from microbiome profile"""
    try:
        df = get_demo_data()
        
        # Ensure correct number of features
        taxa_names = [col for col in df.columns if col not in ['sample_id', 'disease_status']]
        if len(abundances) != len(taxa_names):
            raise HTTPException(
                status_code=400,
                detail=f"Expected {len(taxa_names)} abundance values, got {len(abundances)}"
            )
        
        # Predict
        abundance_array = np.array(abundances)
        result = profiler.predict_profile(abundance_array)
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/heatmap-data")
async def get_heatmap_data():
    """Get data formatted for heatmap visualization"""
    try:
        df = get_demo_data()
        
        taxa_names = [col for col in df.columns if col not in ['sample_id', 'disease_status']]
        
        # Prepare heatmap data
        abundance_matrix = df[taxa_names].values
        
        return {
            "taxa_names": taxa_names,
            "sample_ids": df['sample_id'].tolist(),
            "disease_status": df['disease_status'].tolist(),
            "abundance_matrix": abundance_matrix.tolist(),
            "log_abundance_matrix": np.log10(abundance_matrix + 1).tolist()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/taxa-summary")
async def get_taxa_summary():
    """Get summary statistics for each taxa"""
    try:
        df = get_demo_data()
        
        taxa_names = [col for col in df.columns if col not in ['sample_id', 'disease_status']]
        
        summary = []
        for taxa in taxa_names:
            values = df[taxa].values
            summary.append({
                "taxa": taxa,
                "mean": float(np.mean(values)),
                "std": float(np.std(values)),
                "min": float(np.min(values)),
                "max": float(np.max(values)),
                "median": float(np.median(values))
            })
        
        return {"taxa_summary": summary}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/disease-comparison")
async def compare_by_disease():
    """Compare microbiome profiles across disease categories"""
    try:
        df = get_demo_data()
        
        taxa_names = [col for col in df.columns if col not in ['sample_id', 'disease_status']]
        disease_categories = df['disease_status'].unique()
        
        comparison = {}
        for disease in disease_categories:
            disease_df = df[df['disease_status'] == disease]
            
            comparison[disease] = {
                "count": len(disease_df),
                "mean_abundances": {
                    taxa: float(disease_df[taxa].mean())
                    for taxa in taxa_names
                },
                "top_taxa": sorted(
                    [(taxa, float(disease_df[taxa].mean())) for taxa in taxa_names],
                    key=lambda x: x[1],
                    reverse=True
                )[:5]
            }
        
        return {"disease_comparison": comparison}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
