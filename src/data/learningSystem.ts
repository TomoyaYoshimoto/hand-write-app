// ユーザー入力文字の学習システム

import type { StrokePattern, CharacterStroke } from './strokeDatabase';

export interface UserLearningData {
  character: string;
  userStrokes: StrokePattern[];
  timestamp: number;
  confidence: number; // 学習時の信頼度
  frequency: number; // 使用頻度
}

export interface LearningSession {
  sessionId: string;
  userStrokes: StrokePattern[];
  suggestedCharacter: string;
  correctCharacter?: string; // ユーザーが正解として指定した文字
  timestamp: number;
}

// 学習データの管理クラス
export class CharacterLearningSystem {
  private learningData: Map<string, UserLearningData[]> = new Map();
  private sessions: LearningSession[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // ストロークパターンを学習データとして追加
  addLearningData(character: string, strokes: StrokePattern[], confidence: number = 100): void {
    const existing = this.learningData.get(character) || [];
    
    const newData: UserLearningData = {
      character,
      userStrokes: strokes,
      timestamp: Date.now(),
      confidence,
      frequency: 1
    };

    // 類似パターンがあるかチェック
    const similar = this.findSimilarPattern(strokes, existing);
    if (similar) {
      // 類似パターンの頻度を上げる
      similar.frequency += 1;
      similar.timestamp = Date.now();
      console.log(`既存の${character}パターンの頻度を更新:`, similar.frequency);
    } else {
      // 新しいパターンとして追加
      existing.push(newData);
      console.log(`新しい${character}パターンを学習:`, strokes);
    }

    this.learningData.set(character, existing);
    this.saveToStorage();
  }

  // 類似パターンを検出
  private findSimilarPattern(strokes: StrokePattern[], existing: UserLearningData[]): UserLearningData | null {
    const threshold = 0.8; // 類似度の閾値

    for (const data of existing) {
      const similarity = this.calculatePatternSimilarity(strokes, data.userStrokes);
      if (similarity > threshold) {
        return data;
      }
    }
    return null;
  }

  // パターンの類似度を計算
  private calculatePatternSimilarity(pattern1: StrokePattern[], pattern2: StrokePattern[]): number {
    if (pattern1.length !== pattern2.length) {
      return 0;
    }

    let totalScore = 0;
    for (let i = 0; i < pattern1.length; i++) {
      const stroke1 = pattern1[i];
      const stroke2 = pattern2[i];
      
      let strokeScore = 0;
      
      // 方向の類似度
      if (stroke1.direction === stroke2.direction) strokeScore += 0.4;
      
      // 位置の類似度
      if (stroke1.position === stroke2.position) strokeScore += 0.4;
      
      // 長さの類似度
      if (stroke1.length === stroke2.length) strokeScore += 0.2;
      
      totalScore += strokeScore;
    }

    return totalScore / pattern1.length;
  }

  // 学習データを含めた文字マッチング
  matchWithLearning(userStrokes: StrokePattern[], baseCharacters: CharacterStroke[]): { character: string; confidence: number; isLearned?: boolean }[] {
    const results: { character: string; confidence: number; isLearned?: boolean }[] = [];

    // 基本データベースからのマッチング
    baseCharacters.forEach(char => {
      const confidence = this.calculateBaseConfidence(userStrokes, char);
      results.push({ character: char.character, confidence, isLearned: false });
    });

    // 学習データからのマッチング
    this.learningData.forEach((learningList, character) => {
      learningList.forEach(learningData => {
        const similarity = this.calculatePatternSimilarity(userStrokes, learningData.userStrokes);
        if (similarity > 0.6) {
          // 頻度ボーナスを適用
          const frequencyBonus = Math.min(learningData.frequency * 5, 20);
          const learnedConfidence = (similarity * 100) + frequencyBonus;
          
          // 既存の結果と統合
          const existingIndex = results.findIndex(r => r.character === character);
          if (existingIndex >= 0) {
            results[existingIndex].confidence = Math.max(results[existingIndex].confidence, learnedConfidence);
            results[existingIndex].isLearned = true;
          } else {
            results.push({ character, confidence: learnedConfidence, isLearned: true });
          }
        }
      });
    });

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  // 基本信頼度の計算（簡略版）
  private calculateBaseConfidence(userStrokes: StrokePattern[], character: CharacterStroke): number {
    if (userStrokes.length === 0 || character.strokes.length === 0) return 0;
    
    const evaluationLength = Math.min(userStrokes.length, character.strokes.length);
    let totalScore = 0;
    
    for (let i = 0; i < evaluationLength; i++) {
      const userStroke = userStrokes[i];
      const charStroke = character.strokes[i];
      
      let strokeScore = 0;
      if (userStroke.direction === charStroke.direction) strokeScore += 50;
      if (userStroke.position === charStroke.position) strokeScore += 35;
      if (userStroke.length === charStroke.length) strokeScore += 15;
      
      totalScore += strokeScore;
    }
    
    return evaluationLength > 0 ? (totalScore / evaluationLength) : 0;
  }

  // フィードバック学習（正解文字を教える）
  learnFromFeedback(sessionId: string, correctCharacter: string): void {
    const session = this.sessions.find(s => s.sessionId === sessionId);
    if (session) {
      session.correctCharacter = correctCharacter;
      this.addLearningData(correctCharacter, session.userStrokes, 100);
      console.log(`フィードバック学習: ${correctCharacter}を学習しました`);
    }
  }

  // セッションの記録
  recordSession(sessionId: string, userStrokes: StrokePattern[], suggestedCharacter: string): void {
    const session: LearningSession = {
      sessionId,
      userStrokes,
      suggestedCharacter,
      timestamp: Date.now()
    };
    
    this.sessions.push(session);
    
    // 古いセッションを削除（最新100件のみ保持）
    if (this.sessions.length > 100) {
      this.sessions = this.sessions.slice(-100);
    }
  }

  // 学習統計の取得
  getLearningStats(): { [character: string]: { patterns: number; totalFrequency: number } } {
    const stats: { [character: string]: { patterns: number; totalFrequency: number } } = {};
    
    this.learningData.forEach((learningList, character) => {
      const totalFrequency = learningList.reduce((sum, data) => sum + data.frequency, 0);
      stats[character] = {
        patterns: learningList.length,
        totalFrequency
      };
    });
    
    return stats;
  }

  // ローカルストレージに保存
  private saveToStorage(): void {
    try {
      const data = {
        learningData: Array.from(this.learningData.entries()),
        sessions: this.sessions.slice(-50) // 最新50件のみ保存
      };
      localStorage.setItem('characterLearningData', JSON.stringify(data));
    } catch (error) {
      console.error('学習データの保存に失敗:', error);
    }
  }

  // ローカルストレージから読み込み
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('characterLearningData');
      if (stored) {
        const data = JSON.parse(stored);
        this.learningData = new Map(data.learningData || []);
        this.sessions = data.sessions || [];
        console.log('学習データを読み込みました:', this.getLearningStats());
      }
    } catch (error) {
      console.error('学習データの読み込みに失敗:', error);
    }
  }

  // 学習データのリセット
  resetLearningData(): void {
    this.learningData.clear();
    this.sessions = [];
    localStorage.removeItem('characterLearningData');
    console.log('学習データをリセットしました');
  }
}

// グローバルインスタンス
export const learningSystem = new CharacterLearningSystem();