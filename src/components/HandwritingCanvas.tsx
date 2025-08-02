import React, { useRef, useEffect, useState } from 'react';
import { 
  strokeDatabase, 
  analyzeStrokeDirection, 
  analyzeStrokeLength, 
  analyzeStrokePosition,
  type StrokePattern 
} from '../data/strokeDatabase';
import { learningSystem } from '../data/learningSystem';

interface HandwritingCanvasProps {
  onCharacterComplete: (imageData: string, sessionId: string, bestCandidate: string) => void;
  onStrokeComplete?: (candidates: { character: string; confidence: number }[]) => void;
  onLearningRequest?: (imageData: string, sessionId: string, bestCandidate: string, onConfirm: (confirmedCharacter: string) => void) => void;
  onClearCanvas?: () => void;
}

interface StrokePath {
  points: { x: number; y: number }[];
}


const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({ onCharacterComplete, onStrokeComplete, onLearningRequest, onClearCanvas }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [allStrokes, setAllStrokes] = useState<StrokePath[]>([]);
  const [clickStart, setClickStart] = useState<{ x: number; y: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const [analyzedStrokes, setAnalyzedStrokes] = useState<StrokePattern[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [bestCandidateForLearning, setBestCandidateForLearning] = useState<string>('');
  const [isWaitingForLearning, setIsWaitingForLearning] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const redrawCanvas = (strokesToDraw?: StrokePath[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const strokes = strokesToDraw || allStrokes;
    strokes.forEach(stroke => {
      if (stroke.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setClickStart({ x, y });
    setHasMoved(false);
    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (clickStart) {
      const distance = Math.sqrt(
        Math.pow(x - clickStart.x, 2) + Math.pow(y - clickStart.y, 2)
      );
      if (distance > 5) {
        setHasMoved(true);
      }
    }

    const newStroke = [...currentStroke, { x, y }];
    setCurrentStroke(newStroke);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    redrawCanvas();

    if (newStroke.length > 1) {
      ctx.beginPath();
      ctx.moveTo(newStroke[0].x, newStroke[0].y);
      newStroke.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  };

  const analyzeCurrentStroke = (stroke: { x: number; y: number }[]) => {
    if (stroke.length < 2) return null;
    
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const startPoint = stroke[0];
    const endPoint = stroke[stroke.length - 1];
    
    const direction = analyzeStrokeDirection(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    const length = analyzeStrokeLength(startPoint.x, startPoint.y, endPoint.x, endPoint.y, canvas.width, canvas.height);
    const position = analyzeStrokePosition(startPoint.x, startPoint.y, endPoint.x, endPoint.y, canvas.width, canvas.height);
    
    return {
      direction,
      length,
      position,
      startPoint: { x: startPoint.x / canvas.width, y: startPoint.y / canvas.height },
      endPoint: { x: endPoint.x / canvas.width, y: endPoint.y / canvas.height }
    };
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (hasMoved && currentStroke.length > 1) {
      const newStrokes = [...allStrokes, { points: currentStroke }];
      
      // ストロークを解析
      const strokePattern = analyzeCurrentStroke(currentStroke);
      if (strokePattern) {
        const newAnalyzedStrokes = [...analyzedStrokes, strokePattern];
        setAnalyzedStrokes(newAnalyzedStrokes);
        
        console.log('解析したストローク:', {
          画数: newAnalyzedStrokes.length,
          最新ストローク: strokePattern,
          全ストローク: newAnalyzedStrokes
        });
        
        // 学習システムを含めた文字候補を取得
        const learningResults = learningSystem.matchWithLearning(newAnalyzedStrokes, strokeDatabase);
        const candidates = learningResults.map(result => ({
          character: result.character,
          confidence: result.confidence
        }));
        
        console.log('候補文字（学習込み）:', learningResults);
        
        // 最適な候補を保存（学習ダイアログ用）
        if (learningResults.length > 0) {
          setBestCandidateForLearning(learningResults[0].character);
        }
        
        // セッションIDを生成（初回のみ）
        if (!currentSessionId) {
          const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          setCurrentSessionId(newSessionId);
        }
        
        // 候補を親コンポーネントに通知
        if (onStrokeComplete) {
          onStrokeComplete(candidates);
        }
      }
      
      // 画数を裏で保持
      setAllStrokes(newStrokes);
      
      // 画数を書き終わったら全体を再描画（常に全ての画数を表示）
      setTimeout(() => {
        redrawCanvas(newStrokes);
      }, 10);
    } else if (!hasMoved) {
      // ワンクリック - 文字を確定（学習待機中でなければ）
      if (allStrokes.length > 0 && !isWaitingForLearning) {
        saveCurrentCharacterAndClear();
      }
    }

    setCurrentStroke([]);
    setClickStart(null);
    setHasMoved(false);
  };


  const saveCurrentCharacterAndClear = (confirmedCharacter?: string) => {
    if (allStrokes.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 全ての画数を合体して描画
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCtx.strokeStyle = '#000000';
    tempCtx.lineWidth = 3;
    tempCtx.lineCap = 'round';
    tempCtx.lineJoin = 'round';
    
    // 保持している全ての画数を描画
    allStrokes.forEach(stroke => {
      if (stroke.points.length > 1) {
        tempCtx.beginPath();
        tempCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.slice(1).forEach(point => {
          tempCtx.lineTo(point.x, point.y);
        });
        tempCtx.stroke();
      }
    });

    // 学習システムを含めた最終候補を取得
    const learningResults = learningSystem.matchWithLearning(analyzedStrokes, strokeDatabase);
    const bestCandidate = confirmedCharacter || (learningResults.length > 0 ? learningResults[0].character : '?');
    
    // セッションを記録
    if (currentSessionId && analyzedStrokes.length > 0) {
      learningSystem.recordSession(currentSessionId, analyzedStrokes, bestCandidate);
    }

    const imageData = tempCanvas.toDataURL();
    onCharacterComplete(imageData, currentSessionId, bestCandidate);
    
    // 全ての状態をリセット
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    setAllStrokes([]);
    setAnalyzedStrokes([]);
    setCurrentSessionId('');
    setIsWaitingForLearning(false);
  };


  const clearAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    setAllStrokes([]);
    setCurrentStroke([]);
    setClickStart(null);
    setHasMoved(false);
    setAnalyzedStrokes([]);
  };

  const clearCanvas = () => {
    clearAll();
    // 親コンポーネントにクリア通知
    if (onClearCanvas) {
      onClearCanvas();
    }
  };

  return (
    <div className="handwriting-canvas">
      <canvas
        ref={canvasRef}
        width={450}
        height={450}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onContextMenu={(e) => {
          e.preventDefault();
          // 右クリック - 学習ダイアログを表示
          if (allStrokes.length > 0 && onLearningRequest) {
            // 全ての画数を合体して描画
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 450;
            tempCanvas.height = 450;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return;
            
            tempCtx.strokeStyle = '#000000';
            tempCtx.lineWidth = 3;
            tempCtx.lineCap = 'round';
            tempCtx.lineJoin = 'round';
            
            allStrokes.forEach(stroke => {
              if (stroke.points.length > 1) {
                tempCtx.beginPath();
                tempCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
                stroke.points.slice(1).forEach(point => {
                  tempCtx.lineTo(point.x, point.y);
                });
                tempCtx.stroke();
              }
            });

            const imageData = tempCanvas.toDataURL();
            setIsWaitingForLearning(true);
            
            onLearningRequest(imageData, currentSessionId, bestCandidateForLearning, (confirmedCharacter: string) => {
              saveCurrentCharacterAndClear(confirmedCharacter);
            });
          }
        }}
        style={{
          border: '2px solid #ccc',
          borderRadius: '8px',
          cursor: 'crosshair',
          backgroundColor: '#fff'
        }}
      />
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={clearCanvas}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          全クリア
        </button>
        <button 
          onClick={() => saveCurrentCharacterAndClear()}
          disabled={allStrokes.length === 0 || isWaitingForLearning}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: (allStrokes.length > 0 && !isWaitingForLearning) ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (allStrokes.length > 0 && !isWaitingForLearning) ? 'pointer' : 'not-allowed'
          }}
        >
          {isWaitingForLearning ? '学習待機中' : '文字確定'}
        </button>
      </div>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
          現在の画数: {allStrokes.length}画
        </p>
        <p style={{ 
          fontSize: '12px', 
          color: '#666',
          maxWidth: '300px',
          margin: '0 auto'
        }}>
          左クリック/確定ボタン：文字確定、右クリック：学習ダイアログ
        </p>
      </div>
    </div>
  );
};

export default HandwritingCanvas;