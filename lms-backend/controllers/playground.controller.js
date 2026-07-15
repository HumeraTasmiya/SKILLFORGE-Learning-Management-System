const SUPPORTED_LANGUAGES = new Set(['html', 'javascript', 'python', 'java', 'sql', 'bash']);
const DEFAULT_SANDBOX_URL = 'http://playground-sandbox:7070';
const MAX_CODE_LENGTH = 50000;

function normalizeLanguage(language) {
  const value = String(language || 'html').toLowerCase();
  if (value === 'js') return 'javascript';
  if (value === 'py') return 'python';
  return value;
}

export const runPlaygroundCode = async (req, res) => {
  const language = normalizeLanguage(req.body?.language);
  const code = String(req.body?.code || '');
  const challengeId = String(req.body?.challengeId || 'custom');

  if (!SUPPORTED_LANGUAGES.has(language)) {
    return res.status(400).json({ success: false, message: 'Unsupported playground language.' });
  }

  if (!code.trim()) {
    return res.status(400).json({ success: false, message: 'Add code before running the challenge.' });
  }

  if (code.length > MAX_CODE_LENGTH) {
    return res.status(413).json({ success: false, message: 'Playground code is too large to execute safely.' });
  }

  const sandboxUrl = (process.env.PLAYGROUND_SANDBOX_URL || DEFAULT_SANDBOX_URL).replace(/\/+$/, '');
  const timeoutMs = Number(process.env.PLAYGROUND_SANDBOX_TIMEOUT_MS || 7000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${sandboxUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        code,
        challengeId,
        userId: String(req.user?._id || ''),
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: payload.message || 'Sandbox execution failed.',
        error: payload.error,
      });
    }

    return res.json({ success: true, ...payload });
  } catch (error) {
    const timedOut = error.name === 'AbortError';
    return res.status(timedOut ? 504 : 503).json({
      success: false,
      message: timedOut
        ? 'Sandbox execution timed out.'
        : 'Sandbox execution service is unavailable.',
    });
  } finally {
    clearTimeout(timer);
  }
};
