/**
 * eduai.ts — connects this program to teachingtools.dev (Educational AI Suite).
 *
 * Replaces the old direct reads of the shared Bolt database (users_login,
 * secrets, auth_tokens), which were readable by anyone on the internet.
 *
 * Where the API keys come from (the first one that answers wins):
 *   1. The teachingtools.dev desktop, when this program is open in one of its windows.
 *   2. This program's own sign-in form — the username and password are checked by
 *      teachingtools.dev (the same accounts as the desktop).
 *   3. teachingtools.dev/key-bridge.html, when the person is already signed in at
 *      teachingtools.dev in this browser (only works on *.teachingtools.dev).
 *
 * Keys are kept in this program's localStorage under the same names as before
 * (api_cache, OPENAI_API_KEY, CLAUDE_API_KEY, GEMINI_API_KEY, REPLICATE_API_KEY,
 * VITE_OPENAI_API_KEY …, openai_api_key). They are never shown on screen: a small
 * dot in the top-right corner shows whether they are loaded.
 */

export const EDUAI_SITE = 'https://teachingtools.dev';
export const EDUAI_API_URL = 'https://yihztkqrfxgvvsovpmfu.supabase.co/functions/v1/eduai-api';
export const EDUAI_AI_PROXY_URL = 'https://yihztkqrfxgvvsovpmfu.supabase.co/functions/v1/eduai-ai';

const DESKTOP_ORIGINS = new Set([
  'https://teachingtools.dev',
  'https://www.teachingtools.dev',
  'https://eduai-desktop.netlify.app',
]);
const BRIDGE_URL = `${EDUAI_SITE}/key-bridge.html`;
const TOKEN_KEY = 'eduai_program_session';
const NAMES_KEY = 'eduai_cached_key_names';
const CACHE_KEY = 'api_cache';
const AI_KEYS = ['OPENAI_API_KEY', 'CLAUDE_API_KEY', 'GEMINI_API_KEY', 'REPLICATE_API_KEY'];
// Fields the desktop sends alongside the keys that are not keys themselves.
const NOT_KEYS = new Set([
  'username', 'isAdmin', 'authToken', 'SUPABASE_URL', 'SUPABASE_ANON_KEY',
  'EDUAI_API_URL', 'EDUAI_AI_PROXY_URL', 'apiKey',
]);

export interface EduaiUser {
  username: string;
  isAdmin: boolean;
}

export type EduaiStatus = 'loading' | 'ready' | 'signed-out';

export interface EduaiState {
  status: EduaiStatus;
  user: EduaiUser | null;
  keys: Record<string, string>;
  source: 'desktop' | 'login' | 'bridge' | 'cache' | null;
  /** Shown to the person when status is 'signed-out'. */
  message: string;
}

type Found = { keys: Record<string, string>; user: EduaiUser };

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let state: EduaiState = { status: 'loading', user: null, keys: {}, source: null, message: '' };
const listeners = new Set<(s: EduaiState) => void>();

function setState(next: EduaiState) {
  state = next;
  listeners.forEach((l) => {
    try {
      l(state);
    } catch {
      /* listener error */
    }
  });
  updateDot();
}

export function getState(): EduaiState {
  return state;
}

export function subscribe(fn: (s: EduaiState) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** An API key by its usual name, e.g. getKey('OPENAI_API_KEY'). Empty string if not loaded. */
export function getKey(name: string): string {
  return state.keys[name] || safeGet(name) || '';
}

export function getUser(): EduaiUser | null {
  return state.user;
}

// ---------------------------------------------------------------------------
// localStorage cache (same names the old site used)
// ---------------------------------------------------------------------------
function safeGet(k: string): string | null {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* storage blocked */
  }
}
function safeRemove(k: string) {
  try {
    localStorage.removeItem(k);
  } catch {
    /* storage blocked */
  }
}

function writeCache({ keys, user }: Found) {
  clearCache();
  safeSet(CACHE_KEY, JSON.stringify({ ...keys, username: user.username, isAdmin: user.isAdmin }));
  for (const [name, value] of Object.entries(keys)) safeSet(name, value);
  for (const name of AI_KEYS) if (keys[name]) safeSet(`VITE_${name}`, keys[name]);
  if (keys.OPENAI_API_KEY) safeSet('openai_api_key', keys.OPENAI_API_KEY);
  safeSet(NAMES_KEY, JSON.stringify(Object.keys(keys)));
}

export function clearCache() {
  let names: string[] = [];
  try {
    names = JSON.parse(safeGet(NAMES_KEY) || '[]');
  } catch {
    names = [];
  }
  for (const name of [...names, ...AI_KEYS]) safeRemove(name);
  for (const name of AI_KEYS) safeRemove(`VITE_${name}`);
  safeRemove(CACHE_KEY);
  safeRemove('openai_api_key');
  safeRemove(NAMES_KEY);
}

function readCache(): Found | null {
  try {
    const c = JSON.parse(safeGet(CACHE_KEY) || 'null');
    if (!c || typeof c !== 'object' || typeof c.username !== 'string' || !c.username) return null;
    const keys: Record<string, string> = {};
    for (const [k, v] of Object.entries(c)) if (!NOT_KEYS.has(k) && typeof v === 'string' && v) keys[k] = v;
    return { keys, user: { username: c.username, isAdmin: !!c.isAdmin } };
  } catch {
    return null;
  }
}

function keysFrom(data: Record<string, unknown>): Record<string, string> {
  const keys: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) if (!NOT_KEYS.has(k) && typeof v === 'string' && v) keys[k] = v;
  return keys;
}

// ---------------------------------------------------------------------------
// teachingtools.dev API
// ---------------------------------------------------------------------------
class EduaiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

async function call<T>(action: string, payload: Record<string, unknown> = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['x-session-token'] = token;
  let res: Response;
  try {
    res = await fetch(EDUAI_API_URL, { method: 'POST', headers, body: JSON.stringify({ action, payload }) });
  } catch {
    throw new EduaiError("Can't reach teachingtools.dev. Check your internet connection and try again.", 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body?.ok) {
    throw new EduaiError(body?.error || `Sign-in service error (${res.status})`, res.status, body?.code);
  }
  return body.data as T;
}

export function inIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

// Source 1: the desktop window this program is open in.
function askDesktop(timeoutMs = 3000): Promise<Found | null> {
  if (!inIframe()) return Promise.resolve(null);
  return new Promise((resolve) => {
    let finished = false;
    const finish = (v: Found | null) => {
      if (finished) return;
      finished = true;
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
      resolve(v);
    };
    const onMessage = (e: MessageEvent) => {
      if (!DESKTOP_ORIGINS.has(e.origin) || e.source !== window.parent) return;
      const d = e.data;
      if (d && d.type === 'API_VALUES_RESPONSE' && d.data && typeof d.data.username === 'string' && d.data.username) {
        finish({ keys: keysFrom(d.data), user: { username: d.data.username, isAdmin: !!d.data.isAdmin } });
      }
    };
    window.addEventListener('message', onMessage);
    const timer = setTimeout(() => finish(null), timeoutMs);
    try {
      window.parent.postMessage({ type: 'REQUEST_API_VALUES' }, '*');
    } catch {
      finish(null);
    }
  });
}

// Source 2: this program's own sign-in.
async function fromOwnSession(): Promise<Found | 'none'> {
  const token = safeGet(TOKEN_KEY);
  if (!token) return 'none';
  try {
    const s = await call<{ user: EduaiUser & { mustChangePassword?: boolean } }>('auth.session', {}, token);
    const keys = await call<Record<string, string>>('keys.get', {}, token);
    return { keys, user: { username: s.user.username, isAdmin: !!s.user.isAdmin } };
  } catch (err) {
    if (err instanceof EduaiError && (err.status === 401 || err.status === 403)) {
      safeRemove(TOKEN_KEY);
      return 'none';
    }
    throw err;
  }
}

// Source 3: the key bridge on teachingtools.dev (same browser sign-in).
function askBridge(timeoutMs = 6000): Promise<Found | 'signed-out' | 'unavailable'> {
  if (!/\.teachingtools\.dev$/.test(location.hostname)) return Promise.resolve('unavailable');
  return new Promise((resolve) => {
    let finished = false;
    const frame = document.createElement('iframe');
    frame.style.display = 'none';
    frame.setAttribute('aria-hidden', 'true');
    frame.title = 'teachingtools.dev sign-in';
    const finish = (v: Found | 'signed-out' | 'unavailable') => {
      if (finished) return;
      finished = true;
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
      frame.remove();
      resolve(v);
    };
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== EDUAI_SITE || e.source !== frame.contentWindow) return;
      const d = e.data;
      if (d?.type === 'EDUAI_BRIDGE_READY') {
        frame.contentWindow?.postMessage({ type: 'EDUAI_KEYS_REQUEST' }, EDUAI_SITE);
      } else if (d?.type === 'EDUAI_KEYS') {
        if (d.signedIn && d.data && typeof d.data.username === 'string') {
          finish({ keys: keysFrom(d.data), user: { username: d.data.username, isAdmin: !!d.data.isAdmin } });
        } else {
          finish(d.reason === 'unavailable' ? 'unavailable' : 'signed-out');
        }
      }
    };
    window.addEventListener('message', onMessage);
    const timer = setTimeout(() => finish('unavailable'), timeoutMs);
    frame.src = BRIDGE_URL;
    (document.body || document.documentElement).appendChild(frame);
  });
}

const SIGNED_OUT_MESSAGE = 'Sign in with your teachingtools.dev account to use the AI features.';

function ready(found: Found, source: EduaiState['source']) {
  writeCache(found);
  setState({ status: 'ready', user: found.user, keys: found.keys, source, message: '' });
}

function signedOut(message = SIGNED_OUT_MESSAGE) {
  clearCache();
  setState({ status: 'signed-out', user: null, keys: {}, source: null, message });
}

let connecting: Promise<EduaiState> | null = null;

/**
 * Find the keys. Call once when the program starts; safe to call again.
 * Resolves with the final state ('ready' or 'signed-out').
 */
export function connect(): Promise<EduaiState> {
  if (!connecting) {
    connecting = (async () => {
      const cached = readCache();
      if (cached && state.status === 'loading') {
        setState({ status: 'loading', user: cached.user, keys: cached.keys, source: 'cache', message: '' });
      }
      const fromDesktop = await askDesktop();
      if (fromDesktop) {
        ready(fromDesktop, 'desktop');
        return state;
      }
      let networkTrouble = false;
      try {
        const own = await fromOwnSession();
        if (own !== 'none') {
          ready(own, 'login');
          return state;
        }
      } catch {
        networkTrouble = true;
      }
      const bridged = await askBridge();
      if (bridged !== 'signed-out' && bridged !== 'unavailable') {
        ready(bridged, 'bridge');
        return state;
      }
      if ((bridged === 'unavailable' || networkTrouble) && cached && !inIframe()) {
        // Can't confirm right now (offline?) — keep using the copy from last time.
        setState({ status: 'ready', user: cached.user, keys: cached.keys, source: 'cache', message: '' });
        return state;
      }
      signedOut();
      return state;
    })().finally(() => {
      connecting = null;
    });
  }
  return connecting;
}

/**
 * Sign in with a teachingtools.dev username and password.
 * Throws an Error with a message suitable for showing to the person.
 */
export async function login(username: string, password: string): Promise<EduaiUser> {
  const r = await call<{ token: string; user: EduaiUser & { mustChangePassword: boolean } }>('auth.login', {
    username: username.trim(),
    password,
  });
  if (r.user.mustChangePassword) {
    await call('auth.logout', {}, r.token).catch(() => {});
    throw new Error('You need to choose a new password first. Sign in at teachingtools.dev to set it, then come back.');
  }
  const keys = await call<Record<string, string>>('keys.get', {}, r.token);
  safeSet(TOKEN_KEY, r.token);
  const user = { username: r.user.username, isAdmin: !!r.user.isAdmin };
  ready({ keys, user }, 'login');
  return user;
}

/** Sign out of this program (and end its own teachingtools.dev session, if it has one). */
export async function logout(): Promise<void> {
  const token = safeGet(TOKEN_KEY);
  safeRemove(TOKEN_KEY);
  if (token) await call('auth.logout', {}, token).catch(() => {});
  signedOut('Signed out.');
}

/** Change the password of the signed-in account (only for this program's own sign-in). */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const token = safeGet(TOKEN_KEY);
  if (!token) {
    throw new Error('Change your password at teachingtools.dev (Start menu → Change Password).');
  }
  await call('auth.changePassword', { currentPassword, newPassword }, token);
}

// The desktop tells open programs to forget their keys when the person signs out there.
if (typeof window !== 'undefined') {
  window.addEventListener('message', (e: MessageEvent) => {
    if (!DESKTOP_ORIGINS.has(e.origin)) return;
    if (e.data && e.data.type === 'CLEAR_API_KEY') signedOut('You signed out of teachingtools.dev.');
  });
}

// ---------------------------------------------------------------------------
// Status dot (top-right corner). Never shows a key.
// ---------------------------------------------------------------------------
let dot: HTMLDivElement | null = null;
let bubble: HTMLDivElement | null = null;

function dotText(): string {
  if (state.status === 'ready') {
    const who = state.user ? ` for ${state.user.username}` : '';
    return Object.keys(state.keys).length ? `AI keys loaded${who}` : `Signed in${who}, but no AI keys are set up yet`;
  }
  if (state.status === 'loading') return 'Connecting to teachingtools.dev…';
  return state.message || SIGNED_OUT_MESSAGE;
}

function updateDot() {
  if (!dot) return;
  const ok = state.status === 'ready' && Object.keys(state.keys).length > 0;
  dot.style.background = ok ? '#22c55e' : state.status === 'loading' ? '#facc15' : '#9ca3af';
  dot.title = dotText();
  dot.setAttribute('aria-label', dotText());
  if (bubble) bubble.textContent = dotText();
}

/** Show the status dot. Call once at start-up. */
export function mountKeyDot() {
  if (typeof document === 'undefined' || dot) return;
  dot = document.createElement('div');
  dot.setAttribute('role', 'status');
  Object.assign(dot.style, {
    position: 'fixed', top: '6px', right: '6px', width: '10px', height: '10px', borderRadius: '50%',
    boxShadow: '0 0 0 2px rgba(255,255,255,.85), 0 1px 3px rgba(0,0,0,.35)', zIndex: '2147483647',
    cursor: 'help', background: '#facc15',
  } as CSSStyleDeclaration);
  dot.addEventListener('click', () => {
    if (bubble) {
      bubble.remove();
      bubble = null;
      return;
    }
    bubble = document.createElement('div');
    Object.assign(bubble.style, {
      position: 'fixed', top: '20px', right: '6px', maxWidth: '260px', padding: '6px 9px', borderRadius: '6px',
      background: '#111827', color: '#fff', font: '12px/1.4 system-ui, sans-serif', zIndex: '2147483647',
      boxShadow: '0 4px 12px rgba(0,0,0,.3)',
    } as CSSStyleDeclaration);
    bubble.textContent = dotText();
    document.body.appendChild(bubble);
    const b = bubble;
    setTimeout(() => {
      if (bubble === b) {
        b.remove();
        bubble = null;
      }
    }, 4000);
  });
  const attach = () => document.body.appendChild(dot!);
  if (document.body) attach();
  else window.addEventListener('DOMContentLoaded', attach, { once: true });
  updateDot();
}
