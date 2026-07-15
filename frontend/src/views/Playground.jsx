import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Sparkles } from 'lucide-react';
import { migrateLegacyStorage, STORAGE } from '../lib/storageKeys.js';

const storageKey = STORAGE.playgroundCode;
const postMessageSource = 'skillforge-playground';
const legacyPostMessageSource = 'skillnova-playground';

const starter = `<main class="card">
  <h1>SkillForge Try-It Editor</h1>
  <p>Edit HTML, CSS, and JS. Click Run to refresh the preview.</p>
  <button onclick="celebrate()">Run challenge</button>
</main>
<style>
  body { font-family: Inter, sans-serif; background: #020617; color: white; display: grid; place-items: center; min-height: 100vh; }
  .card { max-width: 520px; padding: 32px; border-radius: 24px; background: linear-gradient(135deg, #4f46e5, #06b6d4); }
  button { border: 0; border-radius: 999px; padding: 12px 18px; font-weight: 800; }
</style>
<script>
  function celebrate() {
    document.querySelector('p').textContent = 'Great work. Exercise validated in real time.';
  }
</script>`;

function getInitialCode() {
  try {
    migrateLegacyStorage();
    return localStorage.getItem(storageKey) || starter;
  } catch {
    return starter;
  }
}

function createHint(code) {
  const hints = [];

  if (!/<style[\s>]/i.test(code)) {
    hints.push('Add a <style> block so your layout has spacing, colors, and responsive polish.');
  }

  if (!/<script[\s>]/i.test(code)) {
    hints.push('Add a <script> block for interaction, then connect it with an onclick handler or event listener.');
  }

  if (!/<button[\s>]/i.test(code)) {
    hints.push('Add a button and wire it to a small function so the preview proves your JavaScript works.');
  }

  if (!/document\.querySelector|addEventListener|onclick=/i.test(code)) {
    hints.push('Try changing text or styles from JavaScript using querySelector, addEventListener, or an inline handler.');
  }

  return hints[0] || 'Nice structure. For the next step, add one responsive rule or a second interactive state.';
}

function buildSrcDoc(code) {
  return `${code}
<script>
  window.addEventListener('error', function (event) {
    window.parent.postMessage({ source: postMessageSource, type: 'error', text: event.message }, '*');
  });

  ['log', 'warn', 'error'].forEach(function (method) {
    var original = console[method];
    console[method] = function () {
      var text = Array.prototype.map.call(arguments, function (item) {
        return typeof item === 'object' ? JSON.stringify(item) : String(item);
      }).join(' ');
      window.parent.postMessage({ source: postMessageSource, type: method, text: text }, '*');
      original.apply(console, arguments);
    };
  });
</script>`;
}

export function Playground() {
  const [code, setCode] = useState(getInitialCode);
  const [previewCode, setPreviewCode] = useState(code);
  const [hint, setHint] = useState('Run the starter challenge, then ask for a hint when you want the next nudge.');
  const [saveStatus, setSaveStatus] = useState('Auto-save ready');
  const [runStatus, setRunStatus] = useState('Preview ready');
  const [consoleMessages, setConsoleMessages] = useState([]);
  const srcDoc = useMemo(() => buildSrcDoc(previewCode), [previewCode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, code);
        setSaveStatus('Auto-saved');
      } catch {
        setSaveStatus('Unable to save');
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.source !== postMessageSource && event.data?.source !== legacyPostMessageSource) return;

      setConsoleMessages((messages) => [
        { type: event.data.type, text: event.data.text },
        ...messages,
      ].slice(0, 5));
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const runCode = () => {
    setConsoleMessages([]);
    setPreviewCode(code);
    setRunStatus(`Ran at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  const saveCode = () => {
    try {
      localStorage.setItem(storageKey, code);
      setSaveStatus(`Saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } catch {
      setSaveStatus('Unable to save');
    }
  };

  const showHint = () => {
    setHint(createHint(code));
  };

  return (
    <main className="min-h-[calc(100vh-69px)] px-4 py-8">
      <div className="mx-auto mb-5 flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div><p className="font-black uppercase text-indigo-500">W3Schools-inspired</p><h1 className="text-4xl font-black">Interactive Coding Playground</h1></div>
        <div className="flex gap-2">
          <button type="button" onClick={showHint} className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 px-4 font-bold dark:border-slate-800"><Sparkles className="h-4 w-4" /> AI Hint</button>
          <button type="button" onClick={saveCode} className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 px-4 font-bold dark:border-slate-800"><Save className="h-4 w-4" /> {saveStatus}</button>
          <button type="button" onClick={runCode} className="inline-flex h-11 items-center gap-2 rounded-full bg-indigo-600 px-4 font-bold text-white"><Play className="h-4 w-4" /> Run</button>
        </div>
      </div>
      <div className="mx-auto mb-5 grid max-w-7xl gap-3 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          <span className="font-black text-indigo-500">Hint: </span>{hint}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          {runStatus}
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 lg:grid-cols-2">
        <div className="min-h-[650px] bg-slate-950">
          <Editor height="650px" defaultLanguage="html" value={code} onChange={(value) => setCode(value || '')} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on' }} />
        </div>
        <div className="grid bg-white dark:bg-slate-950">
          <iframe title="Live preview" srcDoc={srcDoc} className="h-[560px] w-full bg-white" sandbox="allow-scripts" />
          <div className="h-[90px] overflow-auto border-t border-slate-200 bg-slate-950 p-3 text-xs text-slate-200 dark:border-slate-800">
            {consoleMessages.length ? consoleMessages.map((message, index) => (
              <p key={`${message.type}-${message.text}-${index}`} className={message.type === 'error' ? 'text-red-300' : message.type === 'warn' ? 'text-amber-300' : 'text-slate-200'}>
                [{message.type}] {message.text}
              </p>
            )) : <p className="text-slate-500">Console output will appear here after you run code.</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
