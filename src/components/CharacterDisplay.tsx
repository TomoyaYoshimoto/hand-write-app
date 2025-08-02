import React, { useEffect, useState } from 'react';
import { processImageWithOCR } from './OCRProcessor';

interface Character {
  id: string;
  imageData: string;
  timestamp: number;
  ocrText?: string;
  isProcessing?: boolean;
}

interface CharacterDisplayProps {
  characters: Character[];
  onCharacterUpdate: (id: string, ocrText: string) => void;
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ characters, onCharacterUpdate }) => {
  const [processingCharacters, setProcessingCharacters] = useState<Set<string>>(new Set());

  useEffect(() => {
    // OCR機能の一時的な無効化オプション（書き順システムに移行）
    const ENABLE_OCR = false; // 書き順システムを使用するためOCRを無効化
    
    if (!ENABLE_OCR) {
      // OCR無効時は即座に'?'を設定
      characters.forEach(character => {
        if (!character.ocrText) {
          onCharacterUpdate(character.id, '?');
        }
      });
      return;
    }
    
    characters.forEach(character => {
      if (!character.ocrText && !processingCharacters.has(character.id)) {
        setProcessingCharacters(prev => new Set(prev).add(character.id));
        
        // タイムアウト付きのOCR処理
        const ocrPromise = processImageWithOCR(character.imageData);
        const timeoutPromise = new Promise<string>((_, reject) => {
          setTimeout(() => reject(new Error('OCR timeout')), 15000); // 15秒でタイムアウト
        });
        
        Promise.race([ocrPromise, timeoutPromise])
          .then(ocrText => {
            console.log('OCR成功:', character.id, ocrText);
            onCharacterUpdate(character.id, ocrText);
          })
          .catch(error => {
            console.error('OCR failed for character:', character.id, error);
            onCharacterUpdate(character.id, '?'); // エラー時は?を表示
          })
          .finally(() => {
            setProcessingCharacters(prev => {
              const newSet = new Set(prev);
              newSet.delete(character.id);
              return newSet;
            });
          });
      }
    });
  }, [characters, onCharacterUpdate, processingCharacters]);

  return (
    <div className="character-display">
      {/* 連結文字をタイトル位置に表示 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#333',
          textAlign: 'center',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '15px',
          border: characters.length > 0 ? '2px solid #4CAF50' : '2px dashed #ccc',
          borderRadius: '12px',
          backgroundColor: characters.length > 0 ? '#f1f8e9' : '#fafafa',
          wordBreak: 'break-all'
        }}>
          {characters.map(char => char.ocrText || '?').join('') || '文字を書いてください'}
        </div>
      </div>
    </div>
  );
};

export default CharacterDisplay;