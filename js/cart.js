/* ===== SunnySugarArt – cart.js (localStorage) ===== */
const SSA_CART_KEY = 'ssa_cart';

function getCart(){
  try { return JSON.parse(localStorage.getItem(SSA_CART_KEY)) || []; }
  catch(e){ return []; }
}
function saveCart(cart){ localStorage.setItem(SSA_CART_KEY, JSON.stringify(cart)); updateCartBadge(); }
function clearCart(){ localStorage.removeItem(SSA_CART_KEY); updateCartBadge(); }

function addToCart(item){
  // item = {id,title,image,unitPrice,qty,flavour,packLabel,colourNote}
  const cart = getCart();
  const idx = cart.findIndex(x =>
    x.id===item.id &&
    x.flavour===item.flavour &&
    x.packLabel===item.packLabel &&
    (x.colourNote||"") === (item.colourNote||"")
  );
  if(idx>-1){ cart[idx].qty += item.qty || 1; }
  else { cart.push({...item, qty:item.qty||1}); }
  saveCart(cart);
}

function removeFromCart(index){
  const cart = getCart();
  cart.splice(index,1);
  saveCart(cart);
}

function setQty(index, qty){
  const cart = getCart();
  cart[index].qty = Math.max(1, parseInt(qty||1,10));
  saveCart(cart);
}

function cartSubtotalCents(){
  return getCart().reduce((sum, it)=> sum + (it.unitPrice * it.qty), 0);
}

function formatAUD(cents){
  return new Intl.NumberFormat('en-AU',{style:'currency', currency:'AUD'}).format(cents/100);
}

/* ===== 右上角小購物車徽章 ===== */
function updateCartBadge(){
  const badge = document.querySelector('[data-cart-badge]');
  if(!badge) return;
  const qty = getCart().reduce((s,x)=>s+x.qty,0);
  badge.textContent = qty>0 ? qty : '';
  badge.style.visibility = qty>0 ? 'visible' : 'hidden';
}
document.addEventListener('DOMContentLoaded', updateCartBadge);

/* ===== 匯出全域 ===== */
window.SSA_CART = { getCart, saveCart, addToCart, removeFromCart, setQty, clearCart, cartSubtotalCents, formatAUD };
