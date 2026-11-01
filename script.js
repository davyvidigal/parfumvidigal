import { supabase, money, escapeHTML } from "./store-core.js";

let products = [];
let cart = [];
const searchTermsRecorded = new Set();

async function loadProducts() {
  const { data, error } = await supabase.from("products")
    .select("id,name,price,category,image,stock,description")
    .eq("active", true).order("name");
  if (error) {
    console.error(error);
    document.getElementById("product-list").textContent =
      "Não foi possível carregar os perfumes. Atualize a página ou tente novamente.";
    return;
  }
  products = data || [];
  renderProducts();
}

function registerProductInterest(productId, type) {
  if (!["views", "searches", "clicks"].includes(type)) return;
  // A gravação é compartilhada entre visitantes; a loja continua funcionando se falhar.
  (async () => {
    const { data } = await supabase.from("product_interest")
      .select("views,searches,clicks").eq("product_id", productId).maybeSingle();
    const current = data || { views: 0, searches: 0, clicks: 0 };
    const update = { product_id: productId, views: current.views || 0,
      searches: current.searches || 0, clicks: current.clicks || 0 };
    update[type]++;
    await supabase.from("product_interest").upsert(update, { onConflict: "product_id" });
  })().catch(console.warn);
}

function renderProducts() {
  const searchInput = document.getElementById("search");
  const categoryInput = document.getElementById("category");
  if (!searchInput || !categoryInput) return;
  const search = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const category = categoryInput.value;
  const filtered = products.filter(p =>
    p.name.toLocaleLowerCase("pt-BR").includes(search) &&
    (category === "todos" || p.category === category)
  );
  filtered.forEach(p => registerProductInterest(p.id, "views"));
  if (search.length >= 2 && !searchTermsRecorded.has(search)) {
    searchTermsRecorded.add(search);
    products.filter(p => p.name.toLocaleLowerCase("pt-BR").includes(search))
      .forEach(p => registerProductInterest(p.id, "searches"));
  }
  document.getElementById("product-list").innerHTML = filtered.map(p => `
    <div class="product-card">
      <img src="${escapeHTML(p.image || "")}" alt="${escapeHTML(p.name)}">
      <h3>${escapeHTML(p.name)}</h3>
      <p>${money(p.price)}</p>
      <button onclick="addToCart(${Number(p.id)})">ADICIONAR AO CARRINHO</button>
    </div>`).join("") || "<p>Nenhum perfume encontrado.</p>";
}

window.addToCart = function(id) {
  const product = products.find(p => Number(p.id) === Number(id));
  if (!product) return;
  registerProductInterest(product.id, "clicks");
  const item = cart.find(p => Number(p.id) === Number(id));
  if (item) item.quantity++;
  else cart.push({ ...product, quantity: 1 });
  updateCart();
};
window.removeFromCart = function(id) {
  cart = cart.filter(p => Number(p.id) !== Number(id));
  updateCart();
};

function updateCart() {
  const count = cart.reduce((s,p) => s + p.quantity, 0);
  const total = cart.reduce((s,p) => s + p.price*p.quantity, 0);
  document.getElementById("cart-count").textContent = count;
  document.getElementById("cart-total").textContent = money(total);
  document.getElementById("cart-items").innerHTML = cart.map(p => `
    <div class="cart-item">
      <div><strong>${escapeHTML(p.name)}</strong><p>${p.quantity}x ${money(p.price)}</p></div>
      <button onclick="removeFromCart(${Number(p.id)})">Remover</button>
    </div>`).join("") || "<p>Seu carrinho está vazio.</p>";
}
window.toggleCart = function() {
  document.getElementById("cart").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
};
window.checkout = function() {
  if (!cart.length) return alert("Adicione algum perfume ao carrinho!");
  const items = cart.map(p => `${p.name} - ${p.quantity}x - ${money(p.price*p.quantity)}`).join("\n");
  const total = cart.reduce((s,p) => s + p.price*p.quantity, 0);
  const msg = `Olá! Gostaria de fazer um pedido na PARFUM VIDIGAL:\n\n${items}\n\nTotal: ${money(total)}`;
  window.open(`https://wa.me/5527998908720?text=${encodeURIComponent(msg)}`, "_blank");
};

document.getElementById("search")?.addEventListener("input", renderProducts);
document.getElementById("category")?.addEventListener("change", renderProducts);
loadProducts();
updateCart();
