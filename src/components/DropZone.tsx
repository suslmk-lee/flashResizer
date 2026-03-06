import { useCallback, useRef, useState, type DragEvent } from 'react';
import { useLang } from '../i18n';

interface Props {
  onFiles: (files: File[]) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE = 10 * 1024 * 1024;

export default function DropZone({ onFiles }: Props) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0); // children의 dragenter/leave 중첩 방지

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const valid = Array.from(fileList).filter(
        (f) => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_SIZE
      );
      if (valid.length > 0) onFiles(valid);
    },
    [onFiles]
  );

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-10 px-6 lg:py-16 lg:px-8 cursor-pointer transition-all duration-200"
      style={{
        borderColor: isDragging ? '#3b82f6' : 'rgba(30, 58, 138, 0.5)',
        background: isDragging ? 'rgba(59, 130, 246, 0.08)' : 'rgba(15, 25, 41, 0.4)',
        transform: isDragging ? 'scale(1.01)' : 'scale(1)',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-colors duration-200"
        style={{ background: isDragging ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)' }}
      >
        <svg
          className="w-8 h-8 transition-colors duration-200"
          style={{ color: isDragging ? '#60a5fa' : '#3b82f6' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isDragging ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          )}
        </svg>
      </div>

      <p className="font-semibold text-lg mb-1.5 transition-colors duration-200" style={{ color: isDragging ? '#93c5fd' : 'white' }}>
        {isDragging ? t.releaseToUpload : t.dragDrop}
      </p>
      <p className="text-gray-500 text-sm mb-7">{t.supportedFormats}</p>

      <button
        className="px-7 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full transition-colors text-sm"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
      >
        {t.selectFiles}
      </button>
    </div>
  );
}
