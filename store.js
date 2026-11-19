import { groups, products as originalProducts } from './images/catalogue.js';

const products = originalProducts.map(product => ({ ...product }));
const featured = [33, 14, 45, 40, 31, 32, 28, 39];
products.sort((a, b) => {
  const rank = ({ id }) => featured.includes(id) ? featured.indexOf(id) : featured.length + id;
  return rank(a) - rank(b);
});

// Width, height, and vertical bounds of the catalogue photo inside each source.
const photoBounds = [
  [720, 1612, 397, 1235],
  [720, 1291, 340, 1291],
  [720, 1612, 184, 1515],
  [720, 1612, 396, 1238],
  [720, 1612, 292, 1303],
  [720, 1612, 303, 1292],
  [720, 1612, 299, 1272],
  [720, 1612, 327, 1285],
  [720, 1612, 247, 1326],
  [720, 1612, 289, 1319],
  [720, 1612, 289, 1300],
  [720, 1612, 184, 1425],
  [720, 1612, 265, 1273],
  [714, 1599, 350, 1249],
  [720, 1612, 323, 1289],
  [714, 1599, 335, 1264],
  [720, 1612, 315, 1281],
  [720, 1612, 447, 1165],
  [720, 1521, 0, 1521],
  [720, 1467, 0, 1467],
  [720, 1612, 0, 1612],
  [714, 1599, 300, 1303],
  [720, 1612, 327, 1285],
  [720, 1407, 316, 1274],
  [720, 1612, 323, 1289],
  [720, 1443, 0, 1443],
  [720, 1612, 0, 1612],
  [714, 1599, 361, 1238],
  [714, 1599, 320, 1279],
  [720, 1612, 521, 1479],
  [720, 1612, 347, 1265],
  [720, 1612, 0, 1612],
  [714, 1599, 329, 1270],
  [720, 1612, 478, 1134],
  [720, 1612, 327, 1285],
  [720, 1612, 327, 1285],
  [720, 1612, 327, 1285],
  [720, 1612, 327, 1285],
  [720, 1612, 327, 1285],
  [720, 1612, 184, 1449],
  [720, 1612, 327, 1285],
  [720, 1612, 327, 1285],
  [720, 1612, 327, 1285],
  [720, 1612, 323, 1289],
  [720, 1612, 327, 1285],
];

// Tighter product crops for the featured photos and taller catalogue artwork.
const cardCrops = {
  3: [82, 370, 570, 880],
  19: [0, 50, 720, 600],
  20: [0, 198, 720, 625],
  21: [0, 310, 720, 835],
  22: [0, 715, 714, 508],
  27: [0, 390, 720, 655],
  28: [0, 540, 714, 650],
  31: [0, 515, 720, 710],
  32: [0, 244, 720, 647],
  40: [0, 474, 720, 818],
};

// Use one studio crop per featured product in both the card and the detail view.
const studioCrops = {
  14: [311, 48, 365, 870],
  33: [669, 172, 230, 741],
  45: [891, 372, 425, 550],
};

function renderPhoto(product, detail = false) {
  const { id, name, image } = product;
  const [sourceWidth, sourceHeight, top, bottom] = photoBounds[id - 1];
  const studio = studioCrops[id];
  const originalCrop = (!detail && cardCrops[id]) || [0, top, sourceWidth, bottom - top];
  const [x, y, width, height] = studio || originalCrop;
  const percent = (part, whole) => `${(part / whole) * 100}%`;
  return `<span class="product-frame" style="--ratio:${width / height}">
    <img src="${studio ? 'images/hero.webp' : image}" alt="${detail ? safe(name) : ''}" ${detail ? '' : 'loading="lazy"'} decoding="async"
      style="width:${percent(studio ? 1536 : sourceWidth, width)}; height:${percent(studio ? 1024 : sourceHeight, height)}; left:-${percent(x, width)}; top:-${percent(y, height)}">
  </span>`;
}

const filters = document.querySelector('#filters');
const grid = document.querySelector('#products');
const count = document.querySelector('#count');
const search = document.querySelector('#search');
const resultCount = document.querySelector('#result-count');
const dialog = document.querySelector('#dialog');
const title = document.querySelector('#dialog-title');
const body = document.querySelector('#dialog-body');
const openCart = document.querySelector('#open-cart');
let businessWhatsApp = '';
let storeName = 'عزيزة ستور';
let ordering = true;
const demoWhatsApp = '12025550147'; // Reserved fictional number.

const storageKey = 'aziza-cart';
const maxQuantity = 99;
const cart = new Map();
try {
  const stored = JSON.parse(localStorage.getItem(storageKey));
  const previousSelection = stored === null ? JSON.parse(localStorage.getItem('aziza-selection')) : null;
  for (const { id } of products) {
    const quantity = stored?.[id] ?? Number(Array.isArray(previousSelection) && previousSelection.includes(id));
    if (Number.isInteger(quantity) && quantity > 0) cart.set(id, Math.min(quantity, maxQuantity));
  }
} catch {
  // The cart remains available for the current page if storage is unavailable.
}
const allCategories = 'الكل';
const number = new Intl.NumberFormat('ar-MA-u-nu-latn');
const safe = value => String(value).replace(/[&<>"']/g, char => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
));
const formatPrice = price => `${number.format(price)} درهم`;
const plurals = new Intl.PluralRules('ar');
const productCounts = {
  one: 'منتج واحد',
  two: 'منتجان',
  few: '{count} منتجات',
  many: '{count} منتجًا',
  other: '{count} منتج',
};
let category = allCategories;

function normalize(value) {
  return value
    .normalize('NFKD')
    .replace(/[\p{Mark}ـ]/gu, '')
    .replace(/[ٱآأإ]/gu, 'ا')
    .replace(/ى/gu, 'ي')
    .toLowerCase()
    .trim();
}

function updateCartCount() {
  const quantity = [...cart.values()].reduce((total, units) => total + units, 0);
  count.textContent = number.format(quantity);
  for (const button of grid.querySelectorAll('[data-add]')) {
    button.disabled = cart.get(Number(button.dataset.add)) === maxQuantity;
  }
}

function changeQuantity(id, delta) {
  const quantity = Math.min((cart.get(id) ?? 0) + delta, maxQuantity);
  if (quantity > 0) cart.set(id, quantity);
  else cart.delete(id);
  try {
    localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(cart)));
  } catch {
    // The current page still retains the cart.
  }
  updateCartCount();
}

function renderProducts() {
  const query = normalize(search.value);
  const visible = products.filter(product =>
    (!product.hidden && (category === allCategories || product.category === category))
    && normalize(`${product.name} ${product.category}`).includes(query),
  );
  resultCount.textContent = visible.length
    ? productCounts[plurals.select(visible.length)].replace('{count}', number.format(visible.length))
    : 'لا توجد منتجات مطابقة للبحث.';
  grid.innerHTML = visible.map(product => {
    const { id, name, category, price } = product;
    return `
      <article class="card">
        <button class="photo" data-detail="${id}" aria-label="عرض صورة ${safe(name)}" aria-haspopup="dialog">
          ${renderPhoto(product)}
          <span class="card-category">${category}</span>
        </button>
        <div class="card-copy">
          <h3>${safe(name)}</h3>
          <p class="price">${formatPrice(price)}</p>
          <div class="card-actions">
            <button class="details" data-detail="${id}" aria-label="تفاصيل ${safe(name)}" aria-haspopup="dialog">عرض التفاصيل <span class="arrow" aria-hidden="true"></span></button>
            <button class="add" data-add="${id}" aria-label="إضافة ${safe(name)} إلى السلة">+</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
  updateCartCount();
}

function selectCategory(label) {
  category = label;
  for (const button of filters.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', button.textContent === label);
  }
  renderProducts();
}

for (const label of [allCategories, ...Object.keys(groups)]) {
  const button = document.createElement('button');
  button.textContent = label;
  button.setAttribute('aria-pressed', label === category);
  button.addEventListener('click', () => selectCategory(label));
  filters.append(button);
}

for (const link of document.querySelectorAll('a[data-category]')) {
  link.addEventListener('click', () => {
    search.value = '';
    selectCategory(link.dataset.category);
  });
}

for (const frame of document.querySelectorAll('.collection-image')) {
  const product = products.find(item => item.id === Number(frame.dataset.product));
  frame.innerHTML = renderPhoto(product);
}

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.15 });

  for (const section of document.querySelectorAll('[data-reveal]')) observer.observe(section);
}

function renderDetail(product) {
  dialog.classList.add('product-dialog');
  dialog.setAttribute('aria-labelledby', 'product-dialog-title');
  body.innerHTML = `
    <div class="detail-layout">
      <div class="detail-photo">${renderPhoto(product, true)}</div>
      <div class="detail-copy">
        <p class="detail-category">${product.category}</p>
        <h2 id="product-dialog-title">${safe(product.name)}</h2>
        <p class="price">${formatPrice(product.price)}</p>
        <button class="button" data-add="${product.id}" ${cart.get(product.id) === maxQuantity ? 'disabled' : ''}>إضافة إلى السلة</button>
        <p class="detail-status" aria-live="polite"></p>
      </div>
    </div>
  `;
}

function renderCart() {
  dialog.classList.remove('product-dialog');
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  title.textContent = 'السلة';
  const items = products.filter(product => cart.has(product.id));
  if (!items.length) {
    body.innerHTML = '<p>السلة فارغة.</p>';
    return;
  }

  const total = cartTotal();
  body.innerHTML = `
    <ul class="cart-list">
      ${items.map(({ id, name, price }) => {
        const quantity = cart.get(id);
        return `<li>
          <div><strong>${safe(name)}</strong><div class="price">${formatPrice(price * quantity)}</div></div>
          <div class="cart-quantity" role="group" aria-label="كمية ${safe(name)}">
            <button data-cart-id="${id}" data-delta="-1" aria-label="${quantity === 1 ? 'إزالة' : 'إنقاص كمية'} ${safe(name)}">−</button>
            <span aria-live="polite">${number.format(quantity)}</span>
            <button data-cart-id="${id}" data-delta="1" aria-label="زيادة كمية ${safe(name)}" ${quantity === maxQuantity ? 'disabled' : ''}>+</button>
          </div>
        </li>`;
      }).join('')}
    </ul>
    <p class="cart-total"><strong>مجموع المنتجات</strong><strong class="price">${formatPrice(total)}</strong></p>
    ${ordering
      ? '<button class="button checkout-next" data-checkout>متابعة الطلب</button>'
      : '<p>الطلبات موقوفة مؤقتًا.</p>'}
  `;
}

function cartTotal() {
  return products.reduce((sum, { id, price }) => sum + price * (cart.get(id) ?? 0), 0);
}

function renderCheckout() {
  title.textContent = 'معلومات التوصيل';
  body.innerHTML = `
    <form id="checkout-form" class="checkout-form">
      <p class="cart-total"><strong>مجموع المنتجات</strong><strong class="price">${formatPrice(cartTotal())}</strong></p>
      <label for="customer-name">الاسم الكامل</label>
      <input id="customer-name" name="name" autocomplete="name" required maxlength="100">
      <label for="customer-phone">رقم الهاتف</label>
      <input id="customer-phone" name="phone" type="tel" inputmode="tel" dir="ltr" autocomplete="tel" required maxlength="25">
      <label for="customer-city">المدينة</label>
      <input id="customer-city" name="city" autocomplete="address-level2" required maxlength="80">
      <label for="customer-address">عنوان التوصيل</label>
      <textarea id="customer-address" name="address" autocomplete="street-address" rows="2" required maxlength="300"></textarea>
      <p class="checkout-note">غادي يتحل واتساب برسالة فيها الطلب ومعلومات التوصيل. راجع الرسالة واضغط على إرسال باش يوصل الطلب للمتجر.</p>
      ${businessWhatsApp ? '' : '<p class="checkout-status">وضع التجربة: رقم واتساب وهمي. استعمل معلومات وهمية، حيت المتجر ما غاديش يتوصل بالطلب.</p>'}
      <button type="submit" class="button">${businessWhatsApp ? 'تأكيد الطلب عبر واتساب' : 'جرّب الطلب عبر واتساب'}</button>
      <button type="button" class="checkout-back" data-back-cart>رجوع للسلة</button>
      <p class="checkout-status" aria-live="polite"></p>
    </form>
  `;
  body.querySelector('#customer-name').focus();
}

function customerPhone(value) {
  return value
    .replace(/[٠-٩]/gu, digit => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
    .replace(/[۰-۹]/gu, digit => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
    .replace(/[\s().-]/gu, '');
}

body.addEventListener('submit', async event => {
  if (event.target.id !== 'checkout-form') return;
  event.preventDefault();
  if (!cart.size || !ordering) return;

  const form = event.target;
  const fields = new FormData(form);
  const name = fields.get('name').trim();
  const phone = customerPhone(fields.get('phone'));
  const city = fields.get('city').trim();
  const address = fields.get('address').trim();
  const status = form.querySelector('[aria-live]');
  if (!name || !city || !address || !/^\+?[0-9]{7,15}$/.test(phone)) {
    status.textContent = 'تأكد من الاسم ورقم الهاتف والمدينة وعنوان التوصيل.';
    return;
  }

  let items = products.filter(({ id }) => cart.has(id)).map(({ id, name, price }) => ({ id, name, price, quantity: cart.get(id) }));
  let total = cartTotal();
  let whatsapp = demoWhatsApp;
  let orderId = '';
  if (businessWhatsApp) {
    form.dataset.orderId ||= crypto.randomUUID();
    event.submitter.disabled = true;
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: form.dataset.orderId, items: items.map(({ id, quantity }) => ({ id, quantity })) }),
      });
      if (!response.ok) throw new Error('order unavailable');
      ({ id: orderId, items, total, whatsapp } = await response.json());
    } catch {
      status.textContent = 'تعذّر تجهيز الطلب. حدّثي الصفحة وحاولي من جديد.';
      return;
    } finally {
      event.submitter.disabled = false;
    }
  }
  const lines = items.map(({ name, price, quantity }) => `• ${quantity} × ${name} — ${formatPrice(price * quantity)}`);
  const message = [
    `السلام عليكم، بغيت نأكد هاد الطلب من ${storeName}.`,
    '',
    ...(orderId ? [`رقم الطلب: ${orderId}`] : []),
    ...lines,
    `مجموع المنتجات: ${formatPrice(total)}`,
    '',
    `الاسم: ${name}`,
    `الهاتف: ${phone}`,
    `المدينة: ${city}`,
    `عنوان التوصيل: ${address}`,
  ].join('\n');
  const link = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
  if (!orderId) {
    window.open(link, '_blank', 'noopener,noreferrer');
    return;
  }
  const whatsappLink = document.createElement('a');
  whatsappLink.className = 'button';
  whatsappLink.href = link;
  whatsappLink.target = '_blank';
  whatsappLink.rel = 'noopener noreferrer';
  whatsappLink.textContent = 'افتحي واتساب وأرسلي الطلب';
  event.submitter.replaceWith(whatsappLink);
  whatsappLink.focus();
});

search.addEventListener('input', renderProducts);
grid.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.add) {
    changeQuantity(Number(button.dataset.add), 1);
  } else {
    renderDetail(products.find(product => product.id === Number(button.dataset.detail)));
    dialog.showModal();
  }
});
openCart.addEventListener('click', () => {
  renderCart();
  dialog.showModal();
});
body.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.add) {
    const id = Number(button.dataset.add);
    changeQuantity(id, 1);
    button.disabled = cart.get(id) === maxQuantity;
    body.querySelector('.detail-status').textContent = `الكمية في السلة ${number.format(cart.get(id))}`;
    return;
  }
  if (button.hasAttribute('data-checkout')) {
    renderCheckout();
    return;
  }
  if (button.hasAttribute('data-back-cart')) {
    renderCart();
    body.querySelector('[data-checkout]').focus();
    return;
  }
  const { cartId, delta } = button.dataset;
  if (!cartId) return;
  changeQuantity(Number(cartId), Number(delta));
  renderCart();
  const matchingButton = body.querySelector(`[data-cart-id="${cartId}"][data-delta="${delta}"]:enabled`);
  (matchingButton || body.querySelector('button:enabled') || dialog.querySelector('.close')).focus();
});

renderProducts();

async function loadStore() {
  try {
    const response = await fetch('/api/store');
    if (!response.ok) return;
    const { settings, products: overrides } = await response.json();
    if (!settings || !overrides) return;
    for (const product of products) {
      Object.assign(product, overrides[product.id]);
      if (product.hidden) cart.delete(product.id);
    }
    businessWhatsApp = settings.whatsapp;
    storeName = settings.name;
    document.querySelector('[data-store-name]').textContent = storeName;
    ordering = settings.ordering;
    document.querySelector('#faq-demo').hidden = Boolean(businessWhatsApp);
    document.title = `${settings.name} | العناية والجمال`;
    document.querySelector('.hero-copy h1').firstChild.textContent = `${settings.headline} `;
    document.querySelector('.hero-copy h1 em').textContent = settings.emphasis;
    document.querySelector('.hero-copy > p:not(.eyebrow)').textContent = settings.description;
    document.querySelectorAll('.wordmark').forEach(mark => {
      if (settings.name !== 'عزيزة ستور') mark.textContent = settings.name;
    });
    renderProducts();
    fetch('/api/visit', { method: 'POST', keepalive: true }).catch(() => {});
  } catch {
    // Keep the bundled catalogue usable when the service is unavailable.
  }
}
loadStore();
