import React from 'react';

interface Candidate {
  character: string;
  confidence: number;
}

interface StrokePredictorProps {
  candidates: Candidate[];
  currentStroke: number;
}

const StrokePredictor: React.FC<StrokePredictorProps> = ({ candidates, currentStroke }) => {
  // 最も有力な候補のみ表示
  const topCandidate = candidates.length > 0 ? candidates[0] : null;

  return (
    <div style={{ 
      padding: '10px',
      border: '2px solid #FF5722',
      borderRadius: '4px',
      backgroundColor: '#fff',
      minHeight: '80px',
      minWidth: '300px'
    }}>
      <div style={{ 
        margin: '0 0 8px 0', 
        color: '#666', 
        fontSize: '12px',
        textAlign: 'center'
      }}>
        候補予測 - {currentStroke}画目
      </div>
      
      {!topCandidate ? (
        <p style={{ color: '#666', fontStyle: 'italic', margin: '0', textAlign: 'center', fontSize: '12px' }}>
          書き始めると候補が表示されます (候補数: {candidates.length})
        </p>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#FF5722',
            marginBottom: '3px'
          }}>
            {topCandidate.character}
          </div>
          <div style={{
            fontSize: '10px',
            color: '#666'
          }}>
            信頼度: {Math.round(topCandidate.confidence)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default StrokePredictor;