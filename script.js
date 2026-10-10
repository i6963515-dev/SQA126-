
"use strict";

// ========================================
// 1. ҚАЗАҚША ДЫБЫСТАУ ФУНКЦИЯСЫ
// ========================================

function speakKazakh(text) {
  if (!("speechSynthesis" in window) || !text) return;

  const cleanText = String(text).replace(/\s+/g, " ").trim();
  if (!cleanText) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "kk-KZ";
  utterance.rate = 0.92;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();

  const kazakhVoice = voices.find(voice =>
    /^kk([-_]|$)/i.test(voice.lang) ||
    /kazakh|қазақ/i.test(voice.name)
  );

  if (kazakhVoice) {
    utterance.voice = kazakhVoice;
  }

  window.speechSynthesis.speak(utterance);
}


// ========================================
// 2. БАТЫРМАЛАР, СІЛТЕМЕЛЕР ЖӘНЕ СУРЕТТЕР
// БАСЫЛҒАНДА ДЫБЫСТАУ
// ========================================

document.addEventListener("click", event => {
  const target = event.target;

  if (!(target instanceof Element)) return;

  // Алдымен батырмалар мен сілтемелерді тексереміз.
  const control = target.closest("button, a[href]");

  if (control && !control.disabled) {
    let label =
      control.getAttribute("aria-label") ||
      control.innerText ||
      control.textContent ||
      "";

    label = label
      .replace(/[↗↑♡♥+]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Контраст режимі
    if (control.id === "contrastBtn") {
      label = document.body.classList.contains("high-contrast")
        ? "Контраст режимі қосылды"
        : "Қалыпты түс режимі қосылды";
    }

    // Себет батырмасы
    else if (control.id === "cartOpenBtn") {
      const message = document.getElementById("cartMessage");
      if (message && message.textContent.trim()) {
        label = message.textContent.trim();
      }
    }

    // Таңдаулылар батырмасы
    else if (control.classList.contains("heart-btn")) {
      label =
        control.getAttribute("aria-label") ||
        label;
    }

    // Себетке қосу батырмасы
    else if (control.classList.contains("add-btn")) {
      const card = control.closest(".product-card");
      const name = card?.dataset.name || "Бұйым";

      label = `${name} себетке қосылды`;
    }

    // Бұйым жариялау батырмасы
    else if (control.classList.contains("submit-btn")) {
      label = "Бұйымды жариялау батырмасы басылды";
    }

    if (label) {
      speakKazakh(label);
    }

    return;
  }

  // Сурет басылғанда бұйымның атауын айту.
  const img = target.closest("img");

  if (img) {
    const card = img.closest(".product-card");

    const name =
      card?.dataset.name ||
      img.alt ||
      img.title;

    if (name) {
      speakKazakh(`Бұл ${name}`);
    }
  }
});


// ========================================
// 3. HTML ЭЛЕМЕНТТЕРІ
// ========================================

const categoryButtons =
  document.querySelectorAll(".category-chip");

const productGrid =
  document.getElementById("productGrid");

const searchInput =
  document.getElementById("searchInput");

const emptyState =
  document.getElementById("emptyState");

const cartMessage =
  document.getElementById("cartMessage");

const cartCountEl =
  document.getElementById("cartCount");

const contrastBtn =
  document.getElementById("contrastBtn");

const sellForm =
  document.getElementById("sellForm");

const formStatus =
  document.getElementById("formStatus");

let selectedCategory = "Барлығы";
let cartCount = 0;


// ========================================
// 4. БҰЙЫМДАРДЫ САНАТ ЖӘНЕ ІЗДЕУ БОЙЫНША
// СҮЗГІЛЕУ
// ========================================

function filterProducts() {
  const query = searchInput.value
    .trim()
    .toLocaleLowerCase("kk");

  let visibleCount = 0;

  document.querySelectorAll(".product-card").forEach(card => {
    const categoryMatch =
      selectedCategory === "Барлығы" ||
      card.dataset.category === selectedCategory;

    const productName = card.dataset.name || "";
    const makerName = card.dataset.maker || "";

    const searchText =
      `${productName} ${makerName}`.toLocaleLowerCase("kk");

    const searchMatch = searchText.includes(query);

    card.hidden = !(categoryMatch && searchMatch);

    if (!card.hidden) {
      visibleCount++;
    }
  });

  if (emptyState) {
    emptyState.hidden = visibleCount !== 0;
  }
}


// ========================================
// 5. САНАТ БАТЫРМАЛАРЫ
// ========================================

categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category || "Барлығы";

    categoryButtons.forEach(item => {
      item.classList.toggle("active", item === button);
    });

    filterProducts();
  });
});


// ========================================
// 6. ІЗДЕУ ӨРІСІ
// ========================================

if (searchInput) {
  searchInput.addEventListener("input", filterProducts);
}


// ========================================
// 7. ТАҢДАУЛЫЛАР ЖӘНЕ СЕБЕТКЕ ҚОСУ
// ========================================

function wireProductButtons(card) {
  const heart = card.querySelector(".heart-btn");

  if (heart && !heart.dataset.wired) {
    heart.dataset.wired = "true";

    heart.addEventListener("click", () => {
      const liked = heart.classList.toggle("liked");

      heart.textContent = liked ? "♥" : "♡";

      heart.setAttribute(
        "aria-pressed",
        String(liked)
      );

      heart.setAttribute(
        "aria-label",
        liked
          ? "Таңдаулылардан алып тастау"
          : "Таңдаулыларға қосу"
      );
    });
  }

  const add = card.querySelector(".add-btn");

  if (add && !add.dataset.wired) {
    add.dataset.wired = "true";

    add.addEventListener("click", () => {
      cartCount++;

      if (cartCountEl) {
        cartCountEl.textContent = String(cartCount);
      }

      if (cartMessage) {
        cartMessage.textContent =
          `«${card.dataset.name || "Бұйым"}» себетке қосылды. ` +
          `Себеттегі бұйым саны: ${cartCount}.`;
      }
    });
  }
}


// Бастапқы бұйымдарға оқиғаларды қосу.
document.querySelectorAll(".product-card").forEach(card => {
  wireProductButtons(card);
});


// ========================================
// 8. СЕБЕТТІ АШУ
// ========================================

const cartOpenBtn = document.getElementById("cartOpenBtn");

if (cartOpenBtn) {
  cartOpenBtn.addEventListener("click", () => {
    if (cartMessage) {
      cartMessage.textContent = cartCount
        ? `Себетте ${cartCount} бұйым бар. ` +
          "Бұл — тапсырыс рәсімдеусіз көрсетілетін үлгі."
        : "Себетіңіз әзірге бос. " +
          "Қалаған бұйымыңызды «Себетке» батырмасымен қосыңыз.";
    }

    const products = document.getElementById("products");

    if (products) {
      products.scrollIntoView({ behavior: "smooth" });
    }
  });
}


// ========================================
// 9. КОНТРАСТ РЕЖИМІ
// ========================================

if (contrastBtn) {
  contrastBtn.addEventListener("click", () => {
    const enabled =
      document.body.classList.toggle("high-contrast");

    contrastBtn.setAttribute(
      "aria-pressed",
      String(enabled)
    );

    contrastBtn.textContent =
      enabled ? "Қалыпты түс" : "Контраст";
  });
}


// ========================================
// 10. ЖАҢА БҰЙЫМ ЖАРИЯЛАУ
// ========================================

if (sellForm) {
  sellForm.addEventListener("submit", event => {
    event.preventDefault();

    const data = new FormData(sellForm);

    const maker = String(data.get("maker") || "").trim();
    const name = String(data.get("product") || "").trim();
    const category = String(data.get("category") || "").trim();
    const price = Number(data.get("price"));
    const imageUrl = String(data.get("image") || "").trim();
    const description = String(data.get("description") || "").trim();

    if (
      !maker ||
      !name ||
      !category ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      if (formStatus) {
        formStatus.textContent =
          "Міндетті жолдарды дұрыс толтырыңыз.";

        speakKazakh(formStatus.textContent);
      }

      return;
    }

    // Бұйым карточкасы
    const card = document.createElement("article");

    card.className = "product-card";
    card.dataset.category = category;
    card.dataset.name = name;
    card.dataset.maker = maker;
    card.dataset.price = String(price);

    // Сурет контейнері
    const imageWrap = document.createElement("div");
    imageWrap.className = "product-image";

    const img = document.createElement("img");

    img.alt = name;
    img.title = name;
    img.loading = "lazy";

    const fallbackImage =
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=800&q=80";

    img.src = imageUrl || fallbackImage;

    img.addEventListener("error", () => {
      if (img.src !== fallbackImage) {
        img.src = fallbackImage;
      }
    }, { once: true });

    // Жаңа бұйым белгісі
    const tag = document.createElement("span");

    tag.className = "product-tag";
    tag.textContent = "Жаңа бұйым";

    // Таңдаулылар батырмасы
    const heart = document.createElement("button");

    heart.className = "heart-btn";
    heart.type = "button";
    heart.textContent = "♡";

    heart.setAttribute(
      "aria-label",
      "Таңдаулыларға қосу"
    );

    imageWrap.append(img, tag, heart);

    // Бұйым туралы ақпарат
    const info = document.createElement("div");
    info.className = "product-info";

    const categoryLabel = document.createElement("p");

    categoryLabel.className = "product-category";
    categoryLabel.textContent = category.toLocaleUpperCase("kk");

    const title = document.createElement("h3");
    title.textContent = name;

    const makerLabel = document.createElement("p");

    makerLabel.className = "maker";
    makerLabel.textContent = `Шебер: ${maker}`;

    // Бағасы және себет батырмасы
    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const priceLabel = document.createElement("span");

    priceLabel.className = "price";
    priceLabel.textContent =
      `${price.toLocaleString("kk-KZ")} ₸`;

    const add = document.createElement("button");

    add.className = "add-btn";
    add.type = "button";
    add.textContent = "Себетке +";

    add.setAttribute(
      "aria-label",
      `${name} себетке қосу`
    );

    bottom.append(priceLabel, add);

    info.append(categoryLabel, title, makerLabel);

    // Бұйым сипаттамасы
    if (description) {
      const desc = document.createElement("p");

      desc.className = "maker";
      desc.textContent = description;

      info.appendChild(desc);
    }

    info.appendChild(bottom);

    card.append(imageWrap, info);

    // Жаңа карточканы тізімнің басына қосу
    if (productGrid) {
      productGrid.prepend(card);
    }

    // Жаңа батырмаларға оқиғаларды қосу
    wireProductButtons(card);

    // Барлық жаңа суреттер де ортақ дыбыстау
    // оқиғасымен автоматты түрде жұмыс істейді.

    // Барлық санатты қайта таңдау
    selectedCategory = "Барлығы";

    categoryButtons.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.category === selectedCategory
      );
    });

    if (searchInput) {
      searchInput.value = "";
    }

    filterProducts();

    if (formStatus) {
      formStatus.textContent =
        `«${name}» бұйымы тізімге қосылды. ` +
        "Бұл демо-нұсқада ғана көрінеді.";

      speakKazakh(formStatus.textContent);
    }

    sellForm.reset();

    const products = document.getElementById("products");

    if (products) {
      products.scrollIntoView({ behavior: "smooth" });
    }
  });
}


// ========================================
// 11. ДЫБЫСТАУ ДАУЫСТАРЫН ДАЙЫНДАУ
// ========================================

if ("speechSynthesis" in window) {
  window.speechSynthesis.getVoices();

  window.speechSynthesis.addEventListener(
    "voiceschanged",
    () => {
      window.speechSynthesis.getVoices();
    }
  );
}
