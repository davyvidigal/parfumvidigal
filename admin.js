const STORAGE_KEY = "parfumvidigal_products";
const SESSION_KEY = "parfumvidigal_admin_session";
const CHARGES_KEY = "parfumvidigal_charges";

const ADMIN_PASSWORD = "@Davy9818";

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Luxury Gold",
    price: 299.90,
    category: "masculino",
    image: "https://images.unsplash.com/photo-1594035910387-fea477",
    stock: 10,
    description: "Perfume sofisticado e marcante."
  },
  {
    id: 2,
    name: "Rose Elegance",
    price: 249.90,
    category: "feminino",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601",
    stock: 10,
    description: "Fragrância elegante e delicada."
  }
];

// ELEMENTOS
const loginSection = document.getElementById("admin-login");
const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("admin-password");
const loginError = document.getElementById("login-error");

const adminHeader = document.getElementById("admin-header");
const adminMain = document.getElementById("admin-main");

const productForm = document.getElementById("product-form");
const productsContainer = document.getElementById("admin-products");

const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("image-preview");

const formMessage = document.getElementById("form-message");
const formTitle = document.getElementById("form-title");
const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-edit");

const chargeForm = document.getElementById("charge-form");
const chargeList = document.getElementById("charge-list");
const chargeMessage = document.getElementById("charge-message");

// SELEÇÃO DE VÁRIOS PERFUMES NA MESMA COMPRA
const chargeProductField = document.createElement("div");
chargeProductField.id = "charge-products-field";
chargeProductField.style.cssText = `
  margin:16px 0;
  padding:14px;
  border:1px solid #ddd;
  border-radius:10px;
  background:#fafafa;
`;

chargeProductField.innerHTML = `
  <label style="display:block;font-weight:700;margin-bottom:6px;">
    Perfumes vendidos nesta compra
  </label>
  <p style="margin:0 0 12px;color:#666;font-size:13px;">
    Marque todos os perfumes comprados e informe a quantidade de cada um.
  </p>
  <div id="charge-products-options"></div>
  <p id="charge-products-selected" style="margin:10px 0 0;font-size:13px;font-weight:600;">
    Nenhum perfume selecionado
  </p>
`;

chargeForm.insertBefore(
  chargeProductField,
  chargeForm.querySelector('button[type="submit"]')
);

function refreshChargeProductOptions() {
  const container = document.getElementById("charge-products-options");
  if (!container) return;

  container.innerHTML = "";

  getProductsAlphabetically().forEach(product => {
    const row = document.createElement("div");

    row.style.cssText = `
      display:flex;align-items:center;gap:10px;margin:8px 0;
      padding:9px;background:#fff;border:1px solid #e5e5e5;
      border-radius:7px;flex-wrap:wrap;
    `;

    const label = document.createElement("label");

    label.style.cssText = `
      display:flex;align-items:center;gap:7px;
      flex:1;min-width:180px;margin:0;
    `;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "charge-product-checkbox";
    checkbox.value = String(product.id);
    checkbox.style.width = "auto";

    const name = document.createElement("span");
    name.textContent = product.name;
    label.append(checkbox, name);

    const quantity = document.createElement("input");
    quantity.type = "number";
    quantity.className = "charge-product-quantity";
    quantity.min = "1";
    quantity.step = "1";
    quantity.value = "1";
    quantity.title = "Quantidade deste perfume";
    quantity.setAttribute("aria-label", "Quantidade de " + product.name);
    quantity.style.cssText = "width:85px;margin:0;";
    quantity.disabled = true;

    checkbox.addEventListener("change", () => {
      quantity.disabled = !checkbox.checked;
      updateSelectedChargeProducts();
    });

    row.append(label, quantity);
    container.appendChild(row);
  });

  updateSelectedChargeProducts();
}

function updateSelectedChargeProducts() {
  const selected = document.querySelectorAll(
    ".charge-product-checkbox:checked"
  );

  const summary = document.getElementById("charge-products-selected");

  if (summary) {
    summary.textContent = selected.length
      ? `${selected.length} perfume(s) diferente(s) selecionado(s)`
      : "Nenhum perfume selecionado";
  }
}

refreshChargeProductOptions();

let selectedImage = "";

// LOGIN
function isAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

function showAdmin() {
  loginSection.style.display = "none";
  adminHeader.style.display = "flex";
  adminMain.style.display = "block";

  renderAdmin();
  renderCharges();
  refreshChargeProductOptions();
}

function showLogin() {
  loginSection.style.display = "block";
  adminHeader.style.display = "none";
  adminMain.style.display = "none";
}

loginForm.addEventListener("submit", function(event) {
  event.preventDefault();

  if (passwordInput.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, "true");
    loginError.textContent = "";
    passwordInput.value = "";
    showAdmin();
  } else {
    loginError.textContent = "Senha incorreta!";
    passwordInput.value = "";
  }
});

document.getElementById("logout-button").addEventListener("click", function() {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
});

// PRODUTOS
function getProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) return DEFAULT_PRODUCTS;

    const products = JSON.parse(saved);

    return Array.isArray(products) ? products : DEFAULT_PRODUCTS;
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    return DEFAULT_PRODUCTS;
  }
}

// ORDENAR PRODUTOS EM ORDEM ALFABÉTICA
function getProductsAlphabetically() {
  return getProducts().slice().sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""), "pt-BR", {
      sensitivity: "base",
      numeric: true
    })
  );
}

function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch (error) {
    alert("Não foi possível salvar os produtos. O armazenamento pode estar cheio. Tente usar uma foto menor.");
    console.error(error);
    return false;
  }
}

// IMAGENS
function convertImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Nenhuma imagem selecionada."));
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      reject(new Error("Selecione uma imagem JPG, PNG ou WEBP."));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("A imagem deve ter no máximo 5 MB."));
      return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
      const img = new Image();

      img.onload = function() {
        const maxSize = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };

      img.onerror = function() {
        reject(new Error("Não foi possível abrir a imagem."));
      };

      img.src = event.target.result;
    };

    reader.onerror = function() {
      reject(new Error("Erro ao ler o arquivo."));
    };

    reader.readAsDataURL(file);
  });
}

imageInput.addEventListener("change", async function() {
  const file = imageInput.files[0];
  if (!file) return;

  try {
    selectedImage = await convertImage(file);
    imagePreview.src = selectedImage;
    imagePreview.style.display = "block";

    formMessage.style.color = "green";
    formMessage.textContent = "Imagem selecionada com sucesso!";
  } catch (error) {
    selectedImage = "";
    imageInput.value = "";
    imagePreview.src = "";
    imagePreview.style.display = "none";

    formMessage.style.color = "red";
    formMessage.textContent = error.message;
  }
});

// AUXILIARES
function formatPrice(price) {
  return Number(price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// EXIBIR PRODUTOS
function renderAdmin() {
  if (!isAuthenticated()) {
    showLogin();
    return;
  }

  const products = getProductsAlphabetically();
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.textContent = "Nenhum produto cadastrado.";
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    const image = document.createElement("img");
    image.src = product.image || "";
    image.alt = product.name || "Produto";

    image.onerror = function() {
      this.style.display = "none";
    };

    const title = document.createElement("h3");
    title.textContent = product.name;

    const price = document.createElement("p");
    price.textContent = formatPrice(product.price);

    const category = document.createElement("p");
    category.textContent = "Categoria: " + product.category;

    const stock = document.createElement("p");
    stock.textContent = "Estoque: " + product.stock;

    const description = document.createElement("p");
    description.textContent = product.description || "";

    const editButton = document.createElement("button");
    editButton.textContent = "EDITAR";
    editButton.addEventListener("click", () => editProduct(product.id));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "EXCLUIR";
    deleteButton.className = "delete-button";
    deleteButton.addEventListener("click", () => deleteProduct(product.id));

    card.append(
      image,
      title,
      price,
      category,
      stock,
      description,
      editButton,
      deleteButton
    );

    productsContainer.appendChild(card);
  });
}
// CADASTRAR E ATUALIZAR PRODUTOS

productForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  if (!isAuthenticated()) {
    showLogin();
    return;
  }

  const editId = document.getElementById("edit-id").value;
  const name = document.getElementById("name").value.trim();
  const price = Number(document.getElementById("price").value);
  const category = document.getElementById("category").value;
  const stock = Number(document.getElementById("stock").value);
  const description = document.getElementById("description").value.trim();

  if (
    !name ||
    !category ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    formMessage.style.color = "red";
    formMessage.textContent = "Confira os campos preenchidos.";
    return;
  }

  const products = getProducts();

  const existingProduct = editId
    ? products.find(p => String(p.id) === String(editId))
    : null;

  let productImage = existingProduct ? existingProduct.image : "";

  if (imageInput.files.length > 0) {
    saveButton.disabled = true;
    saveButton.textContent = "PROCESSANDO FOTO...";

    try {
      productImage = await convertImage(imageInput.files[0]);
    } catch (error) {
      formMessage.style.color = "red";
      formMessage.textContent = error.message;
      saveButton.disabled = false;
      saveButton.textContent = existingProduct
        ? "ATUALIZAR PRODUTO"
        : "SALVAR PRODUTO";
      return;
    }
  }

  if (!productImage) {
    formMessage.style.color = "red";
    formMessage.textContent = "Selecione uma foto para o produto.";
    saveButton.disabled = false;
    saveButton.textContent = "SALVAR PRODUTO";
    return;
  }

  const product = {
    id: existingProduct ? existingProduct.id : Date.now(),
    name,
    price,
    category,
    image: productImage,
    stock,
    description
  };

  const updatedProducts = existingProduct
    ? products.map(p => String(p.id) === String(editId) ? product : p)
    : [...products, product];

  const saved = saveProducts(updatedProducts);

  saveButton.disabled = false;
  saveButton.textContent = "SALVAR PRODUTO";

  if (!saved) return;

  formMessage.style.color = "green";
  formMessage.textContent = existingProduct
    ? "Produto atualizado com sucesso!"
    : "Produto cadastrado com sucesso!";

  resetForm();
  renderAdmin();
  refreshChargeProductOptions();
});

// EDITAR PRODUTO
function editProduct(id) {
  if (!isAuthenticated()) return;

  const product = getProducts().find(p => String(p.id) === String(id));
  if (!product) return;

  document.getElementById("edit-id").value = product.id;
  document.getElementById("name").value = product.name;
  document.getElementById("price").value = product.price;
  document.getElementById("category").value = product.category;
  document.getElementById("stock").value = product.stock;
  document.getElementById("description").value = product.description || "";

  selectedImage = product.image;
  imageInput.value = "";

  if (product.image) {
    imagePreview.src = product.image;
    imagePreview.style.display = "block";
  }

  formTitle.textContent = "Editar produto";
  saveButton.textContent = "ATUALIZAR PRODUTO";
  cancelButton.style.display = "inline-block";

  formMessage.textContent = "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// EXCLUIR PRODUTO
function deleteProduct(id) {
  if (!isAuthenticated()) return;

  if (!confirm("Deseja realmente excluir este produto?")) return;

  const products = getProducts().filter(p => String(p.id) !== String(id));

  if (saveProducts(products)) renderAdmin();
}

// LIMPAR FORMULÁRIO
function resetForm() {
  productForm.reset();

  document.getElementById("edit-id").value = "";
  selectedImage = "";

  imagePreview.src = "";
  imagePreview.style.display = "none";

  formTitle.textContent = "Cadastrar produto";
  saveButton.textContent = "SALVAR PRODUTO";
  cancelButton.style.display = "none";
}

cancelButton.addEventListener("click", function() {
  resetForm();
  formMessage.textContent = "";
});

// BLOCO DE NOTAS E COBRANÇAS

function getCharges() {
  try {
    const saved = localStorage.getItem(CHARGES_KEY);
    if (!saved) return [];

    const charges = JSON.parse(saved);
    return Array.isArray(charges) ? charges : [];
  } catch (error) {
    console.error("Erro ao carregar cobranças:", error);
    return [];
  }
}

function saveCharges(charges) {
  try {
    localStorage.setItem(CHARGES_KEY, JSON.stringify(charges));
    return true;
  } catch (error) {
    alert("Não foi possível salvar. O armazenamento do navegador pode estar cheio.");
    console.error(error);
    return false;
  }
}

function formatWhatsAppNumber(phone) {
  let number = String(phone).replace(/\D/g, "");

  if (number.length === 10 || number.length === 11) {
    number = "55" + number;
  }

  if (
    number.startsWith("55") &&
    (number.length === 12 || number.length === 13)
  ) {
    return number;
  }

  return null;
}

// RESUMO FINANCEIRO
function renderChargeSummary(charges) {
  const pending = charges
    .filter(charge => !charge.paid)
    .reduce((total, charge) => total + Number(charge.amount), 0);

  const paid = charges
    .filter(charge => charge.paid)
    .reduce((total, charge) => total + Number(charge.amount), 0);

  document.getElementById("total-pending").textContent = formatPrice(pending);
  document.getElementById("total-paid").textContent = formatPrice(paid);
  document.getElementById("total-clients").textContent = charges.length;
}

// LISTAR COBRANÇAS
function renderCharges() {
  if (!isAuthenticated()) return;

  const charges = getCharges();
  chargeList.innerHTML = "";

  renderChargeSummary(charges);
  renderReports();

  if (charges.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "Nenhuma cobrança cadastrada ainda.";
    chargeList.appendChild(empty);
    return;
  }

  charges.sort((a, b) => Number(a.paid) - Number(b.paid));

  charges.forEach(charge => {
    const card = document.createElement("div");
    card.className = charge.paid ? "charge-card paid" : "charge-card";

    const title = document.createElement("h3");
    title.textContent = charge.name;

    const phone = document.createElement("p");
    phone.textContent = "WhatsApp: " + charge.phone;

    const value = document.createElement("div");
    value.className = "charge-value";
    value.textContent = formatPrice(charge.amount);

    const description = document.createElement("p");
    description.textContent = charge.description || "Sem observações.";

    const productsLine = document.createElement("p");
    const chargeItems = getChargeProducts(charge, getProducts());

    productsLine.textContent = chargeItems.length
      ? "Perfumes: " + chargeItems.map(item =>
          `${item.product.name} (${item.quantity} un.)`
        ).join(", ")
      : "Perfumes: não informados";

    const date = document.createElement("p");
    date.textContent = "Registrado em: " + charge.createdAt;

    const status = document.createElement("span");
    status.className = charge.paid
      ? "charge-status status-paid"
      : "charge-status status-pending";

    status.textContent = charge.paid
      ? "PAGAMENTO REALIZADO"
      : "PAGAMENTO PENDENTE";

    const actions = document.createElement("div");
    actions.className = "charge-actions";

    const whatsappButton = document.createElement("button");
    whatsappButton.className = "whatsapp-button";
    whatsappButton.textContent = "COBRAR PELO WHATSAPP";
    whatsappButton.addEventListener("click", () => sendWhatsAppCharge(charge));

    const paymentButton = document.createElement("button");
    paymentButton.className = charge.paid ? "pending-button" : "paid-button";
    paymentButton.textContent = charge.paid
      ? "MARCAR COMO PENDENTE"
      : "MARCAR COMO PAGO";

    paymentButton.addEventListener("click", () => toggleChargeStatus(charge.id));

    const pdfButton = document.createElement("button");
    pdfButton.className = "pdf-button";
    pdfButton.textContent = "GERAR EXTRATO PDF";
    pdfButton.addEventListener("click", () => generateChargePDF(charge));

    const deleteButton = document.createElement("button");
    deleteButton.className = "charge-delete";
    deleteButton.textContent = "EXCLUIR";
    deleteButton.addEventListener("click", () => deleteCharge(charge.id));

    actions.append(
      whatsappButton,
      paymentButton,
      pdfButton,
      deleteButton
    );

    card.append(
      title,
      phone,
      value,
      description,
      productsLine,
      date,
      status,
      actions
    );

    chargeList.appendChild(card);
  });
}
// CADASTRAR COBRANÇA COM VÁRIOS PERFUMES
chargeForm.addEventListener("submit", function(event) {
  event.preventDefault();

  if (!isAuthenticated()) {
    showLogin();
    return;
  }

  const name = document.getElementById("client-name").value.trim();
  const phone = document.getElementById("client-phone").value.trim();
  const amount = Number(document.getElementById("charge-amount").value);
  const description = document.getElementById("charge-description").value.trim();

  const selectedProducts = [
    ...document.querySelectorAll(".charge-product-checkbox:checked")
  ].map(checkbox => {
    const product = getProducts().find(
      item => String(item.id) === checkbox.value
    );

    const row = checkbox.closest("div");
    const quantityInput = row
      ? row.querySelector(".charge-product-quantity")
      : null;

    return product ? {
      id: product.id,
      name: product.name,
      quantity: Math.max(1, parseInt(quantityInput?.value, 10) || 1)
    } : null;
  }).filter(Boolean);

  const whatsappNumber = formatWhatsAppNumber(phone);

  if (!name) {
    chargeMessage.style.color = "red";
    chargeMessage.textContent = "Informe o nome do cliente.";
    return;
  }

  if (!whatsappNumber) {
    chargeMessage.style.color = "red";
    chargeMessage.textContent = "Número inválido. Informe o DDD e o número do WhatsApp.";
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    chargeMessage.style.color = "red";
    chargeMessage.textContent = "Informe um valor válido.";
    return;
  }

  if (selectedProducts.length === 0) {
    chargeMessage.style.color = "red";
    chargeMessage.textContent = "Selecione pelo menos um perfume vendido.";
    return;
  }

  const charges = getCharges();

  const newCharge = {
    id: Date.now(),
    name,
    phone,
    amount,
    description,
    products: selectedProducts,

    // Compatibilidade com cobranças antigas e vendas de um só perfume.
    productId: selectedProducts.length === 1 ? selectedProducts[0].id : null,
    productName: selectedProducts.length === 1 ? selectedProducts[0].name : "",
    quantity: selectedProducts.length === 1 ? selectedProducts[0].quantity : 0,

    paid: false,
    createdAt: new Date().toLocaleDateString("pt-BR")
  };

  charges.push(newCharge);

  if (saveCharges(charges)) {
    chargeForm.reset();

    document.querySelectorAll(".charge-product-checkbox").forEach(input => {
      input.checked = false;
    });

    document.querySelectorAll(".charge-product-quantity").forEach(input => {
      input.value = "1";
      input.disabled = true;
    });

    updateSelectedChargeProducts();

    chargeMessage.style.color = "green";
    chargeMessage.textContent = "Compra cadastrada com sucesso!";

    renderCharges();
  }
});

// ENVIAR WHATSAPP
function sendWhatsAppCharge(charge) {
  if (!isAuthenticated()) return;

  const phone = formatWhatsAppNumber(charge.phone);

  if (!phone) {
    alert("O número de WhatsApp deste cliente está inválido.");
    return;
  }

  const message =
    "Olá, " + charge.name + "! Tudo bem? 😊\n\n" +
    "Aqui é da *Parfum Vidigal*.\n\n" +
    "Estamos entrando em contato para lembrar sobre o pagamento:\n\n" +
    "*Valor:* " + formatPrice(charge.amount) + "\n" +
    "*Referente a:* " + (charge.description || "Compra na Parfum Vidigal") + "\n" +
    "*Perfumes:* " + getChargeProducts(charge, getProducts()).map(item =>
      item.product.name + " (" + item.quantity + " un.)"
    ).join(", ") + "\n\n" +
    "Caso já tenha realizado o pagamento, por favor desconsidere esta mensagem.\n\n" +
    "Agradecemos pela preferência! ❤️";

  const url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);

  window.open(url, "_blank", "noopener,noreferrer");
}

// MARCAR COMO PAGO OU PENDENTE
function toggleChargeStatus(id) {
  if (!isAuthenticated()) return;

  const charges = getCharges();

  const updated = charges.map(charge => {
    if (String(charge.id) === String(id)) {
      return {
        ...charge,
        paid: !charge.paid
      };
    }

    return charge;
  });

  if (saveCharges(updated)) {
    renderCharges();
  }
}

// EXCLUIR COBRANÇA
function deleteCharge(id) {
  if (!isAuthenticated()) return;

  if (!confirm("Deseja realmente excluir esta cobrança?")) return;

  const charges = getCharges().filter(
    charge => String(charge.id) !== String(id)
  );

  if (saveCharges(charges)) {
    renderCharges();
  }
}

// RELATÓRIOS DE VENDAS E INTERESSE
const INTEREST_KEY = "parfumvidigal_product_interest";

function getInterestData() {
  try {
    const value = JSON.parse(
      localStorage.getItem(INTEREST_KEY) || "{}"
    );

    return value && typeof value === "object" ? value : {};
  } catch (error) {
    console.error("Erro ao carregar interesses:", error);
    return {};
  }
}

// IDENTIFICAR TODOS OS PRODUTOS DA COBRANÇA
function getChargeProducts(charge, products) {
  // Novo formato: vários perfumes na mesma compra.
  if (Array.isArray(charge.products) && charge.products.length) {
    return charge.products.map(item => ({
      product: products.find(
        product => String(product.id) === String(item.id)
      ) || {
        id: item.id,
        name: item.name || "Produto removido"
      },
      quantity: Math.max(1, Number(item.quantity) || 1)
    }));
  }

  // Compatibilidade com cobranças antigas de um único perfume.
  if (
    charge.productId !== undefined &&
    charge.productId !== null &&
    charge.productId !== ""
  ) {
    return [{
      product: products.find(
        product => String(product.id) === String(charge.productId)
      ) || {
        id: charge.productId,
        name: charge.productName || "Produto removido"
      },
      quantity: Math.max(1, Number(charge.quantity) || 1)
    }];
  }

  // Última tentativa para registros antigos.
  const description = String(charge.description || "").toLocaleLowerCase("pt-BR");

  const found = products.find(product =>
    product.name &&
    description.includes(String(product.name).toLocaleLowerCase("pt-BR"))
  );

  return found
    ? [{ product: found, quantity: Math.max(1, Number(charge.quantity) || 1) }]
    : [];
}

// SOMAR PRODUTOS VENDIDOS
function buildSalesReport(paidCharges, products) {
  const sales = {};

  paidCharges.forEach(charge => {
    const items = getChargeProducts(charge, products);
    if (!items.length) return;

    const totalUnits = items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const amount = Number(charge.amount) || 0;

    items.forEach(({ product, quantity }) => {
      const key = String(product.id);

      if (!sales[key]) {
        sales[key] = {
          name: product.name,
          quantity: 0,
          revenue: 0,
          orders: 0
        };
      }

      sales[key].quantity += quantity;

      sales[key].revenue += totalUnits > 0
        ? amount * (quantity / totalUnits)
        : 0;

      sales[key].orders += 1;
    });
  });

  return Object.values(sales);
}

// MOSTRAR RELATÓRIOS
function renderReports() {
  const salesBody = document.getElementById("report-sales-body");
  const interestBody = document.getElementById("report-interest-body");

  const paidTotal = document.getElementById("report-paid-total");
  const paidOrders = document.getElementById("report-paid-orders");

  const salesEmpty = document.getElementById("report-sales-empty");
  const interestEmpty = document.getElementById("report-interest-empty");

  if (!salesBody || !interestBody) return;

  const products = getProducts();

  const paidCharges = getCharges().filter(
    charge => charge.paid
  );

  const rankedSales = buildSalesReport(paidCharges, products).sort((a, b) =>
    b.quantity - a.quantity || b.revenue - a.revenue
  );

  const revenueTotal = paidCharges.reduce(
    (sum, charge) => sum + (Number(charge.amount) || 0),
    0
  );

  paidTotal.textContent = formatPrice(revenueTotal);
  paidOrders.textContent = String(paidCharges.length);

  salesBody.innerHTML = "";

  rankedSales.forEach((item, index) => {
    const row = document.createElement("tr");

    [
      String(index + 1),
      item.name,
      String(item.quantity),
      String(item.orders),
      formatPrice(item.revenue)
    ].forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    salesBody.appendChild(row);
  });

  salesEmpty.style.display = rankedSales.length
    ? "none"
    : "block";

  // PRODUTOS MAIS PROCURADOS
  const interest = getInterestData();

  const rankedInterest = products.map(product => {
    const stats = interest[String(product.id)] || {};

    return {
      name: product.name,
      views: Number(stats.views) || 0,
      searches: Number(stats.searches) || 0,
      clicks: Number(stats.clicks) || 0,

      score:
        (Number(stats.views) || 0) +
        (Number(stats.searches) || 0) +
        (Number(stats.clicks) || 0)
    };
  }).sort((a, b) => b.score - a.score);

  interestBody.innerHTML = "";

  rankedInterest.forEach((item, index) => {
    const row = document.createElement("tr");

    [
      String(index + 1),
      item.name,
      String(item.views),
      String(item.searches),
      String(item.clicks),
      String(item.score)
    ].forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    interestBody.appendChild(row);
  });

  interestEmpty.style.display = rankedInterest.some(
    item => item.score > 0
  ) ? "none" : "block";
}
// EXPORTAR PLANILHA
function exportReportsCSV() {
  if (!isAuthenticated()) return;

  const products = getProducts();

  const paidCharges = getCharges().filter(
    charge => charge.paid
  );

  const sales = buildSalesReport(paidCharges, products);
  const interest = getInterestData();

  const rows = [
    ["RELATORIO DE VENDAS PAGAS - PARFUM VIDIGAL"],

    [
      "Produto",
      "Unidades vendidas",
      "Cobranças pagas",
      "Faturamento (R$)"
    ],

    ...Object.values(sales)
      .sort((a, b) => b.quantity - a.quantity)
      .map(item => [
        item.name,
        item.quantity,
        item.orders,
        item.revenue.toFixed(2).replace(".", ",")
      ]),

    [],

    ["RELATORIO DE PRODUTOS MAIS PROCURADOS"],

    [
      "Produto",
      "Visualizacoes",
      "Pesquisas",
      "Cliques em adicionar ao carrinho",
      "Interacoes totais"
    ],

    ...products.map(product => {
      const stats = interest[String(product.id)] || {};

      const views = Number(stats.views) || 0;
      const searches = Number(stats.searches) || 0;
      const clicks = Number(stats.clicks) || 0;

      return [
        product.name,
        views,
        searches,
        clicks,
        views + searches + clicks
      ];
    }).sort((a, b) => b[4] - a[4])
  ];

  const csv = "\uFEFF" + rows.map(row =>
    row.map(value =>
      '"' + String(value ?? "").replace(/"/g, '""') + '"'
    ).join(";")
  ).join("\r\n");

  const blob = new Blob(
    [csv],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "relatorios-parfum-vidigal.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

document.getElementById("export-reports")?.addEventListener(
  "click",
  exportReportsCSV
);

// GERAR EXTRATO DE VENDA EM PDF
function generateChargePDF(charge) {
  if (!isAuthenticated()) return;

  const receiptWindow = window.open("", "_blank");

  if (!receiptWindow) {
    alert("Permita janelas pop-up para gerar o extrato.");
    return;
  }

  function escapeReceipt(value) {
    return String(value ?? "").replace(/[&<>"']/g, function(char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  const status = charge.paid ? "PAGO" : "PENDENTE";
  const statusColor = charge.paid ? "#238348" : "#b7791f";

  const receiptHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">

      <title>Extrato de Venda - Parfum Vidigal</title>

      <style>
        * { box-sizing: border-box; }

        body {
          font-family: Arial, sans-serif;
          color: #222;
          background: #fff;
          margin: 0;
          padding: 35px;
        }

        .receipt {
          max-width: 750px;
          margin: auto;
          border: 1px solid #ddd;
          padding: 35px;
        }

        .header {
          text-align: center;
          border-bottom: 3px solid #9c7844;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }

        .header h1 {
          margin: 0;
          color: #9c7844;
          letter-spacing: 2px;
        }

        .header p {
          color: #777;
          margin-bottom: 0;
        }

        .title {
          text-align: center;
          margin: 25px 0;
          font-size: 20px;
        }

        .section { margin: 25px 0; }

        .section h3 {
          border-bottom: 1px solid #ddd;
          padding-bottom: 8px;
          color: #9c7844;
        }

        .line {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }

        .line strong { text-align: right; }

        .description {
          background: #f8f8f8;
          padding: 15px;
          border-radius: 5px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .total {
          background: #f5f0e8;
          padding: 20px;
          margin-top: 25px;
          text-align: right;
          font-size: 22px;
          font-weight: bold;
          color: #9c7844;
        }

        .status {
          display: inline-block;
          color: white;
          background: ${statusColor};
          padding: 8px 16px;
          border-radius: 5px;
          font-weight: bold;
        }

        .footer {
          text-align: center;
          margin-top: 45px;
          border-top: 1px solid #ddd;
          padding-top: 20px;
          color: #777;
          font-size: 12px;
        }

        .print-button {
          display: block;
          margin: 25px auto;
          background: #9c7844;
          color: white;
          padding: 13px 25px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 15px;
        }

        @media print {
          body { padding: 0; }
          .receipt { border: none; padding: 15px; }
          .print-button { display: none; }
        }
      </style>
    </head>

    <body>
      <div class="receipt">

        <div class="header">
          <h1>PARFUM VIDIGAL</h1>
          <p>Perfumaria e fragrâncias</p>
        </div>

        <div class="title">
          <strong>EXTRATO DE VENDA</strong>
        </div>

        <div class="section">
          <h3>Dados do cliente</h3>

          <div class="line">
            <span>Cliente:</span>
            <strong>${escapeReceipt(charge.name)}</strong>
          </div>

          <div class="line">
            <span>WhatsApp:</span>
            <strong>${escapeReceipt(charge.phone)}</strong>
          </div>

          <div class="line">
            <span>Data da venda:</span>
            <strong>${escapeReceipt(charge.createdAt)}</strong>
          </div>
        </div>

        <div class="section">
          <h3>Detalhes da venda</h3>

          <div class="description">${escapeReceipt(
            charge.description || "Venda na Parfum Vidigal"
          )}</div>

          <h3>Perfumes vendidos</h3>

          <div class="description">${escapeReceipt(
            getChargeProducts(charge, getProducts()).map(item =>
              item.product.name + " - " + item.quantity + " unidade(s)"
            ).join("\n") || "Perfumes não informados"
          )}</div>
        </div>

        <div class="total">
          VALOR TOTAL: ${formatPrice(charge.amount)}
        </div>

        <div class="section">
          <h3>Situação do pagamento</h3>
          <span class="status">${status}</span>
        </div>

        <div class="footer">
          <p>PARFUM VIDIGAL</p>
          <p>Obrigado pela preferência!</p>
          <p>Extrato gerado em ${new Date().toLocaleString("pt-BR")}</p>
        </div>

      </div>

      <button class="print-button" onclick="window.print()">
        IMPRIMIR / SALVAR COMO PDF
      </button>

    </body>
    </html>
  `;

  receiptWindow.document.open();
  receiptWindow.document.write(receiptHTML);
  receiptWindow.document.close();
}

// INICIALIZAÇÃO
if (isAuthenticated()) {
  showAdmin();
} else {
  showLogin();
}