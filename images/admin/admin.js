import { groups, products } from '../catalogue.js';

const signin = document.querySelector('#signin');
const dashboard = document.querySelector('#dashboard');
const logout = document.querySelector('#logout');
const loginStatus = document.querySelector('#login-status');
const settingsForm = document.querySelector('#settings-form');
const productList = document.querySelector('#product-list');
const search = document.querySelector('#product-search');
const orderList = document.querySelector('#order-list');
const number = new Intl.NumberFormat('ar-MA-u-nu-latn');
const date = new Intl.DateTimeFormat('ar-MA-u-nu-latn', { dateStyle: 'medium', timeZone: 'Africa/Casablanca' });
const states = { prepared: 'مجهّز', confirmed: 'مؤكّد', cancelled: 'ملغى' };
const errors = {
  not_configured: 'خاص يتضبط سر ADMIN_PASSWORD فإعدادات Cloudflare قبل تسجيل الدخول.',
  unauthorized: 'كلمة المرور غير صحيحة أو انتهت الجلسة.',
  rate_limit: 'محاولات كثيرة. عاود المحاولة من بعد.',
  invalid: 'راجع القيم اللي دخلتي وحاول من جديد.',
};
let data;

function escape(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

async function api(route, payload) {
  const options = payload === undefined ? undefined : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };
  const response = await fetch(`/api/admin/${route}`, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

function showSignin(message = '') {
  signin.hidden = false;
  dashboard.hidden = true;
  logout.hidden = true;
  loginStatus.textContent = message;
  data = undefined;
}

function renderStats() {
  const { visits, totals } = data;
  const counts = [
    ['مشاهدات خلال آخر 30 يومًا', number.format(visits.filter(row => Date.parse(row.day) > Date.now() - 30 * 86400000).reduce((sum, row) => sum + row.count, 0))],
    ['طلبات تجهّزات', number.format(totals.prepared)],
    ['طلبات مؤكّدة', number.format(totals.confirmed)],
    ['قيمة الطلبات المؤكّدة', `${number.format(totals.amount)} درهم`],
  ];
  document.querySelector('#stats').innerHTML = counts.map(([label, value]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
  document.querySelector('#visits').innerHTML = visits.length
    ? `<h3>المشاهدات حسب اليوم</h3><ul>${visits.map(row => `<li>${date.format(new Date(row.day))} · ${number.format(row.count)}</li>`).join('')}</ul>`
    : '<p class="note">ما تسجّلات حتى مشاهدة بعد.</p>';
}

function renderProducts() {
  const query = search.value.trim().toLowerCase();
  const filtered = products.map(product => ({ ...product, ...data.products[product.id] }))
    .filter(product => `${product.id} ${product.name} ${product.category}`.toLowerCase().includes(query));
  productList.innerHTML = filtered.map(product => `
    <form class="product-row" data-product="${product.id}">
      <img src="/${product.image}" alt="" loading="lazy">
      <label>اسم المنتج <input name="name" required maxlength="120" value="${escape(product.name)}"></label>
      <label>القسم <select name="category">${Object.keys(groups).map(category => `<option ${category === product.category ? 'selected' : ''}>${category}</option>`).join('')}</select></label>
      <label>الثمن بالدرهم <input name="price" type="number" min="1" max="100000" required value="${product.price}"></label>
      <label class="check"><input name="hidden" type="checkbox" ${product.hidden ? 'checked' : ''}> إخفاء</label>
      <button>حفظ</button>
      <p role="status"></p>
    </form>
  `).join('') || '<p>ما كاين حتى منتج مطابق.</p>';
}

function renderOrders() {
  orderList.innerHTML = data.orders.map(order => `
    <article class="order">
      <p><code>${escape(order.id)}</code> · ${date.format(new Date(order.created))} · ${number.format(order.total)} درهم</p>
      <ul>${order.items.map(item => `<li>${number.format(item.quantity)} × ${escape(item.name)}</li>`).join('')}</ul>
      <form data-order="${escape(order.id)}">
        <label>الحالة <select name="status">${Object.entries(states).map(([key, label]) => `<option value="${key}" ${order.status === key ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
        <button>حفظ الحالة</button><p role="status"></p>
      </form>
    </article>
  `).join('') || '<p>ما كاينينش طلبات مسجّلة بعد.</p>';
}

async function loadDashboard() {
  data = await api('data');
  for (const [key, value] of Object.entries(data.settings)) {
    const field = settingsForm.elements.namedItem(key);
    if (field.type === 'checkbox') field.checked = value;
    else field.value = value;
  }
  renderStats();
  renderProducts();
  renderOrders();
  signin.hidden = true;
  dashboard.hidden = false;
  logout.hidden = false;
}

async function save(form, route, payload, onSave) {
  const button = form.querySelector('button');
  const status = form.querySelector('[role=status]');
  button.disabled = true;
  status.textContent = 'جاري الحفظ…';
  try {
    await api(route, payload);
    await onSave?.();
    status.textContent = 'تحفظ التغيير.';
  } catch (error) {
    if (error.message === 'unauthorized') showSignin(errors.unauthorized);
    else status.textContent = errors[error.message] ?? 'تعذّر الحفظ. حاولي من جديد.';
  } finally {
    button.disabled = false;
  }
}

document.querySelector('#login').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.target;
  const password = form.elements.password.value;
  form.reset();
  const button = form.querySelector('button');
  button.disabled = true;
  try {
    await api('login', { password });
    await loadDashboard();
  } catch (error) {
    showSignin(errors[error.message] ?? 'تعذّر الاتصال بلوحة الإدارة.');
  } finally {
    button.disabled = false;
  }
});

logout.addEventListener('click', async () => {
  try {
    await api('logout', {});
    showSignin();
  } catch {
    logout.textContent = 'تعذّر الخروج، عاودي المحاولة';
  }
});

settingsForm.addEventListener('submit', event => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(settingsForm));
  payload.ordering = settingsForm.elements.ordering.checked;
  save(settingsForm, 'settings', payload);
});

search.addEventListener('input', renderProducts);
productList.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const payload = Object.fromEntries(new FormData(form));
  const id = Number(form.dataset.product);
  Object.assign(payload, { id, price: Number(payload.price), hidden: form.elements.hidden.checked });
  save(form, 'product', payload, () => { data.products[id] = payload; });
});

orderList.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  save(form, 'order-status', { id: form.dataset.order, status: form.elements.status.value }, async () => {
    data = await api('data');
    renderStats();
  });
});

loadDashboard().catch(error => showSignin(error.message === 'unauthorized' ? '' : 'تعذّر الاتصال بلوحة الإدارة.'));
