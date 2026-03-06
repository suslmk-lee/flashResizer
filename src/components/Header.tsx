import { useLang, LANGS } from '../i18n';

export default function Header() {
  const { t, lang, setLang } = useLang();
  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0"
      style={{ background: '#0f1929' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <span className="text-white font-semibold text-lg">FlashResizer</span>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <nav className="hidden lg:flex items-center gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-white transition-colors">
            {t.documentation}
          </a>
          <a href="https://github.com/suslmk-lee/flashResizer" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
            GitHub
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </nav>
        {/* GitHub icon only on mobile */}
        <a
          href="https://github.com/suslmk-lee/flashResizer"
          target="_blank"
          rel="noopener noreferrer"
          className="lg:hidden text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
        {/* Language toggle */}
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: '#1a2640' }}>
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
              style={{
                background: lang === code ? '#3b82f6' : 'transparent',
                color: lang === code ? 'white' : '#6b7280',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="hidden lg:block w-px h-5 bg-white/10" />
        <button className="hidden lg:block text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
        <div className="hidden lg:flex w-8 h-8 rounded-full bg-blue-600 items-center justify-center text-white text-sm font-medium">
          U
        </div>
      </div>
    </header>
  );
}
