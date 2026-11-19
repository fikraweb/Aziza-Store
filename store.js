const groups = {
  'الوجه': [
    [8, 'عناية للوجه في قارورة', 45],
    [20, 'مقشّرات للوجه', 45],
    [23, 'كريم للعناية', 40],
    [26, 'صابون بالليمون', 15],
    [27, 'كريمات ومنتجات للعناية بالوجه', 50],
    [32, 'أقنعة للوجه', 40],
    [33, 'زيت الورد روز بريز', 55],
    [45, 'مورّد الخدود بالعكر الفاسي', 30],
    [40, 'مقشّرات للوجه والجسم', 50],
  ],
  'الجسم': [
    [2, 'مجموعة للعناية', 75],
    [3, 'مستحضرات عناية بعبوات ذات مضخّة', 65],
    [12, 'تشكيلة مستحضرات عناية في علب', 70],
    [15, 'عبوتان للعناية', 55],
    [16, 'تشكيلة عبوات ملوّنة', 65],
    [17, 'علبة هدايا للعناية', 80],
    [19, 'تشكيلة علب للعناية', 80],
    [24, 'مستحضرات عناية بالجسم في علب', 40],
    [25, 'طقم عناية في علبة', 70],
    [28, 'مجموعة للعناية بالجسم', 75],
    [29, 'مختارات من مستحضرات العناية في علب', 65],
    [31, 'عبوات عناية بمضخّة', 60],
    [34, 'تشكيلة مستحضرات عناية معطّرة', 65],
    [44, 'مستحضرات عناية في عبوات وعلب', 75],
  ],
  'الشعر': [
    [14, 'شامبو السدر', 45],
    [18, 'مستحضر عناية بالشعر في أنبوب', 30],
    [21, 'مجموعة للعناية بالشعر', 75],
    [30, 'مستحضر عناية بالشعر في قارورة', 40],
  ],
  'منتجات أخرى': [
    [1, 'مستحضر في علبة بملصق أخضر', 35],
    [4, 'مستحضر في علبة بملصق أزرق', 35],
    [5, 'مستحضر في علبة بملصق ذهبي', 40],
    [6, 'مستحضر في علبة بملصق وردي', 35],
    [7, 'مستحضر في علبة بملصق فاتح', 30],
    [9, 'مستحضر في علبة بملصق بيج', 30],
    [10, 'مستحضر في علبة بملصق بنفسجي', 35],
    [11, 'مستحضر في علبة بملصق زيتوني', 40],
    [13, 'مستحضر في علبة بملصق أصفر', 35],
    [22, 'بخور السرغينة', 25],
    [35, 'زيت عناية بملصق زيتوني', 35],
    [36, 'زيت عناية بملصق أصفر', 35],
    [37, 'زيت عناية بملصق وردي', 40],
    [38, 'زيت عناية بملصق أخضر', 35],
    [39, 'قارورة روماتيكس', 45],
    [41, 'زيت عناية بملصق ذهبي', 40],
    [42, 'زيت عناية بملصق أزرق', 35],
    [43, 'زيت عناية بملصق بيج', 35],
  ],
};

const products = Object.entries(groups).flatMap(([category, entries]) =>
  entries.map(([id, name, price]) => ({ id, name, price, category, image: `images/${String(id).padStart(2, '0')}.jpg` })),
);
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

// Use the studio composition on the three featured cards. Details use the originals.
const studioCrops = {
  14: [311, 48, 365, 870],
  33: [669, 172, 230, 741],
  45: [891, 372, 425, 550],
};

function renderPhoto(product, detail = false) {
  const { id, name, image } = product;
  const [sourceWidth, sourceHeight, top, bottom] = photoBounds[id - 1];
  const studio = !detail && studioCrops[id];
  const originalCrop = (!detail && cardCrops[id]) || [0, top, sourceWidth, bottom - top];
  const [x, y, width, height] = studio || originalCrop;
  const percent = (part, whole) => `${(part / whole) * 100}%`;
  return `<span class="product-frame" style="--ratio:${width / height}">
    <img src="${studio ? 'images/hero.webp' : image}" alt="${detail ? name : ''}" ${detail ? '' : 'loading="lazy"'} decoding="async"
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
    (category === allCategories || product.category === category)
    && normalize(`${product.name} ${product.category}`).includes(query),
  );
  resultCount.textContent = visible.length
    ? productCounts[plurals.select(visible.length)].replace('{count}', number.format(visible.length))
    : 'لا توجد منتجات مطابقة للبحث.';
  grid.innerHTML = visible.map(product => {
    const { id, name, category, price } = product;
    return `
      <article class="card">
        <button class="photo" data-detail="${id}" aria-label="عرض صورة ${name}" aria-haspopup="dialog">
          ${renderPhoto(product)}
        </button>
        <div class="card-copy">
          <p class="card-category">${category}</p>
          <h3>${name}</h3>
          <p class="price">${formatPrice(price)}</p>
          <div class="card-actions">
            <button class="details" data-detail="${id}" aria-label="تفاصيل ${name}" aria-haspopup="dialog">عرض التفاصيل <span class="arrow" aria-hidden="true"></span></button>
            <button class="add" data-add="${id}" aria-label="إضافة ${name} إلى السلة">+</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
  updateCartCount();
}

for (const label of [allCategories, ...Object.keys(groups)]) {
  const button = document.createElement('button');
  button.textContent = label;
  button.setAttribute('aria-pressed', label === category);
  button.addEventListener('click', () => {
    filters.querySelector('[aria-pressed=true]').setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-pressed', 'true');
    category = label;
    renderProducts();
  });
  filters.append(button);
}

function renderDetail(product) {
  title.textContent = product.name;
  body.innerHTML = `
    <div class="detail-photo">${renderPhoto(product, true)}</div>
    <div class="detail-actions">
      <span class="price">${formatPrice(product.price)}</span>
      <button class="button" data-add="${product.id}" ${cart.get(product.id) === maxQuantity ? 'disabled' : ''}>إضافة إلى السلة</button>
    </div>
  `;
}

function renderCart() {
  title.textContent = 'السلة';
  const items = products.filter(product => cart.has(product.id));
  if (!items.length) {
    body.innerHTML = '<p>السلة فارغة.</p>';
    return;
  }

  const total = items.reduce((sum, { id, price }) => sum + price * cart.get(id), 0);
  body.innerHTML = `
    <ul class="cart-list">
      ${items.map(({ id, name, price }) => {
        const quantity = cart.get(id);
        return `<li>
          <div><strong>${name}</strong><div class="price">${formatPrice(price * quantity)}</div></div>
          <div class="cart-quantity" role="group" aria-label="كمية ${name}">
            <button data-cart-id="${id}" data-delta="-1" aria-label="${quantity === 1 ? 'إزالة' : 'إنقاص كمية'} ${name}">−</button>
            <span aria-live="polite">${number.format(quantity)}</span>
            <button data-cart-id="${id}" data-delta="1" aria-label="زيادة كمية ${name}" ${quantity === maxQuantity ? 'disabled' : ''}>+</button>
          </div>
        </li>`;
      }).join('')}
    </ul>
    <p class="cart-total"><strong>المجموع</strong><strong class="price">${formatPrice(total)}</strong></p>
  `;
}

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
