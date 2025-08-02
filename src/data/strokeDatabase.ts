// 書き順ベースの文字認識データベース

export interface StrokePattern {
  direction: 'horizontal' | 'vertical' | 'diagonal-right' | 'diagonal-left' | 'curve-right' | 'curve-left' | 'complex';
  length: 'short' | 'medium' | 'long';
  position: 'top' | 'middle' | 'bottom' | 'left' | 'right' | 'center';
  startPoint: { x: number; y: number }; // 相対位置 (0-1)
  endPoint: { x: number; y: number }; // 相対位置 (0-1)
}

export interface CharacterStroke {
  character: string;
  strokes: StrokePattern[];
  totalStrokes: number;
}

// ストロークの方向を判定する関数
export const analyzeStrokeDirection = (startX: number, startY: number, endX: number, endY: number): StrokePattern['direction'] => {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  
  // より寛容な判定基準に変更
  if (absX > absY * 1.5) {
    return 'horizontal';
  } else if (absY > absX * 1.5) {
    return 'vertical';
  } else if (deltaX > 0 && deltaY > 0) {
    return 'diagonal-right';
  } else if (deltaX < 0 && deltaY > 0) {
    return 'diagonal-left';
  } else {
    return 'complex';
  }
};

// ストロークの長さを判定する関数
export const analyzeStrokeLength = (startX: number, startY: number, endX: number, endY: number, canvasWidth: number, canvasHeight: number): StrokePattern['length'] => {
  const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const maxDistance = Math.sqrt(Math.pow(canvasWidth, 2) + Math.pow(canvasHeight, 2));
  const ratio = distance / maxDistance;
  
  if (ratio < 0.2) return 'short';
  if (ratio < 0.5) return 'medium';
  return 'long';
};

// ストロークの位置を判定する関数
export const analyzeStrokePosition = (startX: number, startY: number, endX: number, endY: number, canvasWidth: number, canvasHeight: number): StrokePattern['position'] => {
  const centerX = (startX + endX) / 2;
  const centerY = (startY + endY) / 2;
  
  const relativeX = centerX / canvasWidth;
  const relativeY = centerY / canvasHeight;
  
  if (relativeY < 0.33) return 'top';
  if (relativeY > 0.67) return 'bottom';
  if (relativeX < 0.33) return 'left';
  if (relativeX > 0.67) return 'right';
  return 'center';
};

// 文字データベース（ひらがな50音）
export const strokeDatabase: CharacterStroke[] = [
  {
    character: 'あ',
    totalStrokes: 3,
    strokes: [
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'top',
        startPoint: { x: 0.25, y: 0.15 },
        endPoint: { x: 0.75, y: 0.15 }
      },
      {
        direction: 'vertical',
        length: 'long',
        position: 'left',
        startPoint: { x: 0.3, y: 0.25 },
        endPoint: { x: 0.25, y: 0.85 }
      },
      {
        direction: 'complex',
        length: 'long',
        position: 'right',
        startPoint: { x: 0.6, y: 0.25 },
        endPoint: { x: 0.7, y: 0.85 }
      }
    ]
  },
  {
    character: 'い',
    totalStrokes: 2,
    strokes: [
      {
        direction: 'vertical',
        length: 'long',
        position: 'left',
        startPoint: { x: 0.3, y: 0.2 },
        endPoint: { x: 0.3, y: 0.8 }
      },
      {
        direction: 'vertical',
        length: 'long',
        position: 'right',
        startPoint: { x: 0.7, y: 0.2 },
        endPoint: { x: 0.7, y: 0.8 }
      }
    ]
  },
  {
    character: 'う',
    totalStrokes: 2,
    strokes: [
      {
        direction: 'horizontal',
        length: 'long',
        position: 'middle',
        startPoint: { x: 0.15, y: 0.35 },
        endPoint: { x: 0.85, y: 0.35 }
      },
      {
        direction: 'complex',
        length: 'long',
        position: 'center',
        startPoint: { x: 0.5, y: 0.45 },
        endPoint: { x: 0.6, y: 0.8 }
      }
    ]
  },
  {
    character: 'お',
    totalStrokes: 3,
    strokes: [
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'top',
        startPoint: { x: 0.2, y: 0.2 },
        endPoint: { x: 0.7, y: 0.2 }
      },
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'middle',
        startPoint: { x: 0.2, y: 0.5 },
        endPoint: { x: 0.8, y: 0.5 }
      },
      {
        direction: 'vertical',
        length: 'long',
        position: 'right',
        startPoint: { x: 0.7, y: 0.3 },
        endPoint: { x: 0.7, y: 0.8 }
      }
    ]
  },
  // え行
  {
    character: 'え',
    totalStrokes: 2,
    strokes: [
      {
        direction: 'horizontal',
        length: 'long',
        position: 'top',
        startPoint: { x: 0.2, y: 0.25 },
        endPoint: { x: 0.8, y: 0.25 }
      },
      {
        direction: 'complex',
        length: 'long',
        position: 'center',
        startPoint: { x: 0.3, y: 0.45 },
        endPoint: { x: 0.7, y: 0.8 }
      }
    ]
  },
  // か行
  {
    character: 'か',
    totalStrokes: 3,
    strokes: [
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'top',
        startPoint: { x: 0.3, y: 0.2 },
        endPoint: { x: 0.7, y: 0.2 }
      },
      {
        direction: 'vertical',
        length: 'long',
        position: 'left',
        startPoint: { x: 0.35, y: 0.3 },
        endPoint: { x: 0.3, y: 0.8 }
      },
      {
        direction: 'complex',
        length: 'long',
        position: 'right',
        startPoint: { x: 0.6, y: 0.4 },
        endPoint: { x: 0.75, y: 0.8 }
      }
    ]
  },
  {
    character: 'き',
    totalStrokes: 4,
    strokes: [
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'top',
        startPoint: { x: 0.2, y: 0.2 },
        endPoint: { x: 0.6, y: 0.2 }
      },
      {
        direction: 'vertical',
        length: 'long',
        position: 'left',
        startPoint: { x: 0.25, y: 0.3 },
        endPoint: { x: 0.2, y: 0.8 }
      },
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'middle',
        startPoint: { x: 0.4, y: 0.5 },
        endPoint: { x: 0.8, y: 0.5 }
      },
      {
        direction: 'vertical',
        length: 'medium',
        position: 'right',
        startPoint: { x: 0.7, y: 0.3 },
        endPoint: { x: 0.75, y: 0.8 }
      }
    ]
  },
  {
    character: 'く',
    totalStrokes: 1,
    strokes: [
      {
        direction: 'complex',
        length: 'long',
        position: 'center',
        startPoint: { x: 0.6, y: 0.2 },
        endPoint: { x: 0.3, y: 0.8 }
      }
    ]
  },
  {
    character: 'け',
    totalStrokes: 3,
    strokes: [
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'top',
        startPoint: { x: 0.2, y: 0.2 },
        endPoint: { x: 0.6, y: 0.2 }
      },
      {
        direction: 'vertical',
        length: 'long',
        position: 'left',
        startPoint: { x: 0.25, y: 0.3 },
        endPoint: { x: 0.2, y: 0.8 }
      },
      {
        direction: 'complex',
        length: 'long',
        position: 'right',
        startPoint: { x: 0.5, y: 0.4 },
        endPoint: { x: 0.8, y: 0.8 }
      }
    ]
  },
  {
    character: 'こ',
    totalStrokes: 2,
    strokes: [
      {
        direction: 'horizontal',
        length: 'long',
        position: 'top',
        startPoint: { x: 0.2, y: 0.3 },
        endPoint: { x: 0.8, y: 0.3 }
      },
      {
        direction: 'horizontal',
        length: 'long',
        position: 'bottom',
        startPoint: { x: 0.2, y: 0.7 },
        endPoint: { x: 0.8, y: 0.7 }
      }
    ]
  },
  // さ行
  {
    character: 'さ',
    totalStrokes: 3,
    strokes: [
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'top',
        startPoint: { x: 0.3, y: 0.2 },
        endPoint: { x: 0.7, y: 0.2 }
      },
      {
        direction: 'vertical',
        length: 'medium',
        position: 'center',
        startPoint: { x: 0.5, y: 0.3 },
        endPoint: { x: 0.45, y: 0.6 }
      },
      {
        direction: 'horizontal',
        length: 'long',
        position: 'bottom',
        startPoint: { x: 0.2, y: 0.7 },
        endPoint: { x: 0.8, y: 0.7 }
      }
    ]
  },
  {
    character: 'し',
    totalStrokes: 1,
    strokes: [
      {
        direction: 'complex',
        length: 'long',
        position: 'center',
        startPoint: { x: 0.5, y: 0.2 },
        endPoint: { x: 0.3, y: 0.8 }
      }
    ]
  },
  {
    character: 'す',
    totalStrokes: 2,
    strokes: [
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'top',
        startPoint: { x: 0.3, y: 0.25 },
        endPoint: { x: 0.7, y: 0.25 }
      },
      {
        direction: 'complex',
        length: 'long',
        position: 'center',
        startPoint: { x: 0.5, y: 0.4 },
        endPoint: { x: 0.4, y: 0.8 }
      }
    ]
  },
  {
    character: 'せ',
    totalStrokes: 3,
    strokes: [
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'top',
        startPoint: { x: 0.3, y: 0.2 },
        endPoint: { x: 0.7, y: 0.2 }
      },
      {
        direction: 'vertical',
        length: 'medium',
        position: 'center',
        startPoint: { x: 0.5, y: 0.3 },
        endPoint: { x: 0.45, y: 0.6 }
      },
      {
        direction: 'complex',
        length: 'long',
        position: 'bottom',
        startPoint: { x: 0.2, y: 0.7 },
        endPoint: { x: 0.8, y: 0.8 }
      }
    ]
  },
  {
    character: 'そ',
    totalStrokes: 1,
    strokes: [
      {
        direction: 'complex',
        length: 'long',
        position: 'center',
        startPoint: { x: 0.3, y: 0.2 },
        endPoint: { x: 0.7, y: 0.8 }
      }
    ]
  },
  // た行
  {
    character: 'た',
    totalStrokes: 4,
    strokes: [
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'top',
        startPoint: { x: 0.3, y: 0.15 },
        endPoint: { x: 0.7, y: 0.15 }
      },
      {
        direction: 'vertical',
        length: 'medium',
        position: 'left',
        startPoint: { x: 0.35, y: 0.25 },
        endPoint: { x: 0.3, y: 0.6 }
      },
      {
        direction: 'horizontal',
        length: 'long',
        position: 'middle',
        startPoint: { x: 0.2, y: 0.4 },
        endPoint: { x: 0.8, y: 0.4 }
      },
      {
        direction: 'vertical',
        length: 'long',
        position: 'center',
        startPoint: { x: 0.5, y: 0.5 },
        endPoint: { x: 0.45, y: 0.85 }
      }
    ]
  },
  {
    character: 'ち',
    totalStrokes: 2,
    strokes: [
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'top',
        startPoint: { x: 0.3, y: 0.3 },
        endPoint: { x: 0.7, y: 0.3 }
      },
      {
        direction: 'complex',
        length: 'long',
        position: 'center',
        startPoint: { x: 0.5, y: 0.4 },
        endPoint: { x: 0.4, y: 0.8 }
      }
    ]
  },
  {
    character: 'つ',
    totalStrokes: 1,
    strokes: [
      {
        direction: 'complex',
        length: 'medium',
        position: 'center',
        startPoint: { x: 0.4, y: 0.3 },
        endPoint: { x: 0.6, y: 0.6 }
      }
    ]
  },
  {
    character: 'て',
    totalStrokes: 2,
    strokes: [
      {
        direction: 'horizontal',
        length: 'long',
        position: 'top',
        startPoint: { x: 0.2, y: 0.3 },
        endPoint: { x: 0.8, y: 0.3 }
      },
      {
        direction: 'vertical',
        length: 'long',
        position: 'right',
        startPoint: { x: 0.7, y: 0.4 },
        endPoint: { x: 0.75, y: 0.8 }
      }
    ]
  },
  {
    character: 'と',
    totalStrokes: 2,
    strokes: [
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'top',
        startPoint: { x: 0.3, y: 0.25 },
        endPoint: { x: 0.7, y: 0.25 }
      },
      {
        direction: 'complex',
        length: 'long',
        position: 'center',
        startPoint: { x: 0.5, y: 0.4 },
        endPoint: { x: 0.6, y: 0.8 }
      }
    ]
  },
  // な行
  {
    character: 'な',
    totalStrokes: 4,
    strokes: [
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'top',
        startPoint: { x: 0.3, y: 0.2 },
        endPoint: { x: 0.7, y: 0.2 }
      },
      {
        direction: 'vertical',
        length: 'medium',
        position: 'left',
        startPoint: { x: 0.35, y: 0.3 },
        endPoint: { x: 0.3, y: 0.6 }
      },
      {
        direction: 'horizontal',
        length: 'medium',
        position: 'middle',
        startPoint: { x: 0.45, y: 0.5 },
        endPoint: { x: 0.75, y: 0.5 }
      },
      {
        direction: 'vertical',
        length: 'long',
        position: 'right',
        startPoint: { x: 0.7, y: 0.3 },
        endPoint: { x: 0.75, y: 0.85 }
      }
    ]
  },
  {
    character: 'に',
    totalStrokes: 3,
    strokes: [
      {
        direction: 'horizontal',
        length: 'long',
        position: 'top',
        startPoint: { x: 0.2, y: 0.3 },
        endPoint: { x: 0.8, y: 0.3 }
      },
      {
        direction: 'vertical',
        length: 'short',
        position: 'left',
        startPoint: { x: 0.3, y: 0.4 },
        endPoint: { x: 0.25, y: 0.6 }
      },
      {
        direction: 'horizontal',
        length: 'long',
        position: 'bottom',
        startPoint: { x: 0.2, y: 0.7 },
        endPoint: { x: 0.8, y: 0.7 }
      }
    ]
  },
  {
    character: 'ぬ',
    totalStrokes: 2,
    strokes: [
      {
        direction: 'complex',
        length: 'medium',
        position: 'left',
        startPoint: { x: 0.3, y: 0.3 },
        endPoint: { x: 0.4, y: 0.6 }
      },
      {
        direction: 'complex',
        length: 'long',
        position: 'right',
        startPoint: { x: 0.5, y: 0.2 },
        endPoint: { x: 0.7, y: 0.8 }
      }
    ]
  },
  {
    character: 'ね',
    totalStrokes: 2,
    strokes: [
      {
        direction: 'complex',
        length: 'medium',
        position: 'left',
        startPoint: { x: 0.3, y: 0.2 },
        endPoint: { x: 0.4, y: 0.5 }
      },
      {
        direction: 'complex',
        length: 'long',
        position: 'right',
        startPoint: { x: 0.5, y: 0.3 },
        endPoint: { x: 0.7, y: 0.8 }
      }
    ]
  },
  {
    character: 'の',
    totalStrokes: 1,
    strokes: [
      {
        direction: 'complex',
        length: 'long',
        position: 'center',
        startPoint: { x: 0.3, y: 0.3 },
        endPoint: { x: 0.7, y: 0.7 }
      }
    ]
  }
];

// ストロークパターンのマッチング関数
export const matchStrokePattern = (userStrokes: StrokePattern[], candidates: CharacterStroke[]): { character: string; confidence: number }[] => {
  const results = candidates.map(candidate => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    // ユーザーが書いた画数分だけ評価（未完成の文字に対応）
    const evaluationLength = Math.min(userStrokes.length, candidate.strokes.length);
    
    for (let i = 0; i < evaluationLength; i++) {
      maxPossibleScore += 100;
      
      const userStroke = userStrokes[i];
      const candidateStroke = candidate.strokes[i];
      
      let strokeScore = 0;
      
      // 方向マッチング (50点) - 重要度アップ
      if (userStroke.direction === candidateStroke.direction) {
        strokeScore += 50;
      } else if (
        (userStroke.direction === 'horizontal' && candidateStroke.direction === 'horizontal') ||
        (userStroke.direction === 'vertical' && candidateStroke.direction === 'vertical')
      ) {
        strokeScore += 25;
      } else if (userStroke.direction === 'complex' || candidateStroke.direction === 'complex') {
        strokeScore += 15; // 複雑な形状には寛容に
      }
      
      // 位置マッチング (35点) - 重要度アップ
      if (userStroke.position === candidateStroke.position) {
        strokeScore += 35;
      } else {
        // 近い位置には部分点
        const positionScore = calculatePositionSimilarity(userStroke.position, candidateStroke.position);
        strokeScore += Math.round(positionScore * 35);
      }
      
      // 長さマッチング (15点) - 重要度ダウン
      if (userStroke.length === candidateStroke.length) {
        strokeScore += 15;
      } else {
        strokeScore += 8; // 長さの違いは許容
      }
      
      totalScore += strokeScore;
    }
    
    // 画数ボーナス: 期待画数に近いほど高評価
    const strokeCountPenalty = Math.abs(userStrokes.length - candidate.totalStrokes) * 5;
    const adjustedScore = Math.max(0, totalScore - strokeCountPenalty);
    
    const confidence = maxPossibleScore > 0 ? (adjustedScore / maxPossibleScore) * 100 : 0;
    
    return {
      character: candidate.character,
      confidence: Math.round(Math.min(confidence, 100))
    };
  });
  
  return results.sort((a, b) => b.confidence - a.confidence);
};

// 位置の類似度を計算する補助関数
const calculatePositionSimilarity = (pos1: StrokePattern['position'], pos2: StrokePattern['position']): number => {
  const positionMap: { [key: string]: number } = {
    'top': 0, 'center': 1, 'middle': 1, 'bottom': 2,
    'left': 0, 'right': 2
  };
  
  const val1 = positionMap[pos1] ?? 1;
  const val2 = positionMap[pos2] ?? 1;
  const distance = Math.abs(val1 - val2);
  
  return Math.max(0, 1 - distance / 2); // 0-1の範囲で類似度を返す
};

export default strokeDatabase;