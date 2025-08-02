import { createWorker } from 'tesseract.js';

export const processImageWithOCR = async (imageData: string): Promise<string> => {
  try {
    console.log('OCR処理開始');
    
    // より軽量な設定でワーカーを作成
    const worker = await createWorker('jpn', 1, {
      logger: m => console.log('OCR:', m.status, m.progress)
    });
    
    // シンプルな設定に変更 - パラメータ設定をスキップ

    console.log('OCR認識開始');
    const { data: { text } } = await worker.recognize(imageData);
    console.log('OCR認識完了:', text);
    
    await worker.terminate();
    console.log('OCRワーカー終了');
    
    return text.trim() || '?';
  } catch (error) {
    console.error('OCR processing failed:', error);
    return '?';
  }
};

export default processImageWithOCR;