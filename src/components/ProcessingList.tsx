import type { ProcessingFile, TransformConfig } from '../types';
import { useLang } from '../i18n';

interface Props {
  files: ProcessingFile[];
  config: TransformConfig;
  onRemove: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FileRow({
  item,
  config,
  onRemove,
}: {
  item: ProcessingFile;
  config: TransformConfig;
  onRemove: () => void;
}) {
  const { t } = useLang();
  const ext = config.format === 'jpg' ? 'jpg' : config.format;
  const baseName = item.file.name.replace(/\.[^/.]+$/, '');
  const outputName = `${baseName}.${ext}`;

  return (
    <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl" style={{ background: '#0f1929' }}>
      {/* Thumbnail */}
      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
        <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white text-sm font-medium truncate">{outputName}</span>
          <span className="text-gray-400 text-xs ml-4 flex-shrink-0">
            {item.status === 'done' && item.resultSize
              ? formatSize(item.resultSize)
              : formatSize(item.file.size)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-800 rounded-full mb-2">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${item.progress}%` }}
          />
        </div>

        <span
          className={`text-xs font-medium tracking-wide ${
            item.status === 'done'
              ? 'text-blue-400'
              : item.status === 'error'
                ? 'text-red-400'
                : item.status === 'processing'
                  ? 'text-gray-500'
                  : 'text-gray-600'
          }`}
        >
          {item.status === 'done'
            ? t.readyToDownload
            : item.status === 'error'
              ? (item.error ?? 'ERROR').toUpperCase()
              : item.status === 'processing'
                ? t.processing
                : t.pending}
        </span>
      </div>

      {/* Action button */}
      <div className="flex-shrink-0">
        {item.status === 'done' && item.resultUrl ? (
          <a
            href={item.resultUrl}
            download={outputName}
            className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-blue-400 hover:bg-blue-600/40 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
        ) : item.status === 'processing' ? (
          <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : (
          <button
            className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
            onClick={onRemove}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProcessingList({ files, config, onRemove }: Props) {
  const { t } = useLang();
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold">{t.activeProcessing}</h2>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
          style={{ background: '#1a2640' }}
        >
          {files.length} {t.items}
        </span>
      </div>
      <div className="space-y-3">
        {files.map((f) => (
          <FileRow key={f.id} item={f} config={config} onRemove={() => onRemove(f.id)} />
        ))}
      </div>
    </div>
  );
}
