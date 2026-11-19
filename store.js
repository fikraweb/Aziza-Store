const groups = {
  Visage: [[8, 'Soin du visage en flacon'], [20, 'Gommages visage'], [23, 'Crème de soin'], [26, 'Savon au citron'], [27, 'Crèmes et soins du visage'], [32, 'Masques visage'], [33, 'Sérum visage'], [39, 'Huile de soin à l’avocat'], [40, 'Gommages visage et corps']],
  Corps: [[2, 'Ensemble de soins'], [3, 'Soins en flacon pompe'], [12, 'Collection de soins en pot'], [15, 'Duo de soins en pot'], [16, 'Collection de flacons colorés'], [17, 'Coffret de soins'], [19, 'Collection de soins en coffret'], [24, 'Soins du corps en pot'], [25, 'Ensemble de soins en boîte'], [28, 'Collection de soins pour le corps'], [29, 'Sélection de soins en pot'], [31, 'Duo de flacons pompe'], [34, 'Collection de soins parfumés'], [44, 'Soins en flacon et en coffret'], [45, 'Huiles parfumées']],
  Cheveux: [[14, 'Shampoing au sidr'], [18, 'Soin capillaire en tube'], [21, 'Gamme de soins capillaires'], [30, 'Soin capillaire en flacon']],
  'Autres soins': [[1, 'Soin en pot · étiquette verte'], [4, 'Soin en pot · étiquette bleue'], [5, 'Soin en pot · étiquette dorée'], [6, 'Soin en pot · étiquette rose'], [7, 'Soin en pot · étiquette claire'], [9, 'Soin en pot · étiquette beige'], [10, 'Soin en pot · étiquette violette'], [11, 'Soin en pot · étiquette olive'], [13, 'Soin en pot · étiquette jaune'], [22, 'Collection de soins ambrés'], [35, 'Huile de soin · étiquette olive'], [36, 'Huile de soin · étiquette jaune'], [37, 'Huile de soin · étiquette rose'], [38, 'Huile de soin · étiquette verte'], [41, 'Huile de soin · étiquette dorée'], [42, 'Huile de soin · étiquette bleue'], [43, 'Huile de soin · étiquette beige']],
};

const products = Object.entries(groups).flatMap(([category, entries]) =>
  entries.map(([id, name]) => ({ id, name, category, image: `images/${String(id).padStart(2, '0')}.jpg` })),
);
const featured = [33, 14, 45, 40, 31, 32, 28, 39];
products.sort((a, b) => {
  const rank = ({ id }) => featured.includes(id) ? featured.indexOf(id) : featured.length + id;
  return rank(a) - rank(b);
});

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
let category = 'Tout';

function normalize(value) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

function updateButtons() {
  count.textContent = selected.size;
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
    (category === 'Tout' || product.category === category)
    && normalize(`${product.name} ${product.category}`).includes(query),
  );
  resultCount.textContent = visible.length
    ? `${visible.length} ${visible.length === 1 ? 'référence' : 'références'}`
    : 'Aucune référence trouvée.';
  grid.innerHTML = visible.map(({ id, name, category, image }) => `
    <article class="card">
      <button class="photo" data-detail="${id}" aria-label="Voir ${name}" aria-haspopup="dialog">
        <img src="${image}" alt="" loading="lazy" decoding="async">
      </button>
      <div class="card-copy">
        <p class="card-category">${category}</p>
        <h3>${name}</h3>
        <div class="card-actions">
          <button class="details" data-detail="${id}" aria-label="Voir les détails de ${name}" aria-haspopup="dialog">Voir le soin <span class="arrow" aria-hidden="true"></span></button>
          <button class="add" data-add="${id}" aria-label="Sélectionner ${name}"></button>
        </div>
      </div>
    </article>
  `).join('');
  updateButtons();
}

for (const label of ['Tout', ...Object.keys(groups)]) {
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
    <img class="detail-photo" src="${product.image}" alt="${product.name}">
    <button class="button" data-toggle="${product.id}">${selected.has(product.id) ? 'Retirer de ma sélection' : 'Ajouter à ma sélection'}</button>
  `;
}

function renderSelection() {
  title.textContent = 'Ma sélection';
  const items = products.filter(product => selected.has(product.id));
  body.innerHTML = items.length ? `<ul class="selection-list">${items.map(({ id, name }) =>
    `<li><span>${name}</span><button data-remove="${id}" aria-label="Retirer ${name}">Retirer</button></li>`,
  ).join('')}</ul>` : '<p>Votre sélection est vide.</p>';
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
    button.textContent = selected.has(id) ? 'Retirer de ma sélection' : 'Ajouter à ma sélection';
  } else if (button.dataset.remove) {
    toggleSelection(Number(button.dataset.remove));
    renderSelection();
    (body.querySelector('button') || dialog.querySelector('.close')).focus();
  }
});

renderProducts();
