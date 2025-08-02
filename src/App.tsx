import { useState } from 'react'
import HandwritingCanvas from './components/HandwritingCanvas'
import CharacterDisplay from './components/CharacterDisplay'
import StrokePredictor from './components/StrokePredictor'
import CharacterFeedback from './components/CharacterFeedback'
import { learningSystem } from './data/learningSystem'
import './App.css'

interface Character {
  id: string;
  imageData: string;
  timestamp: number;
  ocrText?: string;
  isProcessing?: boolean;
}

function App() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [currentCandidates, setCurrentCandidates] = useState<{ character: string; confidence: number }[]>([])
  const [currentStrokeCount, setCurrentStrokeCount] = useState(0)
  const [feedbackData, setFeedbackData] = useState<{ sessionId: string; suggestedCharacter: string; characterId: string } | null>(null)

  const handleCharacterComplete = (imageData: string, _sessionId: string, bestCandidate: string) => {
    const newCharacter: Character = {
      id: Date.now().toString(),
      imageData,
      timestamp: Date.now(),
      ocrText: bestCandidate
    }
    setCharacters(prev => [...prev, newCharacter])
    
    // 学習機能を一時的に無効化
    // setFeedbackData({
    //   sessionId,
    //   suggestedCharacter: bestCandidate,
    //   characterId: newCharacter.id
    // });
    
    // 文字表示完了時に全ての状態をリセット（候補・画数カウント）
    setCurrentCandidates([])
    setCurrentStrokeCount(0)
  }

  const handleFeedbackCorrection = (correctCharacter: string) => {
    // 学習確認コールバックを実行
    if ((window as any).currentLearningConfirm) {
      (window as any).currentLearningConfirm(correctCharacter);
      (window as any).currentLearningConfirm = null;
    }
  }

  const handleCloseFeedback = () => {
    setFeedbackData(null);
  }

  const handleLearningRequest = (_imageData: string, sessionId: string, bestCandidate: string, onConfirm: (confirmedCharacter: string) => void) => {
    setFeedbackData({
      sessionId,
      suggestedCharacter: bestCandidate,
      characterId: Date.now().toString()
    });
    
    // onConfirmを保存
    (window as any).currentLearningConfirm = onConfirm;
  }

  const handleCanvasClear = () => {
    // 画数候補もクリア
    setCurrentCandidates([]);
    setCurrentStrokeCount(0);
  }

  const handleStrokeComplete = (candidates: { character: string; confidence: number }[]) => {
    setCurrentCandidates(candidates)
    setCurrentStrokeCount(prev => prev + 1)
  }

  const handleCharacterUpdate = (id: string, ocrText: string) => {
    setCharacters(prev => 
      prev.map(char => 
        char.id === id ? { ...char, ocrText } : char
      )
    )
  }

  const clearAllCharacters = () => {
    setCharacters([])
    setCurrentCandidates([])
    setCurrentStrokeCount(0)
    setFeedbackData(null)
  }

  const showLearningStats = () => {
    const stats = learningSystem.getLearningStats();
    console.log('学習統計:', stats);
    alert(`学習済み文字数: ${Object.keys(stats).length}\n詳細はコンソールをご確認ください`);
  }

  const resetLearningData = () => {
    if (confirm('学習データをリセットしますか？この操作は取り消せません。')) {
      learningSystem.resetLearningData();
      alert('学習データをリセットしました');
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* 連結文字表示エリア */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <CharacterDisplay characters={characters} onCharacterUpdate={handleCharacterUpdate} />
      </div>
      
      {/* メインコンテンツエリア */}
      <div style={{ 
        display: 'flex', 
        gap: '30px',
        flex: 1,
        minHeight: 0
      }}>
        {/* 左側：手書きエリアのみ */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          flexShrink: 0
        }}>
          <div style={{ textAlign: 'center' }}>
            <HandwritingCanvas 
              onCharacterComplete={handleCharacterComplete}
              onStrokeComplete={handleStrokeComplete}
              onLearningRequest={handleLearningRequest}
              onClearCanvas={handleCanvasClear}
            />
          </div>
        </div>
        
        {/* 右側：その他のコンテンツ */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          minWidth: 0,
          overflow: 'auto'
        }}>
          {/* 手書き文字・変換結果・候補予測の表示エリア */}
          <div style={{ 
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            maxHeight: '60vh',
            overflow: 'auto'
          }}>
            <div style={{ fontSize: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* 候補予測 */}
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#555', fontSize: '14px' }}>候補予測</h4>
                  <StrokePredictor 
                    candidates={currentCandidates}
                    currentStroke={currentStrokeCount}
                  />
                </div>
                
                {/* 手書き文字表示 */}
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#555', fontSize: '14px' }}>手書き文字</h4>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    minHeight: '70px',
                    minWidth: '300px'
                  }}>
                    {characters.length === 0 ? (
                      <div style={{ 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '12px',
                        fontStyle: 'italic'
                      }}>
                        文字を書くと表示されます
                      </div>
                    ) : (
                      characters.map((character) => (
                        <div
                          key={character.id}
                          style={{
                            width: '50px',
                            height: '50px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: '#fff',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          <img
                            src={character.imageData}
                            alt="手書き文字"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* 変換結果表示 */}
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#555', fontSize: '14px' }}>書き順変換結果</h4>
                  <div style={{
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#333',
                    minHeight: '40px',
                    minWidth: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {characters.length === 0 ? (
                      <span style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>
                        変換結果がここに表示されます
                      </span>
                    ) : (
                      characters.map(char => char.ocrText || '?').join('')
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 操作ボタン */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            flexWrap: 'wrap',
            justifyContent: 'flex-start'
          }}>
            {characters.length > 0 && (
              <button 
                onClick={clearAllCharacters}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                全ての文字をクリア
              </button>
            )}
            <button 
              onClick={showLearningStats}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              学習統計
            </button>
            <button 
              onClick={resetLearningData}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#FF5722',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              学習リセット
            </button>
          </div>
        </div>
      </div>
      
      {/* レスポンシブ対応用CSS */}
      <style>
        {`
          @media (max-width: 768px) {
            div[style*="display: flex"] {
              flex-direction: column !important;
            }
          }
        `}
      </style>

      {/* フィードバックモーダル */}
      {feedbackData && (
        <CharacterFeedback
          sessionId={feedbackData.sessionId}
          suggestedCharacter={feedbackData.suggestedCharacter}
          onCorrection={handleFeedbackCorrection}
          onClose={handleCloseFeedback}
        />
      )}
    </div>
  )
}

export default App
