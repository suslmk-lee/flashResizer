import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'ko' | 'ja' | 'zh';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ko', label: '한' },
  { code: 'ja', label: '日' },
  { code: 'zh', label: '中' },
];

const translations = {
  en: {
    documentation: 'Documentation',
    dragDrop: 'Drag and drop images here',
    supportedFormats: 'Support for JPG, PNG, WebP, and AVIF up to 10MB',
    selectFiles: 'Select Files',
    releaseToUpload: 'Release to upload',
    activeProcessing: 'Active Processing',
    items: 'items',
    readyToDownload: 'READY TO DOWNLOAD',
    processing: 'PROCESSING...',
    pending: 'PENDING',
    configuration: 'Configuration',
    reset: 'Reset',
    dimensions: 'Dimensions',
    lockAspectRatio: 'Lock Aspect Ratio',
    width: 'Width',
    height: 'Height',
    outputFormat: 'Output Format',
    quality: 'Quality',
    processAll: 'Process All',
    footer: '© 2024 FlashResizer Inc. All rights reserved.',
  },
  ko: {
    documentation: '문서',
    dragDrop: '이미지를 여기에 드래그 앤 드롭',
    supportedFormats: 'JPG, PNG, WebP, AVIF 지원 · 최대 10MB',
    selectFiles: '파일 선택',
    releaseToUpload: '놓아서 업로드',
    activeProcessing: '처리 목록',
    items: '개',
    readyToDownload: '다운로드 준비됨',
    processing: '처리 중...',
    pending: '대기 중',
    configuration: '설정',
    reset: '초기화',
    dimensions: '크기',
    lockAspectRatio: '비율 잠금',
    width: '너비',
    height: '높이',
    outputFormat: '출력 형식',
    quality: '품질',
    processAll: '전체 처리',
    footer: '© 2024 FlashResizer Inc. All rights reserved.',
  },
  ja: {
    documentation: 'ドキュメント',
    dragDrop: 'ここに画像をドラッグ＆ドロップ',
    supportedFormats: 'JPG, PNG, WebP, AVIF対応 · 最大10MB',
    selectFiles: 'ファイルを選択',
    releaseToUpload: 'ドロップしてアップロード',
    activeProcessing: '処理リスト',
    items: '件',
    readyToDownload: 'ダウンロード準備完了',
    processing: '処理中...',
    pending: '待機中',
    configuration: '設定',
    reset: 'リセット',
    dimensions: 'サイズ',
    lockAspectRatio: 'アスペクト比を固定',
    width: '幅',
    height: '高さ',
    outputFormat: '出力形式',
    quality: '品質',
    processAll: 'すべて処理',
    footer: '© 2024 FlashResizer Inc. All rights reserved.',
  },
  zh: {
    documentation: '文档',
    dragDrop: '将图片拖放到此处',
    supportedFormats: '支持 JPG, PNG, WebP, AVIF · 最大 10MB',
    selectFiles: '选择文件',
    releaseToUpload: '松开以上传',
    activeProcessing: '处理列表',
    items: '个',
    readyToDownload: '准备下载',
    processing: '处理中...',
    pending: '等待中',
    configuration: '配置',
    reset: '重置',
    dimensions: '尺寸',
    lockAspectRatio: '锁定宽高比',
    width: '宽度',
    height: '高度',
    outputFormat: '输出格式',
    quality: '质量',
    processAll: '全部处理',
    footer: '© 2024 FlashResizer Inc. All rights reserved.',
  },
};

export type Translations = typeof translations.en;

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
