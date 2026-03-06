import { useCallback, useRef, type DragEvent } from 'react';

interface Props {
  onFiles: (files: File[]) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE = 10 * 1024 * 1024;

export default function DropZone({ onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

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

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-blue-900/50 rounded-2xl flex flex-col items-center justify-center py-16 px-8 cursor-pointer transition-colors hover:border-blue-700/60"
      style={{ background: 'rgba(15, 25, 41, 0.4)' }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>

      <p className="text-white font-semibold text-lg mb-1.5">Drag and drop images here</p>
      <p className="text-gray-500 text-sm mb-7">Support for JPG, PNG, WebP, and AVIF up to 10MB</p>

      <button
        className="px-7 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full transition-colors text-sm"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
      >
        Select Files
      </button>
    </div>
  );
}
