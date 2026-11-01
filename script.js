const defaultProducts = [
  {
    id: 1,
    name: "Asad Bourbon",
    price: 370.00,
    category: "masculino",
    image: "https://goldglow.com.br/cdn/shop/files/0083f8eacaca1a6a99b0eb27eb1b8d5a.webp?v=1784690390&width=1024"
  },
  {
    id: 2,
    name: "Club de Nuit Intense Man",
    price: 400.00,
    category: "masculino",
    image: "https://m.media-amazon.com/images/I/61YMRxr1DZL._AC_UF350,350_QL80_.jpg"
  },
  {
    id: 3,
    name: "Asad",
    price: 340.00,
    category: "masculino",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQojK_pCC1pkWBZWLOzPFUoqwXYoFRQfk97C6Z5xKhK6YyknZzbxdixK5NC&s=10"
  },
  {
    id: 4,
    name: "Odyssey Mandarin Sky",
    price: 340.00,
    category: "unissex",
    image: "https://images.tcdn.com.br/img/img_prod/1458875/90_odyssey_mandarin_sky_1_20260326232643_b9997364d805.jpg"
  },
  {
    id: 5,
    name: "His Confession",
    price: 420.00,
    category: "masculino",
    image: "https://cdn.shoppub.io/cdn-cgi/image/w=1000,h=1000,q=80,f=auto/forman/media/uploads/produtos/foto/kigxplcw/48ee02e9-a5e9-463c-867a-c289e8a6ea3e.jpeg"
  },
  {
    id: 6,
    name: "Vulcan Feu",
    price: 450.00,
    category: "unissex",
    image: "https://epocacosmeticos.vteximg.com.br/arquivos/ids/1152648-800-800/17609927102414.jpg?v=638968247392170000"
  },
  {
    id: 7,
    name: "9pm",
    price: 350.00,
    category: "masculino",
    image: "https://goldglow.com.br/cdn/shop/files/2c8a05f2a929ed50d18d506bb3852d11.png?v=1784689489&width=1024"
  },
  {
    id: 8,
    name: "Supremacy Collector's",
    price: 490.00,
    category: "masculino",
    image: "https://www.giraofertas.com.br/wp-content/uploads/2025/03/supremacy-collectors-edition-pour-homme-afnan-4.webp"
  },
  {
    id: 9,
    name: "Yara Rose",
    price: 299.00,
    category: "feminino",
    image: "https://beijonapele.com.br/wp-content/uploads/2025/10/lattafa-yara-elixir-eau-de-parfum-perfume-feminino-6290362346531-bnp-02-800x800.webp"
  }
];

const INTEREST_KEY = "parfumvidigal_product_interest";

let products = JSON.parse(
  localStorage.getItem("parfumvidigal_products") || "null"
) || defaultProducts;

let cart = [];
const searchTermsRecorded = new Set();

const money = value =>
  Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

function getInterestStats() {
  try {
    return JSON.parse(localStorage.getItem(INTEREST_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function registerProductInterest(productId, type) {
  const stats = getInterestStats();
  const key = String(productId);

  if (!stats[key]) {
    stats[key] = {
      views: 0,
      searches: 0,
      clicks: 0
    };
  }

  if (!["views", "searches", "clicks"].includes(type)) return;

  stats[key][type] = (Number(stats[key][type]) || 0) + 1;

  try {
    localStorage.setItem(INTEREST_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn("Não foi possível registrar o interesse do produto.", error);
  }
}

// MOSTRAR PRODUTOS
function renderProducts() {
  const searchInput = document.getElementById("search");
  const categoryInput = document.getElementById("category");

  const search = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const category = categoryInput.value;

  const filtered = products.filter(product =>
    product.name.toLocaleLowerCase("pt-BR").includes(search) &&
    (category === "todos" || product.category === category)
  );

  // Registra visualizações dos produtos exibidos.
  filtered.forEach(product => {
    registerProductInterest(product.id, "views");
  });

  // Registra uma pesquisa por termo digitado.
  if (search.length >= 2 && !searchTermsRecorded.has(search)) {
    searchTermsRecorded.add(search);

    products.forEach(product => {
      if (product.name.toLocaleLowerCase("pt-BR").includes(search)) {
        registerProductInterest(product.id, "searches");
      }
    });
  }

  document.getElementById("product-list").innerHTML =
    filtered.map(product => `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${money(product.price)}</p>
        <button onclick="addToCart(${Number(product.id)})">
          ADICIONAR AO CARRINHO
        </button>
      </div>
    `).join("") || "<p>Nenhum perfume encontrado.</p>";
}

// ADICIONAR AO CARRINHO
function addToCart(id) {
  const product = products.find(p => String(p.id) === String(id));
  if (!product) return;

  registerProductInterest(product.id, "clicks");

  const item = cart.find(p => String(p.id) === String(id));

  if (item) {
    item.quantity++;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  updateCart();
}

// REMOVER DO CARRINHO
function removeFromCart(id) {
  cart = cart.filter(p => String(p.id) !== String(id));
  updateCart();
}

// ATUALIZAR CARRINHO
function updateCart() {
  const count = cart.reduce((sum, p) => sum + p.quantity, 0);

  const total = cart.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  document.getElementById("cart-count").textContent = count;
  document.getElementById("cart-total").textContent = money(total);

  document.getElementById("cart-items").innerHTML =
    cart.map(p => `
      <div class="cart-item">
        <div>
          <strong>${p.name}</strong>
          <p>${p.quantity}x ${money(p.price)}</p>
        </div>
        <button onclick="removeFromCart(${Number(p.id)})">
          Remover
        </button>
      </div>
    `).join("") || "<p>Seu carrinho está vazio.</p>";
}

// ABRIR E FECHAR CARRINHO
function toggleCart() {
  document.getElementById("cart").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

// FINALIZAR COMPRA PELO WHATSAPP
function checkout() {
  if (cart.length === 0) {
    alert("Adicione algum perfume ao carrinho!");
    return;
  }

  const items = cart.map(p =>
    `${p.name} - ${p.quantity}x - ${money(p.price * p.quantity)}`
  ).join("\n");

  const total = cart.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  const message =
    `Olá! Gostaria de fazer um pedido na PARFUMVIDIGAL:\n\n${items}\n\nTotal: ${money(total)}`;

  const whatsapp = "5527998908720";

  window.open(
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

// PESQUISA E FILTROS
document.getElementById("search").addEventListener("input", renderProducts);
document.getElementById("category").addEventListener("change", renderProducts);

// INICIAR LOJA
renderProducts();
updateCart();