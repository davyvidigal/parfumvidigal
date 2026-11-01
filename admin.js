import { supabase, money, escapeHTML } from "./store-core.js";

const $ = id => document.getElementById(id);
let products = [];
let charges = [];
let editingImage = "";

function message(id, text, ok=false) { $(id).textContent=text; $(id).style.color=ok?"#18733b":"#b3261e"; }
function showApp(user) {
  $("login").classList.toggle("hidden",!!user);
  $("app").classList.toggle("hidden",!user);
  $("logout").classList.toggle("hidden",!user);
}
async function isAdmin() {
  const {data:{user}} = await supabase.auth.getUser();
  if (!user) return false;
  const {data,error} = await supabase.from("admin_users").select("user_id").eq("user_id",user.id).maybeSingle();
  if (error || !data) { await supabase.auth.signOut(); message("login-msg","Usuário não autorizado como administrador."); return false; }
  return true;
}
async function refresh() {
  const ok=await isAdmin(); showApp(ok); if(!ok)return;
  const [p,c] = await Promise.all([
    supabase.from("products").select("*").order("name"),
    supabase.from("charges").select("*").order("created_at",{ascending:false})
  ]);
  if(p.error) return message("product-msg",p.error.message);
  if(c.error) return message("charge-msg",c.error.message);
  products=p.data||[]; charges=c.data||[];
  renderProducts(); renderCharges(); renderInterest();
}
$("login-form").addEventListener("submit",async e=>{
  e.preventDefault(); message("login-msg","Entrando...",true);
  const {error}=await supabase.auth.signInWithPassword({email:$("email").value,password:$("password").value});
  if(error)return message("login-msg","Falha no login: "+error.message);
  if(!(await isAdmin()))return;
  message("login-msg","Login realizado.",true); await refresh();
});
$("logout").addEventListener("click",async()=>{await supabase.auth.signOut();showApp(false);});
function renderProducts(){
  $("products").innerHTML=products.map(p=>`<article class="card">
    <img src="${escapeHTML(p.image||"")}" alt="${escapeHTML(p.name)}">
    <h3>${escapeHTML(p.name)}</h3><p>${money(p.price)} · Estoque: ${p.stock}</p>
    <p>${escapeHTML(p.category)}</p>
    <button data-edit="${p.id}">EDITAR</button><button class="danger" data-delete="${p.id}">EXCLUIR</button>
  </article>`).join("")||"<p>Nenhum produto cadastrado.</p>";
  $("products").querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>editProduct(Number(b.dataset.edit)));
  $("products").querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>deleteProduct(Number(b.dataset.delete)));
}
function editProduct(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  $("product-id").value=p.id;$("name").value=p.name;$("price").value=p.price;
  $("category").value=p.category;$("stock").value=p.stock;$("description").value=p.description||"";
  editingImage=p.image||"";$("preview").src=editingImage;$("preview").style.display=editingImage?"block":"none";
  $("form-title").textContent="Editar perfume";$("cancel").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});
}
$("cancel").onclick=()=>{$("product-form").reset();$("product-id").value="";editingImage="";$("preview").style.display="none";$("form-title").textContent="Cadastrar perfume";$("cancel").classList.add("hidden");};
async function uploadImage(file){
  if(!file)return editingImage;
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024)throw Error("Use JPG, PNG ou WEBP de até 5 MB.");
  const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
  const path=`${crypto.randomUUID()}.${ext}`;
  const {error}=await supabase.storage.from("product-images").upload(path,file,{upsert:false,contentType:file.type});
  if(error)throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}
$("product-form").addEventListener("submit",async e=>{
  e.preventDefault();$("save").disabled=true;
  try{
    const image=await uploadImage($("image").files[0]);
    if(!image)throw Error("Selecione uma foto para o perfume.");
    const payload={name:$("name").value.trim(),price:Number($("price").value),category:$("category").value,
      stock:Number($("stock").value),description:$("description").value.trim(),image,active:true,updated_at:new Date().toISOString()};
    const id=$("product-id").value;
    const result=id?await supabase.from("products").update(payload).eq("id",Number(id)):
      await supabase.from("products").insert(payload);
    if(result.error)throw result.error;
    message("product-msg",id?"Produto atualizado para todos os clientes!":"Produto cadastrado para todos os clientes!",true);
    $("product-form").reset();$("product-id").value="";editingImage="";$("preview").style.display="none";
    $("form-title").textContent="Cadastrar perfume";$("cancel").classList.add("hidden");await refresh();
  }catch(err){message("product-msg",err.message||"Erro ao salvar produto.");}
  finally{$("save").disabled=false;}
});
async function deleteProduct(id){
  if(!confirm("Excluir este perfume da loja para todos os visitantes?"))return;
  const {error}=await supabase.from("products").delete().eq("id",id);
  if(error)return message("product-msg",error.message);
  await refresh();message("product-msg","Produto excluído.",true);
}
$("charge-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const payload={customer_name:$("client").value.trim(),phone:$("phone").value.trim(),amount:Number($("amount").value),
    description:$("notes").value.trim(),items:$("items").value.trim(),paid:false};
  const {error}=await supabase.from("charges").insert(payload);
  if(error)return message("charge-msg",error.message);
  $("charge-form").reset();message("charge-msg","Cobrança registrada.",true);await refresh();
});
function renderCharges(){
  const pending=charges.filter(x=>!x.paid).reduce((s,x)=>s+Number(x.amount),0);
  const paid=charges.filter(x=>x.paid).reduce((s,x)=>s+Number(x.amount),0);
  $("pending").textContent=money(pending);$("paid").textContent=money(paid);
  $("charges").innerHTML=charges.map(c=>`<article class="card">
    <h3>${escapeHTML(c.customer_name)}</h3><p>${escapeHTML(c.phone)} · ${money(c.amount)}</p>
    <p>${escapeHTML(c.items||"")} ${escapeHTML(c.description||"")}</p>
    <strong>${c.paid?"PAGO":"PENDENTE"}</strong><br>
    <button data-paid="${c.id}">${c.paid?"MARCAR PENDENTE":"MARCAR PAGO"}</button>
    <button class="danger" data-charge-delete="${c.id}">EXCLUIR</button>
    <button data-whats="${c.id}">COBRAR NO WHATSAPP</button>
  </article>`).join("")||"<p>Nenhuma cobrança.</p>";
  $("charges").querySelectorAll("[data-paid]").forEach(b=>b.onclick=()=>togglePaid(Number(b.dataset.paid)));
  $("charges").querySelectorAll("[data-charge-delete]").forEach(b=>b.onclick=()=>deleteCharge(Number(b.dataset.chargeDelete)));
  $("charges").querySelectorAll("[data-whats]").forEach(b=>b.onclick=()=>whatsapp(Number(b.dataset.whats)));
}
async function togglePaid(id){const c=charges.find(x=>x.id===id);const {error}=await supabase.from("charges").update({paid:!c.paid}).eq("id",id);if(error)return message("charge-msg",error.message);await refresh();}
async function deleteCharge(id){if(!confirm("Excluir esta cobrança?"))return;const {error}=await supabase.from("charges").delete().eq("id",id);if(error)return message("charge-msg",error.message);await refresh();}
function whatsapp(id){const c=charges.find(x=>x.id===id);let n=String(c.phone).replace(/\D/g,"");if(n.length===10||n.length===11)n="55"+n;if(!n.startsWith("55"))return alert("Informe DDD e telefone válidos.");const msg=`Olá, ${c.customer_name}! Aqui é da Parfum Vidigal. Lembramos do pagamento de ${money(c.amount)}. ${c.description||""}`;window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,"_blank");}
async function renderInterest(){
  const {data,error}=await supabase.from("product_interest").select("product_id,views,searches,clicks");
  if(error){$("interest").textContent="Não foi possível carregar os relatórios.";return;}
  const stats=data||[];
  $("interest").innerHTML="<table><thead><tr><th>Produto</th><th>Visualizações</th><th>Pesquisas</th><th>Cliques</th></tr></thead><tbody>"+
    products.map(p=>{const s=stats.find(x=>x.product_id===p.id)||{};return `<tr><td>${escapeHTML(p.name)}</td><td>${s.views||0}</td><td>${s.searches||0}</td><td>${s.clicks||0}</td></tr>`;}).join("")+"</tbody></table>";
}
supabase.auth.onAuthStateChange(()=>setTimeout(refresh,0));
refresh();
