import { useState, useCallback } from 'react';
import Header from './components/Header';
import DropZone from './components/DropZone';
import ProcessingList from './components/ProcessingList';
import Sidebar from './components/Sidebar';
import type { ProcessingFile, TransformConfig } from './types';

const DEFAULT_CONFIG: TransformConfig = {
  width: 1920,
  height: 1080,
  lockAspect: true,
  format: 'webp',
  quality: 85,
};

export default function App() {
  const [files, setFiles] = useState<ProcessingFile[]>([]);
  const [config, setConfig] = useState<TransformConfig>(DEFAULT_CONFIG);

  const addFiles = useCallback((newFiles: File[]) => {
    const items: ProcessingFile[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      thumbnail: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const f = prev.find((p) => p.id === id);
      if (f) {
        URL.revokeObjectURL(f.thumbnail);
        if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const reset = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => {
        URL.revokeObjectURL(f.thumbnail);
        if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
      });
      return [];
    });
    setConfig(DEFAULT_CONFIG);
  }, []);

  const processAll = async () => {
    // Reset done/error files back to pending so they can be re-processed with new config
    setFiles((prev) =>
      prev.map((p) =>
        p.status === 'done' || p.status === 'error'
          ? { ...p, status: 'pending', progress: 0, resultUrl: undefined, resultSize: undefined, error: undefined }
          : p
      )
    );

    for (const item of files) {
      setFiles((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: 'processing', progress: 20 } : p))
      );

      try {
        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('width', config.width.toString());
        formData.append('height', config.height.toString());
        formData.append('format', config.format);
        formData.append('quality', config.quality.toString());
        formData.append('maintainAspect', config.lockAspect.toString());

        setFiles((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, progress: 60 } : p))
        );

        const res = await fetch('/api/transform', { method: 'POST', body: formData });
        if (!res.ok) throw new Error(await res.text());

        const blob = await res.blob();
        const ext = config.format === 'jpg' ? 'jpg' : config.format;
        const baseName = item.file.name.replace(/\.[^/.]+$/, '');

        setFiles((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? {
                  ...p,
                  status: 'done',
                  progress: 100,
                  resultUrl: URL.createObjectURL(blob),
                  resultSize: blob.size,
                  // update thumbnail name for display
                }
              : p
          )
        );
        void ext; void baseName;
      } catch (err) {
        setFiles((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? {
                  ...p,
                  status: 'error',
                  progress: 0,
                  error: err instanceof Error ? err.message : 'Unknown error',
                }
              : p
          )
        );
      }
    }
  };

  const pendingCount = files.length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0b1120' }}>
      <Header />
      <main className="flex-1 flex overflow-hidden">
        {/* Left content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto min-w-0">
          <DropZone onFiles={addFiles} />
          {files.length > 0 && (
            <ProcessingList files={files} config={config} onRemove={removeFile} />
          )}
        </div>

        {/* Right sidebar */}
        <Sidebar
          config={config}
          onChange={setConfig}
          onProcessAll={processAll}
          onReset={reset}
          pendingCount={pendingCount}
        />
      </main>

      <footer
        className="px-6 py-3 border-t border-white/5 text-xs text-gray-600"
        style={{ background: '#0f1929' }}
      >
        &copy; 2024 FlashResizer Inc. All rights reserved.
      </footer>
    </div>
  );
}
