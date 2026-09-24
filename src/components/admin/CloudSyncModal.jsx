import { useState, useEffect } from 'react';
import {
  X, Cloud, Key, CheckCircle2, AlertCircle, RefreshCw,
  ExternalLink, Eye, EyeOff, Trash2, Check, ShieldCheck
} from 'lucide-react';
import {
  getBackendToken,
  setBackendToken,
  clearBackendToken,
  testTokenConnection,
  GITHUB_REPO_OWNER,
  GITHUB_REPO_NAME,
  GITHUB_BRANCH
} from '../../services/backendSync';

export default function CloudSyncModal({ isOpen, onClose, onTokenSaved }) {
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = getBackendToken();
      setTokenInput(existing || '');
      setTestResult(null);
      setSavedSuccess(false);
      if (existing) {
        // Auto-test existing token
        handleTest(existing);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async (tokenToTest) => {
    const val = (tokenToTest !== undefined ? tokenToTest : tokenInput).trim();
    if (!val) {
      setTestResult({ ok: false, error: 'Please enter a GitHub personal access token' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testTokenConnection(val);
      setTestResult(res);
    } catch (err) {
      setTestResult({ ok: false, error: err.message || 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const clean = tokenInput.trim();
    if (!clean) {
      clearBackendToken();
      onTokenSaved('');
    } else {
      setBackendToken(clean);
      onTokenSaved(clean);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleDisconnect = () => {
    clearBackendToken();
    setTokenInput('');
    setTestResult(null);
    onTokenSaved('');
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800/80 rounded-xl">
              <Cloud size={20} className="text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Cloud Backend Sync</h3>
              <p className="text-xs text-emerald-300/80">Save edits permanently to live storefront for all visitors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Target Repo Info */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <div className="text-gray-400 font-medium">Target Repository:</div>
              <div className="font-mono font-bold text-gray-800 text-sm mt-0.5">
                {GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}
              </div>
              <div className="text-gray-400 text-[11px] mt-0.5">
                Branch: <span className="font-semibold text-gray-600">{GITHUB_BRANCH}</span> · File: <span className="font-mono text-gray-600">public/products-live.json</span>
              </div>
            </div>
            <a
              href={`https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>GitHub</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Token Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Key size={14} className="text-emerald-600" />
                GitHub Access Token:
              </label>
              <span className="text-[11px] text-gray-400">Stored in browser localStorage</span>
            </div>

            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder="Paste your GitHub Personal Access Token..."
                className="w-full pl-3.5 pr-20 py-2.5 text-xs font-mono bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-200 text-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md"
                title={showToken ? 'Hide token' : 'Show token'}
              >
                {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Test Status Feedback */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              testResult.ok && testResult.canPush
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : testResult.ok && !testResult.canPush
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              {testResult.ok && testResult.canPush ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Connected & Verified!</div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      Write/push permission confirmed for <strong>{testResult.repo}</strong>. Edits will sync live to the storefront.
                    </div>
                  </div>
                </>
              ) : testResult.ok && !testResult.canPush ? (
                <>
                  <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Read-Only Token</div>
                    <div className="text-[11px] text-amber-700 mt-0.5">
                      Token has read access, but lacks write/push permissions. Ensure your token has the <strong>repo</strong> scope.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Connection Failed</div>
                    <div className="text-[11px] text-red-700 mt-0.5">{testResult.error}</div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Quick Token Generation / 403 Troubleshooting Box */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3.5 text-xs space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                🔑 Need a token or got Error 403?
              </span>
              <a
                href="https://github.com/settings/tokens/new?description=Kahf+Greens+Clearance+Admin&scopes=repo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-amber-700 hover:bg-amber-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-all hover:scale-102"
              >
                <span>Generate Token (Pre-Selected)</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              <strong>Why HTTP 403 happens:</strong> Your token is missing write permissions for repository contents.
            </p>
            <ul className="text-[11px] text-amber-900/90 space-y-1 list-disc pl-4">
              <li>
                <strong>Classic Token (Recommended):</strong> Clicking the button above opens GitHub with the <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-900">repo</code> scope pre-checked. Scroll to bottom, click <strong>Generate token</strong>, and paste it above.
              </li>
              <li>
                <strong>Fine-Grained Token:</strong> Under <em>Repository permissions</em>, change <strong>Contents</strong> to <strong>Read and write</strong>, and make sure <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">alkahf-stock-clearance-react</code> is selected.
              </li>
            </ul>
          </div>

          {/* Instructions Box */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-[11px] text-gray-600 space-y-1.5">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-600" />
              How it works:
            </div>
            <p>
              • When you click <strong>Save & Publish Live</strong>, updates are committed directly to GitHub's master branch via GitHub Contents API.
            </p>
            <p>
              • Customers and visitors automatically load the latest prices, quantities, and photos from jsDelivr's global CDN in real-time.
            </p>
            <p className="text-gray-500">
              💡 <em>Using GitHub CLI in terminal? Run <code className="bg-emerald-100/70 px-1 py-0.5 rounded text-emerald-800 font-mono">gh auth token</code> to get your active token instantly.</em>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div>
            {tokenInput && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:underline font-semibold"
              >
                <Trash2 size={13} />
                Disconnect
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isTesting || !tokenInput.trim()}
              onClick={() => handleTest()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              {isTesting ? <RefreshCw size={13} className="animate-spin text-emerald-600" /> : <RefreshCw size={13} />}
              Test Connection
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-sm ${
                savedSuccess ? 'bg-emerald-800' : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check size={14} /> Saved!
                </>
              ) : (
                'Save Connection'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
