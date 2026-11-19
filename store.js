const groups = {
  'الوجه': [
    [8, 'عناية للوجه في قارورة'],
    [20, 'مقشّرات للوجه'],
    [23, 'كريم للعناية'],
    [26, 'صابون بالليمون'],
    [27, 'كريمات ومنتجات للعناية بالوجه'],
    [32, 'أقنعة للوجه'],
    [33, 'زيت الورد روز بريز'],
    [45, 'مورّد الخدود بالعكر الفاسي'],
    [40, 'مقشّرات للوجه والجسم'],
  ],
  'الجسم': [
    [2, 'مجموعة للعناية'],
    [3, 'مستحضرات عناية بعبوات ذات مضخّة'],
    [12, 'تشكيلة مستحضرات عناية في علب'],
    [15, 'عبوتان للعناية'],
    [16, 'تشكيلة عبوات ملوّنة'],
    [17, 'علبة هدايا للعناية'],
    [19, 'تشكيلة علب للعناية'],
    [24, 'مستحضرات عناية بالجسم في علب'],
    [25, 'طقم عناية في علبة'],
    [28, 'مجموعة للعناية بالجسم'],
    [29, 'مختارات من مستحضرات العناية في علب'],
    [31, 'عبوات عناية بمضخّة'],
    [34, 'تشكيلة مستحضرات عناية معطّرة'],
    [44, 'مستحضرات عناية في عبوات وعلب'],
  ],
  'الشعر': [
    [14, 'شامبو السدر'],
    [18, 'مستحضر عناية بالشعر في أنبوب'],
    [21, 'مجموعة للعناية بالشعر'],
    [30, 'مستحضر عناية بالشعر في قارورة'],
  ],
  'منتجات أخرى': [
    [1, 'مستحضر في علبة بملصق أخضر'],
    [4, 'مستحضر في علبة بملصق أزرق'],
    [5, 'مستحضر في علبة بملصق ذهبي'],
    [6, 'مستحضر في علبة بملصق وردي'],
    [7, 'مستحضر في علبة بملصق فاتح'],
    [9, 'مستحضر في علبة بملصق بيج'],
    [10, 'مستحضر في علبة بملصق بنفسجي'],
    [11, 'مستحضر في علبة بملصق زيتوني'],
    [13, 'مستحضر في علبة بملصق أصفر'],
    [22, 'بخور السرغينة'],
    [35, 'زيت عناية بملصق زيتوني'],
    [36, 'زيت عناية بملصق أصفر'],
    [37, 'زيت عناية بملصق وردي'],
    [38, 'زيت عناية بملصق أخضر'],
    [39, 'قارورة روماتيكس'],
    [41, 'زيت عناية بملصق ذهبي'],
    [42, 'زيت عناية بملصق أزرق'],
    [43, 'زيت عناية بملصق بيج'],
  ],
};

const products = Object.entries(groups).flatMap(([category, entries]) =>
  entries.map(([id, name]) => ({ id, name, category, image: `images/${String(id).padStart(2, '0')}.jpg` })),
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
const openSelection = document.querySelector('#open-selection');
const storageKey = 'aziza-selection';
let selected = new Set();
try {
  const stored = JSON.parse(localStorage.getItem(storageKey));
  if (Array.isArray(stored)) selected = new Set(stored.filter(id => products.some(product => product.id === id)));
} catch {
  // Keep the selection available for the current page if storage is unavailable.
}
const allCategories = 'الكل';
const number = new Intl.NumberFormat('ar-MA-u-nu-arab');
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

function updateButtons() {
  count.textContent = number.format(selected.size);
  grid.querySelectorAll('[data-add]').forEach(button => {
    const isSelected = selected.has(Number(button.dataset.add));
    button.setAttribute('aria-pressed', isSelected);
    button.textContent = isSelected ? '✓' : '+';
  });
}

function toggleSelection(id) {
  if (selected.has(id)) selected.delete(id);
  else selected.add(id);
  try {
    localStorage.setItem(storageKey, JSON.stringify([...selected]));
  } catch {
    // The current page still retains the selection.
  }
  updateButtons();
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
    const { id, name, category } = product;
    return `
      <article class="card">
        <button class="photo" data-detail="${id}" aria-label="عرض صورة ${name}" aria-haspopup="dialog">
          ${renderPhoto(product)}
        </button>
        <div class="card-copy">
          <p class="card-category">${category}</p>
          <h3>${name}</h3>
          <div class="card-actions">
            <button class="details" data-detail="${id}" aria-label="تفاصيل ${name}" aria-haspopup="dialog">عرض التفاصيل <span class="arrow" aria-hidden="true"></span></button>
            <button class="add" data-add="${id}" aria-label="اختيار ${name}"></button>
          </div>
        </div>
      </article>
    `;
  }).join('');
  updateButtons();
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
    <button class="button" data-toggle="${product.id}">${selected.has(product.id) ? 'إزالة من مختاراتي' : 'إضافة إلى مختاراتي'}</button>
  `;
}

function renderSelection() {
  title.textContent = 'مختاراتي';
  const items = products.filter(product => selected.has(product.id));
  body.innerHTML = items.length ? `<ul class="selection-list">${items.map(({ id, name }) =>
    `<li><span>${name}</span><button data-remove="${id}" aria-label="إزالة ${name}">إزالة</button></li>`,
  ).join('')}</ul>` : '<p>لم تختاري أي منتج بعد.</p>';
}

search.addEventListener('input', renderProducts);
grid.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.add) {
    toggleSelection(Number(button.dataset.add));
  } else {
    renderDetail(products.find(product => product.id === Number(button.dataset.detail)));
    dialog.showModal();
  }
});
openSelection.addEventListener('click', () => {
  renderSelection();
  dialog.showModal();
});
body.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.toggle) {
    const id = Number(button.dataset.toggle);
    toggleSelection(id);
    button.textContent = selected.has(id) ? 'إزالة من مختاراتي' : 'إضافة إلى مختاراتي';
  } else if (button.dataset.remove) {
    toggleSelection(Number(button.dataset.remove));
    renderSelection();
    (body.querySelector('button') || dialog.querySelector('.close')).focus();
  }
});

renderProducts();
