import type { TransformConfig, OutputFormat } from '../types';

interface Props {
  config: TransformConfig;
  onChange: (config: TransformConfig) => void;
  onProcessAll: () => void;
  onReset: () => void;
  pendingCount: number;
}

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: 'webp', label: 'WebP' },
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
  { value: 'avif', label: 'AVIF' },
  { value: 'bmp', label: 'BMP' },
];

export default function Sidebar({ config, onChange, onProcessAll, onReset, pendingCount }: Props) {
  const update = (patch: Partial<TransformConfig>) => onChange({ ...config, ...patch });

  const handleWidth = (value: number) => {
    if (config.lockAspect && config.height > 0 && config.width > 0) {
      update({ width: value, height: Math.round(value * (config.height / config.width)) });
    } else {
      update({ width: value });
    }
  };

  const handleHeight = (value: number) => {
    if (config.lockAspect && config.width > 0 && config.height > 0) {
      update({ height: value, width: Math.round(value * (config.width / config.height)) });
    } else {
      update({ height: value });
    }
  };

  return (
    <aside
      className="w-72 flex-shrink-0 flex flex-col border-l border-white/5"
      style={{ background: '#0f1929' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <h2 className="text-white font-semibold">Configuration</h2>
        <button
          onClick={onReset}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {/* Dimensions */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <span className="text-white text-sm font-medium">Dimensions</span>
            <button
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              onClick={() => update({ lockAspect: !config.lockAspect })}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {config.lockAspect ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                )}
              </svg>
              Lock Aspect Ratio
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500 text-xs">Width</span>
                <span className="text-blue-400 text-xs font-medium">{config.width}px</span>
              </div>
              <input
                type="range"
                min={100}
                max={4000}
                step={10}
                value={config.width}
                onChange={(e) => handleWidth(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500 text-xs">Height</span>
                <span className="text-blue-400 text-xs font-medium">{config.height}px</span>
              </div>
              <input
                type="range"
                min={100}
                max={4000}
                step={10}
                value={config.height}
                onChange={(e) => handleHeight(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Output Format */}
        <div>
          <h3 className="text-white text-sm font-medium mb-3">Output Format</h3>
          <div className="grid grid-cols-2 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                onClick={() => update({ format: f.value })}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                  config.format === f.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white border border-white/5 hover:border-white/10'
                }`}
                style={config.format !== f.value ? { background: '#1a2640' } : undefined}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div>
          <div className="flex justify-between mb-3">
            <h3 className="text-white text-sm font-medium">Quality</h3>
            <span className="text-blue-400 text-sm font-medium">{config.quality}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={config.quality}
            onChange={(e) => update({ quality: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 py-5 border-t border-white/5 space-y-4">
        <button
          onClick={onProcessAll}
          disabled={pendingCount === 0}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Process All
        </button>

        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            CLOUDFLARE WORKERS
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            R2 STORAGE
          </div>
        </div>
      </div>
    </aside>
  );
}
