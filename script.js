
// Әр батырма мен сілтеме басылғанда мәтінді қазақша дауыстап оқу.
// Құрылғыда қазақша дауыс болмаса, браузер қолжетімді әдепкі дауысты қолданады.
function speakKazakh(text) {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'kk-KZ';
  utterance.rate = 0.92;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const kazakhVoice = voices.find(voice =>
    /^kk([-_]|$)/i.test(voice.lang) || /kazakh|қазақ/i.test(voice.name)
  );
  if (kazakhVoice) utterance.voice = kazakhVoice;
  window.speechSynthesis.speak(utterance);
}

// Делегатталған оқиға динамикалық түрде қосылған батырмаларға да жұмыс істейді.
document.addEventListener('click', event => {
  const control = event.target.closest('button, a[href]');
  if (!control || control.disabled) return;

  // Сілтемелер мен батырмалардағы артық техникалық таңбаларды оқымау.
  let label = control.getAttribute('aria-label') || control.innerText || control.textContent || '';
  label = label.replace(/[↗↑♡♥+]/g, ' ').replace(/\s+/g, ' ').trim();

  if (control.id === 'contrastBtn') {
    label = document.body.classList.contains('high-contrast') ? 'Контраст режимі қосылды' : 'Қалыпты түс режимі қосылды';
  } else if (control.id === 'cartOpenBtn') {
    label = document.getElementById('cartMessage')?.textContent || label;
  } else if (control.classList.contains('heart-btn')) {
    label = control.getAttribute('aria-label') || label;
  } else if (control.classList.contains('add-btn')) {
    const card = control.closest('.product-card');
    label = card ? `${card.dataset.name || 'Бұйым'} себетке қосылды` : 'Бұйым себетке қосылды';
  } else if (control.classList.contains('submit-btn')) {
    label = 'Бұйымды жариялау батырмасы басылды';
  }

  if (label) speakKazakh(label);
});


const categoryButtons = document.querySelectorAll('.category-chip');
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');
const cartMessage = document.getElementById('cartMessage');
const cartCountEl = document.getElementById('cartCount');
const contrastBtn = document.getElementById('contrastBtn');
const sellForm = document.getElementById('sellForm');
const formStatus = document.getElementById('formStatus');
let selectedCategory = 'Барлығы';
let cartCount = 0;

function filterProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase('kk');
  let visibleCount = 0;
  document.querySelectorAll('.product-card').forEach(card => {
    const categoryMatch = selectedCategory === 'Барлығы' || card.dataset.category === selectedCategory;
    const searchMatch = (card.dataset.name + ' ' + (card.dataset.maker || '')).toLocaleLowerCase('kk').includes(query);
    card.hidden = !(categoryMatch && searchMatch);
    if (!card.hidden) visibleCount++;
  });
  emptyState.hidden = visibleCount !== 0;
}
categoryButtons.forEach(button => button.addEventListener('click', () => {
  selectedCategory = button.dataset.category;
  categoryButtons.forEach(item => item.classList.toggle('active', item === button));
  filterProducts();
}));
searchInput.addEventListener('input', filterProducts);

function wireProductButtons(card) {
  const heart = card.querySelector('.heart-btn');
  if (heart) heart.addEventListener('click', () => {
    const liked = heart.classList.toggle('liked');
    heart.textContent = liked ? '♥' : '♡';
    heart.setAttribute('aria-pressed', String(liked));
    heart.setAttribute('aria-label', liked ? 'Таңдаулылардан алып тастау' : 'Таңдаулыларға қосу');
  });
  const add = card.querySelector('.add-btn');
  if (add) add.addEventListener('click', () => {
    cartCount++;
    cartCountEl.textContent = String(cartCount);
    cartMessage.textContent = `«${card.dataset.name}» себетке қосылды. Себеттегі бұйым саны: ${cartCount}.`;
  });
}
document.querySelectorAll('.product-card').forEach(wireProductButtons);

document.getElementById('cartOpenBtn').addEventListener('click', () => {
  cartMessage.textContent = cartCount
    ? `Себетте ${cartCount} бұйым бар. Бұл — тапсырыс рәсімдеусіз көрсетілетін үлгі.`
    : 'Себетіңіз әзірге бос. Қалаған бұйымыңызды «Себетке» батырмасымен қосыңыз.';
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
});
contrastBtn.addEventListener('click', () => {
  const enabled = document.body.classList.toggle('high-contrast');
  contrastBtn.setAttribute('aria-pressed', String(enabled));
  contrastBtn.textContent = enabled ? 'Қалыпты түс' : 'Контраст';
});

sellForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(sellForm);
  const maker = String(data.get('maker') || '').trim();
  const name = String(data.get('product') || '').trim();
  const category = String(data.get('category') || '').trim();
  const price = Number(data.get('price'));
  const imageUrl = String(data.get('image') || '').trim();
  const description = String(data.get('description') || '').trim();

  if (!maker || !name || !category || !Number.isFinite(price) || price < 0) {
    formStatus.textContent = 'Міндетті жолдарды дұрыс толтырыңыз.';
    return;
  }

  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.category = category;
  card.dataset.name = name;
  card.dataset.maker = maker;
  card.dataset.price = String(price);

  const imageWrap = document.createElement('div');
  imageWrap.className = 'product-image';
  const img = document.createElement('img');
  img.alt = name;
  img.loading = 'lazy';
  img.src = imageUrl || 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=800&q=80';
  img.addEventListener('error', () => {
    img.src = 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=800&q=80';
  }, { once: true });
  const tag = document.createElement('span');
  tag.className = 'product-tag';
  tag.textContent = 'Жаңа бұйым';
  const heart = document.createElement('button');
  heart.className = 'heart-btn';
  heart.type = 'button';
  heart.textContent = '♡';
  heart.setAttribute('aria-label', 'Таңдаулыларға қосу');
  imageWrap.append(img, tag, heart);

  const info = document.createElement('div');
  info.className = 'product-info';
  const categoryLabel = document.createElement('p');
  categoryLabel.className = 'product-category';
  categoryLabel.textContent = category.toLocaleUpperCase('kk');
  const title = document.createElement('h3');
  title.textContent = name;
  const makerLabel = document.createElement('p');
  makerLabel.className = 'maker';
  makerLabel.textContent = `Шебер: ${maker}`;
  const bottom = document.createElement('div');
  bottom.className = 'product-bottom';
  const priceLabel = document.createElement('span');
  priceLabel.className = 'price';
  priceLabel.textContent = `${price.toLocaleString('kk-KZ')} ₸`;
  const add = document.createElement('button');
  add.className = 'add-btn';
  add.type = 'button';
  add.textContent = 'Себетке +';
  add.setAttribute('aria-label', `${name} себетке қосу`);
  bottom.append(priceLabel, add);
  info.append(categoryLabel, title, makerLabel, bottom);
  if (description) {
    const desc = document.createElement('p');
    desc.className = 'maker';
    desc.textContent = description;
    info.insertBefore(desc, bottom);
  }
  card.append(imageWrap, info);
  productGrid.prepend(card);
  wireProductButtons(card);
  selectedCategory = 'Барлығы';
  categoryButtons.forEach(button => button.classList.toggle('active', button.dataset.category === selectedCategory));
  searchInput.value = '';
  filterProducts();
  formStatus.textContent = `«${name}» бұйымы тізімге қосылды. Бұл демо-нұсқада ғана көрінеді.`;
  sellForm.reset();
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
});
