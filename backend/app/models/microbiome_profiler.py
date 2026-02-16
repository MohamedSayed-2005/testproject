"""Microbiome analysis and profiling"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.ensemble import RandomForestClassifier
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler


class MicrobiomeProfiler:
    """Analyze microbiome data and predict patient profiles"""
    
    def __init__(self):
        self.classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=2)
        self.is_trained = False
        self.taxa_names = []
    
    def train(self, abundance_data: pd.DataFrame):
        """Train the classifier on microbiome data"""
        # Extract features and labels
        self.taxa_names = [col for col in abundance_data.columns 
                          if col not in ['sample_id', 'disease_status']]
        
        X = abundance_data[self.taxa_names].values
        y = abundance_data['disease_status'].values
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train classifier
        self.classifier.fit(X_scaled, y)
        
        # Fit PCA for visualization
        self.pca.fit(X_scaled)
        
        self.is_trained = True
    
    def predict_profile(self, abundance_data: np.ndarray) -> Dict[str, Any]:
        """
        Predict patient disease status from microbiome profile
        
        Args:
            abundance_data: Array of bacterial abundances
        
        Returns:
            Dictionary with prediction and top contributing taxa
        """
        if not self.is_trained:
            return {
                "prediction": "Unknown",
                "confidence": 0.0,
                "probabilities": {},
                "top_contributors": []
            }
        
        # Scale
        X_scaled = self.scaler.transform(abundance_data.reshape(1, -1))
        
        # Predict
        prediction = self.classifier.predict(X_scaled)[0]
        probabilities = self.classifier.predict_proba(X_scaled)[0]
        
        # Get feature importance
        importances = self.classifier.feature_importances_
        top_indices = np.argsort(importances)[-5:][::-1]
        
        top_contributors = [
            {
                "taxa": self.taxa_names[idx],
                "importance": float(importances[idx]),
                "abundance": float(abundance_data[idx])
            }
            for idx in top_indices
        ]
        
        return {
            "prediction": prediction,
            "confidence": float(np.max(probabilities)),
            "probabilities": {
                cls: float(prob) 
                for cls, prob in zip(self.classifier.classes_, probabilities)
            },
            "top_contributors": top_contributors
        }
    
    def compute_pca(self, abundance_data: pd.DataFrame) -> Dict[str, Any]:
        """Compute PCA for dimensionality reduction"""
        X = abundance_data[self.taxa_names].values
        X_scaled = self.scaler.transform(X)
        X_pca = self.pca.transform(X_scaled)
        
        return {
            "pca_coords": X_pca.tolist(),
            "explained_variance": self.pca.explained_variance_ratio_.tolist(),
            "labels": abundance_data['disease_status'].tolist(),
            "sample_ids": abundance_data['sample_id'].tolist()
        }
    
    def calculate_diversity_metrics(self, abundance_data: pd.DataFrame) -> List[Dict[str, Any]]:
        """Calculate diversity metrics for each sample"""
        metrics = []
        
        for _, row in abundance_data.iterrows():
            abundances = row[self.taxa_names].values
            abundances = abundances[abundances > 0]
            
            if len(abundances) > 0:
                # Normalize
                p = abundances / np.sum(abundances)
                
                # Shannon diversity
                shannon = -np.sum(p * np.log(p))
                
                # Simpson diversity
                simpson = 1 - np.sum(p ** 2)
                
                # Species richness
                richness = len(abundances)
                
                # Evenness
                evenness = shannon / np.log(richness) if richness > 1 else 0
            else:
                shannon = simpson = richness = evenness = 0
            
            metrics.append({
                "sample_id": row['sample_id'],
                "disease_status": row['disease_status'],
                "shannon": float(shannon),
                "simpson": float(simpson),
                "richness": int(richness),
                "evenness": float(evenness)
            })
        
        return metrics
