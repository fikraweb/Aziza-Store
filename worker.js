import { DurableObject } from 'cloudflare:workers';
import { groups, products } from './images/catalogue.js';

const catalogue = new Map(products.map(product => [product.id, product]));
const categories = Object.keys(groups);
const previousCatalogueNames = new Map([
  [1, 'مستحضر في علبة بملصق أخضر'],
  [2, 'مجموعة للعناية'],
  [3, 'مستحضرات عناية بعبوات ذات مضخّة'],
  [4, 'مستحضر في علبة بملصق أزرق'],
  [5, 'مستحضر في علبة بملصق ذهبي'],
  [6, 'مستحضر في علبة بملصق وردي'],
  [7, 'مستحضر في علبة بملصق فاتح'],
  [8, 'عناية للوجه في قارورة'],
  [9, 'مستحضر في علبة بملصق بيج'],
  [10, 'مستحضر في علبة بملصق بنفسجي'],
  [11, 'مستحضر في علبة بملصق زيتوني'],
  [12, 'تشكيلة مستحضرات عناية في علب'],
  [13, 'مستحضر في علبة بملصق أصفر'],
  [15, 'عبوتان للعناية'],
  [16, 'تشكيلة عبوات ملوّنة'],
  [17, 'علبة هدايا للعناية'],
  [18, 'مستحضر عناية بالشعر في أنبوب'],
  [19, 'تشكيلة علب للعناية'],
  [20, 'مقشّرات للوجه'],
  [21, 'مجموعة للعناية بالشعر'],
  [23, 'كريم للعناية'],
  [24, 'مستحضرات عناية بالجسم في علب'],
  [25, 'طقم عناية في علبة'],
  [26, 'صابون بالليمون'],
  [27, 'كريمات ومنتجات للعناية بالوجه'],
  [28, 'مجموعة للعناية بالجسم'],
  [29, 'مختارات من مستحضرات العناية في علب'],
  [30, 'مستحضر عناية بالشعر في قارورة'],
  [31, 'عبوات عناية بمضخّة'],
  [32, 'أقنعة للوجه'],
  [33, 'زيت الورد روز بريز'],
  [34, 'تشكيلة مستحضرات عناية معطّرة'],
  [35, 'زيت عناية بملصق زيتوني'],
  [36, 'زيت عناية بملصق أصفر'],
  [37, 'زيت عناية بملصق وردي'],
  [38, 'زيت عناية بملصق أخضر'],
  [39, 'قارورة روماتيكس'],
  [40, 'مقشّرات للوجه والجسم'],
  [41, 'زيت عناية بملصق ذهبي'],
  [42, 'زيت عناية بملصق أزرق'],
  [43, 'زيت عناية بملصق بيج'],
  [44, 'مستحضرات عناية في عبوات وعلب'],
  [45, 'مورّد الخدود بالعكر الفاسي'],
]);
const defaults = {
  name: 'عزيزة ستور',
  headline: 'عناية تليق',
  emphasis: 'بكِ',
  description: 'زيوت وأقنعة ومنتجات عناية لتختاري منها ما يناسبكِ كل يوم.',
  whatsapp: '',
  ordering: true,
};
const encoder = new TextEncoder();
const sessionLifetime = 8 * 60 * 60;

function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

function hex(buffer) {
  return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function sessionKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function signedIn(request, secret) {
  if (!secret || secret.length < 16) return false;
  const match = request.headers.get('Cookie')?.match(/(?:^|;\s*)aziza_admin=(\d{10,12})\.([a-f0-9]{32})\.([a-f0-9]{64})(?:;|$)/);
  if (!match || Number(match[1]) <= Date.now() / 1000) return false;
  const bytes = Uint8Array.from(match[3].match(/../g), pair => parseInt(pair, 16));
  return crypto.subtle.verify('HMAC', await sessionKey(secret), bytes, encoder.encode(`${match[1]}.${match[2]}`));
}

function checkSecret(candidate, secret) {
  const key = encoder.encode(secret);
  return crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']).then(async imported => {
    const signature = await crypto.subtle.sign('HMAC', imported, key);
    return crypto.subtle.verify('HMAC', imported, signature, encoder.encode(candidate));
  });
}

async function readJSON(request) {
  const raw = await request.text();
  if (raw.length > 16_384) throw new Error('large request');
  return JSON.parse(raw);
}

function cleanText(value, max) {
  return typeof value === 'string' && value.trim() && value.trim().length <= max ? value.trim() : null;
}

function validateSettings(data) {
  const name = cleanText(data?.name, 60);
  const headline = cleanText(data?.headline, 70);
  const emphasis = cleanText(data?.emphasis, 35);
  const description = cleanText(data?.description, 240);
  const whatsapp = data?.whatsapp;
  if (!name || !headline || !emphasis || !description || typeof whatsapp !== 'string'
      || !/^(?:[1-9][0-9]{7,14})?$/.test(whatsapp) || typeof data.ordering !== 'boolean') return null;
  return { name, headline, emphasis, description, whatsapp, ordering: data.ordering };
}

export class StoreData extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.db = ctx.storage.sql;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS visits (day TEXT PRIMARY KEY, count INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, created TEXT NOT NULL, items TEXT NOT NULL, total INTEGER NOT NULL, status TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS login_limits (ip TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires INTEGER NOT NULL);
    `);
    ctx.storage.transactionSync(() => {
      if (this.get('catalogue-names-v2', false)) return;
      const overrides = this.get('products', {});
      for (const [id, previousName] of previousCatalogueNames) {
        // Price-only edits used to save a copy of the old catalogue name.
        if (overrides[id]?.name === previousName) delete overrides[id].name;
      }
      this.set('products', overrides);
      this.set('catalogue-names-v2', true);
    });
  }

  get(key, fallback) {
    const row = this.db.exec('SELECT value FROM config WHERE key = ?', key).toArray()[0];
    return row ? JSON.parse(row.value) : fallback;
  }

  set(key, value) {
    this.db.exec('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)', key, JSON.stringify(value));
  }

  async fetch(request) {
    const path = new URL(request.url).pathname;
    const data = request.method === 'POST' ? await request.json() : null;
    if (path === '/limit') {
      const { key, max } = data;
      const now = Date.now();
      this.db.exec('DELETE FROM login_limits WHERE expires <= ?', now);
      const row = this.db.exec('SELECT attempts FROM login_limits WHERE ip = ?', key).toArray()[0];
      if (row?.attempts >= max) return json({ error: 'rate_limit' }, 429);
      this.db.exec('INSERT INTO login_limits VALUES (?, 1, ?) ON CONFLICT(ip) DO UPDATE SET attempts = attempts + 1', key, now + 900_000);
      return json({ ok: true });
    }

    const settings = this.get('settings', defaults);
    const overrides = this.get('products', {});
    if (path === '/state') return json({ settings, products: overrides });
    if (path === '/visit') {
      const day = new Date().toISOString().slice(0, 10);
      this.db.exec('INSERT INTO visits VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET count = count + 1', day);
      return json({ ok: true });
    }
    if (path === '/order') {
      if (!settings.ordering || !settings.whatsapp) return json({ error: 'orders_unavailable' }, 409);
      if (!/^[0-9a-f-]{36}$/.test(data?.id) || !Array.isArray(data.items) || !data.items.length || data.items.length > catalogue.size) return json({ error: 'invalid' }, 400);
      const seen = new Set();
      const items = [];
      for (const item of data.items) {
        const { id, quantity } = item ?? {};
        const base = catalogue.get(id);
        const saved = overrides[id];
        if (!base || seen.has(id) || saved?.hidden || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return json({ error: 'invalid' }, 400);
        seen.add(id);
        items.push({ id, quantity, name: saved?.name ?? base.name, price: saved?.price ?? base.price });
      }
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      this.db.exec("INSERT OR IGNORE INTO orders VALUES (?, ?, ?, ?, 'prepared')", data.id, new Date().toISOString(), JSON.stringify(items), total);
      const order = this.db.exec('SELECT id, items, total FROM orders WHERE id = ?', data.id).one();
      return json({ ...order, items: JSON.parse(order.items), whatsapp: settings.whatsapp });
    }
    if (path === '/admin-data') {
      const visits = this.db.exec('SELECT day, count FROM visits ORDER BY day DESC LIMIT 30').toArray();
      const orders = this.db.exec('SELECT * FROM orders ORDER BY created DESC LIMIT 100').toArray().map(order => ({ ...order, items: JSON.parse(order.items) }));
      const totals = this.db.exec("SELECT COUNT(*) AS prepared, COALESCE(SUM(status = 'confirmed'), 0) AS confirmed, COALESCE(SUM(CASE WHEN status = 'confirmed' THEN total END), 0) AS amount FROM orders").one();
      return json({ settings, products: overrides, visits, orders, totals });
    }
    if (path === '/settings') {
      const validated = validateSettings(data);
      if (!validated) return json({ error: 'invalid' }, 400);
      this.set('settings', validated);
      return json({ ok: true });
    }
    if (path === '/product') {
      const base = catalogue.get(data?.id);
      const name = cleanText(data?.name, 120);
      if (!base || !name || !categories.includes(data.category) || !Number.isInteger(data.price) || data.price < 1 || data.price > 100000 || typeof data.hidden !== 'boolean') return json({ error: 'invalid' }, 400);
      const { id, category, price, hidden } = data;
      const saved = { category, price, hidden };
      if (name !== base.name) saved.name = name;
      this.set('products', { ...overrides, [id]: saved });
      return json({ ok: true });
    }
    if (path === '/order-status') {
      const { id, status } = data ?? {};
      if (!['prepared', 'confirmed', 'cancelled'].includes(status) || typeof id !== 'string') return json({ error: 'invalid' }, 400);
      if (!this.db.exec('SELECT 1 FROM orders WHERE id = ?', id).toArray().length) return json({ error: 'not_found' }, 404);
      this.db.exec('UPDATE orders SET status = ? WHERE id = ?', status, id);
      return json({ ok: true });
    }
    return json({ error: 'not_found' }, 404);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === '/admin' || path === '/admin/') {
      return env.ASSETS.fetch(new URL('/images/admin/', url));
    }
    if (!path.startsWith('/api/')) return env.ASSETS.fetch(request);

    const isPost = request.method === 'POST';
    if (isPost && request.headers.get('Origin') !== url.origin) return json({ error: 'origin' }, 403);
    const stub = env.STORE.getByName('aziza');
    const run = (route, data) => stub.fetch(`https://store.internal${route}`, data ? { method: 'POST', body: JSON.stringify(data) } : undefined);

    const rateLimit = async (action, max) => {
      const ip = request.headers.get('CF-Connecting-IP') || 'local';
      const key = hex(await crypto.subtle.digest('SHA-256', encoder.encode(`${action}:${ip}`)));
      return run('/limit', { key, max });
    };
    try {
      if (path === '/api/store' && request.method === 'GET') return await run('/state');
      if (path === '/api/visit' && isPost) return await run('/visit');
      if (path === '/api/order' && isPost) {
        const limit = await rateLimit('order', 30);
        if (!limit.ok) return limit;
        return await run('/order', await readJSON(request));
      }
      if (!path.startsWith('/api/admin/')) return json({ error: 'not_found' }, 404);

      const secret = env.ADMIN_PASSWORD;
      const cookieFlags = '; Path=/; HttpOnly; Secure; SameSite=Strict';
      if (path === '/api/admin/login' && isPost) {
        if (!secret || secret.length < 16) return json({ error: 'not_configured' }, 503);
        const limit = await rateLimit('login', 8);
        if (!limit.ok) return limit;
        const { password } = await readJSON(request);
        if (typeof password !== 'string' || !(await checkSecret(password, secret))) return json({ error: 'unauthorized' }, 401);
        const payload = `${Math.floor(Date.now() / 1000) + sessionLifetime}.${crypto.randomUUID().replaceAll('-', '')}`;
        const signature = hex(await crypto.subtle.sign('HMAC', await sessionKey(secret), encoder.encode(payload)));
        return json({ ok: true }, 200, { 'Set-Cookie': `aziza_admin=${payload}.${signature}; Max-Age=${sessionLifetime}${cookieFlags}` });
      }
      if (!(await signedIn(request, secret))) return json({ error: 'unauthorized' }, 401);
      if (path === '/api/admin/logout' && isPost) return json({ ok: true }, 200, { 'Set-Cookie': `aziza_admin=; Max-Age=0${cookieFlags}` });
      if (path === '/api/admin/data' && request.method === 'GET') return await run('/admin-data');
      const route = path.slice('/api/admin'.length);
      if (isPost && ['/settings', '/product', '/order-status'].includes(route)) return await run(route, await readJSON(request));
      return json({ error: 'not_found' }, 404);
    } catch (error) {
      if (error instanceof SyntaxError || error.message === 'large request') return json({ error: 'invalid' }, 400);
      console.error(error);
      return json({ error: 'server' }, 500);
    }
  },
};
