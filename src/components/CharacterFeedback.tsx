import React, { useState } from 'react';
import { learningSystem } from '../data/learningSystem';

interface CharacterFeedbackProps {
  sessionId: string;
  suggestedCharacter: string;
  onCorrection: (correctCharacter: string) => void;
  onClose: () => void;
}

const CharacterFeedback: React.FC<CharacterFeedbackProps> = ({
  sessionId,
  suggestedCharacter,
  onCorrection,
  onClose
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  // よく使われるひらがな候補
  const commonCharacters = [
    'あ', 'い', 'う', 'え', 'お',
    'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と',
    'な', 'に', 'ぬ', 'ね', 'の',
    'は', 'ひ', 'ふ', 'へ', 'ほ',
    'ま', 'み', 'む', 'め', 'も',
    'や', 'ゆ', 'よ',
    'ら', 'り', 'る', 'れ', 'ろ',
    'わ', 'を', 'ん'
  ];

  const handleCorrection = (correctCharacter: string) => {
    // 学習システムにフィードバック
    learningSystem.learnFromFeedback(sessionId, correctCharacter);
    onCorrection(correctCharacter);
    onClose();
  };

  const handleCustomInput = () => {
    if (inputValue.trim()) {
      handleCorrection(inputValue.trim());
    }
  };

  const handleKeepSuggestion = () => {
    // 提案された文字が正解として学習
    learningSystem.learnFromFeedback(sessionId, suggestedCharacter);
    onCorrection(suggestedCharacter);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
          学習機能 - 文字確認
        </h2>
        
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ color: '#666', marginBottom: '10px' }}>
            この文字で正しいですか？
          </p>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#2196F3',
            padding: '10px',
            border: '2px solid #2196F3',
            borderRadius: '8px',
            display: 'inline-block',
            minWidth: '80px'
          }}>
            {suggestedCharacter}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
          <button
            onClick={handleKeepSuggestion}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ✓ 正しい
          </button>
          <button
            onClick={() => setShowInput(!showInput)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ✗ 修正する
          </button>
        </div>

        {showInput && (
          <div>
            <p style={{ color: '#333', marginBottom: '15px', fontWeight: 'bold' }}>
              正しい文字を選択してください:
            </p>
            
            {/* よく使う文字の候補 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: '8px',
              marginBottom: '20px',
              maxHeight: '200px',
              overflow: 'auto',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px'
            }}>
              {commonCharacters.map((char) => (
                <button
                  key={char}
                  onClick={() => handleCorrection(char)}
                  style={{
                    padding: '8px',
                    fontSize: '18px',
                    backgroundColor: char === suggestedCharacter ? '#E3F2FD' : '#f5f5f5',
                    border: char === suggestedCharacter ? '2px solid #2196F3' : '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {char}
                </button>
              ))}
            </div>

            {/* 手動入力 */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>
                または直接入力:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  maxLength={1}
                  style={{
                    padding: '8px',
                    fontSize: '18px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: '60px',
                    textAlign: 'center'
                  }}
                  placeholder="文字"
                />
                <button
                  onClick={handleCustomInput}
                  disabled={!inputValue.trim()}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: inputValue.trim() ? '#2196F3' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: inputValue.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  確定
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '15px' }}>
          この修正は学習データとして保存され、今後の認識精度向上に役立ちます
        </div>
      </div>
    </div>
  );
};

export default CharacterFeedback;