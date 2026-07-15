import express from 'express';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { spawn } from 'child_process';

const app = express();
const PORT = Number(process.env.PORT || 7070);
const MAX_CODE_LENGTH = Number(process.env.MAX_CODE_LENGTH || 50000);
const EXEC_TIMEOUT_MS = Number(process.env.EXEC_TIMEOUT_MS || 5000);
const OUTPUT_LIMIT = Number(process.env.OUTPUT_LIMIT || 12000);

const runners = {
  javascript: { command: 'node', file: 'main.js' },
  python: { command: 'python3', file: 'main.py' },
  java: {
    compileCommand: 'javac',
    compileArgs: ['Main.java'],
    command: 'java',
    args: ['Main'],
    file: 'Main.java',
  },
  sql: { command: 'sqlite3', args: [':memory:', '.read main.sql'], file: 'main.sql' },
  bash: { command: 'bash', file: 'main.sh' },
};

function normalizeLanguage(language) {
  const value = String(language || 'html').toLowerCase();
  if (value === 'js') return 'javascript';
  if (value === 'py') return 'python';
  return value;
}

function truncate(value) {
  const text = String(value || '');
  return text.length > OUTPUT_LIMIT ? `${text.slice(0, OUTPUT_LIMIT)}\n...output truncated` : text;
}

function runProcess({ command, args, cwd }) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        PATH: process.env.PATH,
        PYTHONIOENCODING: 'utf-8',
        NODE_OPTIONS: '--max-old-space-size=64',
      },
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, EXEC_TIMEOUT_MS);

    child.stdout.on('data', (chunk) => {
      stdout = truncate(stdout + chunk.toString('utf8'));
    });

    child.stderr.on('data', (chunk) => {
      stderr = truncate(stderr + chunk.toString('utf8'));
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ status: 'error', stdout, stderr: error.message, exitCode: 1, timedOut });
    });

    child.on('close', (exitCode) => {
      clearTimeout(timer);
      resolve({
        status: timedOut ? 'timeout' : exitCode === 0 ? 'passed' : 'error',
        stdout,
        stderr: timedOut ? `${stderr}\nExecution timed out after ${EXEC_TIMEOUT_MS}ms.`.trim() : stderr,
        exitCode,
        timedOut,
      });
    });
  });
}

app.use(express.json({ limit: '128kb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/execute', async (req, res) => {
  const language = normalizeLanguage(req.body?.language);
  const code = String(req.body?.code || '');

  if (!code.trim()) {
    return res.status(400).json({ message: 'Code is required.' });
  }

  if (code.length > MAX_CODE_LENGTH) {
    return res.status(413).json({ message: 'Code exceeds sandbox size limit.' });
  }

  if (language === 'html') {
    return res.json({
      language,
      status: 'passed',
      stdout: 'HTML preview refreshed in the browser sandbox.',
      stderr: '',
      previewHtml: code,
      executedIn: 'browser-iframe',
    });
  }

  const runner = runners[language];
  if (!runner) {
    return res.status(400).json({ message: 'Unsupported sandbox language.' });
  }

  const workspace = await mkdtemp(path.join(tmpdir(), 'skillforge-run-'));

  try {
    const filePath = path.join(workspace, runner.file);
    await writeFile(filePath, code, 'utf8');
    if (runner.compileCommand) {
      const compileResult = await runProcess({
        command: runner.compileCommand,
        args: runner.compileArgs || [runner.file],
        cwd: workspace,
      });
      if (compileResult.status !== 'passed') {
        return res.json({
          language,
          ...compileResult,
          status: 'error',
          stdout: truncate(compileResult.stdout),
          stderr: truncate(compileResult.stderr || 'Compilation failed.'),
          executedIn: 'playground-sandbox',
        });
      }
    }

    const result = await runProcess({
      command: runner.command,
      args: runner.args || [runner.file],
      cwd: workspace,
    });

    return res.json({
      language,
      ...result,
      stdout: truncate(result.stdout),
      stderr: truncate(result.stderr),
      executedIn: 'playground-sandbox',
    });
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

app.listen(PORT, () => {
  console.log(`Playground sandbox listening on ${PORT}`);
});
