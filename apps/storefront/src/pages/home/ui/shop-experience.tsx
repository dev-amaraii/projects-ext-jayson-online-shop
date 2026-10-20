import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import './shop-experience.css'
import {
 ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, CreditCard,
 Headphones, Heart, HelpCircle, Menu, Minus, Package,
 PackageCheck, Plus, Search, ShieldCheck, ShoppingBag, ShoppingCart,
 Sparkles, Star, Store, Tag, Trash2, Truck, UserRound, WalletCards, X,
} from 'lucide-react'
import { ThemeToggle } from '../../../features/theme/ui/theme-toggle'
import { categories, filterProducts, naira, products, type Category, type Product } from '../../../entities/product/model/catalog'
import { connectCartPersistence, useCart } from '../../../features/cart/model/cart-store'
import {
 calculateDemoTotals, createDemoOrder, isDemoContactValid, promoApplies,
 readDemoOrders, readWishlist, writeDemoOrders, writeWishlist, DEMO_PROMO,
 type DemoOrder, type DeliveryMode, type Destination, type PaymentMethod,
} from '../../../features/commerce/model/demo-commerce'
import { demoHref, parseDemoRoute, type DemoPage } from '../../../features/navigation/model/demo-routes'

type Filter = Category | 'All'
type SortMode = 'featured' | 'low' | 'high' | 'name'
type CheckoutStep = 'details' | 'review'
type ContactForm = { fullName: string; email: string; phone: string; address: string }

const allCategories: Filter[] = ['All', ...categories.map(c => c.name)]
const benefits = [
 { Icon: ShieldCheck, heading: 'Selected for your setup', subtitle: 'Demo curated catalogue' },
 { Icon: Truck, heading: 'Delivery preview', subtitle: 'Illustrative nationwide options' },
 { Icon: WalletCards, heading: 'Flexible checkout', subtitle: 'All payments simulated' },
 { Icon: Headphones, heading: 'Human-first support', subtitle: 'Help centre demo' },
]
const faq = [
 {q:'Are these real products and prices?', a:'Not yet. All products, prices and availability are illustrative data for the Jayson Tech client preview.'},
 {q:'Can I make a real payment or place a live order?', a:'No. Checkout only simulates an order in this browser. No payment credentials are requested and no transaction is made.'},
 {q:'What delivery areas are available?', a:'The preview models pickup and delivery to Abuja, Lagos, Port Harcourt and other Nigerian cities. Actual delivery terms are awaiting client confirmation.'},
 {q:'Will my details be sent to the store?', a:'No. Nothing is transmitted to a business backend. The checkout form is not stored; only a mock order ID, items and illustrative totals can be saved to your browser.'},
]

function ProductArt({product, large=false}:{product:Product;large?:boolean}) {
 return <div className={'j-art j-art-'+product.category.toLowerCase()+(large?' j-art-large':'')} aria-label={product.name}>
  <span className="j-orbit j-orbit-one" aria-hidden="true"/>
  <span className="j-orbit j-orbit-two" aria-hidden="true"/>
  <span className="j-product-emoji" role="img" aria-label={product.category}>{product.emoji}</span>
  <span className="j-art-stamp">CONCEPT PRODUCT</span>
 </div>
}

function ProductCard({product,saved,onOpen,onAdd,onSave}:{
 product:Product; saved:boolean; onOpen:()=>void; onAdd:()=>void; onSave:()=>void;
}) {
 return <article className="j-product-card" data-testid={'product-'+product.id}>
  <button className={'j-save'+(saved?' j-saved':'')} type="button"
   aria-label={(saved?'Remove ':'Save ')+product.name+(saved?' from wishlist':' to wishlist')}
   aria-pressed={saved} onClick={onSave}><Heart size={19} fill={saved?'currentColor':'none'}/></button>
  <button className="j-product-image" type="button" aria-label={'View '+product.name} onClick={onOpen}><ProductArt product={product}/></button>
  <div className="j-card-body">
   <span className="j-card-category">{product.category} <span aria-hidden="true">·</span> Demo item</span>
   <button className="j-card-name" type="button" onClick={onOpen}>{product.name}</button>
   <div className="j-card-rating"><Star size={13} fill="currentColor"/> 4.8 <span>(sample rating)</span></div>
   <div className="j-card-bottom"><strong>{naira(product.price)}</strong>
    <button type="button" className="j-card-add" onClick={onAdd} aria-label={'Add '+product.name+' to cart'}><Plus size={18}/><span>Add to Cart</span></button>
   </div>
  </div>
 </article>
}

function SectionHeading({eyebrow,title,action,children}:{
 eyebrow:string; title:string; action?:()=>void; children?:ReactNode;
}) {
 return <div className="j-section-heading"><div><span className="j-kicker">{eyebrow}</span><h2>{title}</h2></div>
  {action&&<button className="j-text-action" type="button" onClick={action}>{children||'View all'} <ArrowRight size={16}/></button>}</div>
}

function DemoStepper({step=0}:{step?:number}) {
 const stages = ['Placed','Preparing','On the way','Delivered']
 return <div className="j-tracker" aria-label="Example delivery progress">
  {stages.map((stage,i)=><div key={stage} className={'j-tracker-item'+(i<=step?' j-done':'')}>
   <div className="j-tracker-dot">{i<=step?<Check size={15}/>:i+1}</div>
   <span>{stage}</span>
  </div>)}
 </div>
}

function CartRows({items,onAdjust,onRemove}:{
 items:Record<string,number>; onAdjust:(id:string,delta:number)=>void;onRemove:(id:string)=>void;
}) {
 return <div className="j-cart-rows">
  {products.filter(p=>items[p.id]>0).map(product=><div className="j-cart-row" key={product.id}>
   <div className="j-mini-art">{product.emoji}</div>
   <div className="j-cart-description"><strong>{product.name}</strong><span>{product.category} · Demo catalogue</span>
    <button type="button" className="j-link-muted" aria-label={'Remove '+product.name} onClick={()=>onRemove(product.id)}><Trash2 size={14}/> Remove</button>
   </div>
   <div className="j-cart-adjust"><strong>{naira(product.price*(items[product.id]||0))}</strong>
    <div className="j-quantity"><button type="button" aria-label={'Decrease '+product.name+' quantity'} onClick={()=>onAdjust(product.id,-1)}><Minus size={15}/></button>
    <span aria-label={'Quantity '+(items[product.id]||0)}>{items[product.id]}</span>
    <button type="button" aria-label={'Increase '+product.name+' quantity'} onClick={()=>onAdjust(product.id,1)} disabled={items[product.id]>=99}><Plus size={15}/></button></div>
   </div>
  </div>)}
 </div>
}

function Totals({subtotal,discount,delivery,total}:{
 subtotal:number;discount:number;delivery:number;total:number;
}) {
 return <div className="j-totals">
  <div><span>Products</span><strong>{naira(subtotal)}</strong></div>
  <div><span>Preview discount</span><strong>{discount?'-'+naira(discount):naira(0)}</strong></div>
  <div><span>Estimated delivery</span><strong>{delivery?naira(delivery):'Free'}</strong></div>
  <div className="j-total-final"><span>Illustrative total</span><strong>{naira(total)}</strong></div>
 </div>
}

export function ShopExperience() {
 const [page,setPage] = useState<DemoPage>({name:'home'})
 const [hydrated,setHydrated] = useState(false)
 const [menuOpen,setMenuOpen] = useState(false)
 const [search,setSearch] = useState('')
 const [category,setCategory] = useState<Filter>('All')
 const [sort,setSort] = useState<SortMode>('featured')
 const [wishlist,setWishlist] = useState<string[]>([])
 const [orders,setOrders] = useState<DemoOrder[]>([])
 const [promo,setPromo] = useState('')
 const [destination,setDestination] = useState<Destination>('Abuja')
 const [deliveryMode,setDeliveryMode] = useState<DeliveryMode>('standard')
 const [paymentMethod,setPaymentMethod] = useState<PaymentMethod>('transfer')
 const [checkoutStep,setCheckoutStep] = useState<CheckoutStep>('details')
 const [contact,setContact] = useState<ContactForm>({fullName:'Demo Customer',email:'demo@example.com',phone:'08000000000',address:'Sample delivery address only'})
 const [validation,setValidation] = useState('')
 const [quantity,setQuantity] = useState(1)
 const [trackingStage,setTrackingStage] = useState(0)
 const [toast,setToast] = useState('')
 const {items,add,change,clear} = useCart()

 useEffect(()=>{
  let unsubscribe:(()=>void)|undefined
  try {
   const storage=window.localStorage
   unsubscribe=connectCartPersistence(storage)
   setWishlist(readWishlist(storage))
   setOrders(readDemoOrders(storage))
  } catch { /* Local storage can be blocked by privacy settings. */ }
  setHydrated(true)
  return ()=>unsubscribe?.()
 },[])
 useEffect(()=>{if(!hydrated)return;try{writeWishlist(window.localStorage,wishlist)}catch{}},[wishlist,hydrated])
 useEffect(()=>{
  const update=()=>{setPage(parseDemoRoute(window.location.hash));window.scrollTo({top:0,behavior:'instant'})}
  update()
  window.addEventListener('hashchange',update)
  return ()=>window.removeEventListener('hashchange',update)
 },[])
 useEffect(()=>{
  if(!toast)return
  const id=window.setTimeout(()=>setToast(''),2700)
  return ()=>window.clearTimeout(id)
 },[toast])
 useEffect(()=>{
  if(!menuOpen)return
  const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setMenuOpen(false)}
  window.addEventListener('keydown',close)
  return ()=>window.removeEventListener('keydown',close)
 },[menuOpen])

 const go=(next:DemoPage)=>{
  setPage(next)
  setMenuOpen(false)
  if (typeof window!=='undefined') {
   const hash=demoHref(next)
   if(window.location.hash!==hash) window.location.hash=hash
   window.scrollTo({top:0,behavior:'smooth'})
  }
 }
 const goShop=(next:Filter='All')=>{setCategory(next);setSearch('');go({name:'shop'})}
 const showToast=(value:string)=>setToast(value)
 const toggleSaved=(id:string)=>{
  const wasSaved=wishlist.includes(id)
  setWishlist(current=>wasSaved?current.filter(x=>x!==id):[...current,id])
  showToast(wasSaved?'Removed from saved items':'Saved for later')
 }
 const addItem=(id:string,amount=1)=>{
  for(let i=0;i<amount;i++) add(id)
  showToast('Added to your demo cart')
  go({name:'cart'})
 }
 const changeItem=(id:string,delta:number)=>change(id,delta)
 const cartCount=Object.values(items).reduce((sum,n)=>sum+n,0)
 const totals=calculateDemoTotals(items,promo,destination,deliveryMode)
 const visibleProducts=useMemo(()=>{
  const selected=filterProducts(category,search)
  if(sort==='low')return [...selected].sort((a,b)=>a.price-b.price)
  if(sort==='high')return [...selected].sort((a,b)=>b.price-a.price)
  if(sort==='name')return [...selected].sort((a,b)=>a.name.localeCompare(b.name))
  return selected
 },[category,search,sort])
 const detail=page.name==='product'?products.find(p=>p.id===page.id):undefined
 const order=page.name==='order'?orders.find(o=>o.id===page.id):undefined
 const savedProducts=products.filter(p=>wishlist.includes(p.id))
 const renderCard=(p:Product)=><ProductCard key={p.id} product={p} saved={wishlist.includes(p.id)}
  onOpen={()=>{setQuantity(1);go({name:'product',id:p.id})}}
  onAdd={()=>addItem(p.id)} onSave={()=>toggleSaved(p.id)}/>
 const onSearch=(value:string)=>{setSearch(value);setCategory('All');if(page.name!=='shop')go({name:'shop'})}
 const onReview=(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault()
  if(contact.fullName.trim().length<2||!isDemoContactValid(contact.email,contact.phone)||
   (deliveryMode!=='pickup'&&contact.address.trim().length<5)){
   setValidation('Please complete the sample name, valid email, phone and delivery address.')
   return
  }
  setValidation('')
  setCheckoutStep('review')
  window.scrollTo({top:0,behavior:'smooth'})
 }
 const placeDemoOrder=()=>{
  if(!cartCount)return
  try {
   const created=createDemoOrder(items,destination,deliveryMode,paymentMethod,promo)
   const next=[created,...orders].slice(0,20)
   setOrders(next)
   try{writeDemoOrders(window.localStorage,next)}catch{}
   clear()
   setCheckoutStep('details')
   setPromo('')
   setTrackingStage(0)
   showToast('Simulation saved — no payment or live order')
   go({name:'order',id:created.id})
  }catch{setValidation('Unable to create this demo order. Please check the cart and try again.')}
 }
 const startCheckout=()=>{setCheckoutStep('details');setValidation('');go({name:'checkout'})}

 return <div className="j-site">
  <header className="j-header">
   <div className="j-container j-header-inner">
    <button type="button" className="j-menu-toggle" aria-label="Open navigation menu" onClick={()=>setMenuOpen(true)}><Menu size={23}/></button>
    <button type="button" className="j-logo" onClick={()=>go({name:'home'})}>JAYSON<span>TECH</span><small>GADGETS & MORE</small></button>
    <nav className="j-header-links" aria-label="Primary">
     <button className={page.name==='home'?'j-active':''} onClick={()=>go({name:'home'})}>Home</button>
     <button className={page.name==='shop'||page.name==='product'?'j-active':''} onClick={()=>goShop()}>Shop</button>
     <button className={page.name==='wishlist'?'j-active':''} onClick={()=>go({name:'wishlist'})}>Wishlist</button>
     <button className={page.name==='orders'||page.name==='order'?'j-active':''} onClick={()=>go({name:'orders'})}>Orders</button>
    </nav>
    <div className="j-header-search"><Search size={18}/><input aria-label="Search products" placeholder="Search gadgets..." value={search} onChange={e=>onSearch(e.target.value)}/>
     {search&&<button type="button" aria-label="Clear search" onClick={()=>setSearch('')}><X size={15}/></button>}
    </div>
    <div className="j-header-actions">
     <ThemeToggle/>
     <button type="button" title="Saved items" aria-label="Open wishlist" onClick={()=>go({name:'wishlist'})}><Heart size={21}/>{wishlist.length>0&&<span className="j-action-count">{wishlist.length}</span>}</button>
     <button type="button" title="Demo account" aria-label="Open account" onClick={()=>go({name:'account'})}><UserRound size={21}/></button>
     <button type="button" title="Shopping cart" className="j-cart-header" aria-label="Open cart" onClick={()=>go({name:'cart'})}><ShoppingCart size={22}/><span className="j-action-count">{cartCount}</span></button>
    </div>
   </div>
   <div className="j-category-bar"><div className="j-container">
    <button type="button" className="j-all-categories" onClick={()=>goShop()}><Menu size={15}/> All categories</button>
    {categories.map(c=><button key={c.name} type="button" onClick={()=>goShop(c.name)}>{c.name}</button>)}
    <button type="button" className="j-category-help" onClick={()=>go({name:'help'})}><HelpCircle size={14}/> Help centre</button>
   </div></div>
  </header>

  <main className="j-container j-main" data-testid={hydrated?'storefront-hydrated':undefined}>
   {page.name==='home'&&<div className="j-page-enter">
    <section className="j-hero">
     <div className="j-hero-copy">
      <span className="j-hero-eyebrow"><Sparkles size={16}/> Explore the new Jayson Tech</span>
      <h1>Your Everyday <em>Gadget Store.</em></h1>
      <p>All the tech essentials you love, in one convenient place. Explore the complete interactive store experience.</p>
      <div className="j-hero-actions"><button className="j-primary" onClick={()=>goShop()}>Explore gadgets <ArrowRight size={18}/></button>
       <button className="j-hero-secondary" onClick={()=>go({name:'help'})}>How the preview works <ChevronRight size={17}/></button></div>
      <div className="j-hero-stats"><span><strong>12</strong> demo products</span><span><strong>6</strong> categories</span><span><strong>100%</strong> simulated</span></div>
     </div>
     <div className="j-hero-art" aria-hidden="true"><span className="j-hero-glow"/><span className="j-hero-emoji j-e1">🎧</span><span className="j-hero-emoji j-e2">📱</span><span className="j-hero-emoji j-e3">⌚</span><span className="j-hero-pill">SHOP SMARTER <Sparkles size={15}/></span></div>
    </section>
    <section className="j-benefit-strip">{benefits.map(({Icon,heading,subtitle})=><div key={heading}><Icon size={25}/><span><strong>{heading}</strong><small>{subtitle}</small></span></div>)}</section>
    <section className="j-section">
     <SectionHeading eyebrow="DISCOVER" title="Shop by category" action={()=>goShop()}>See all products</SectionHeading>
     <div className="j-categories">{categories.map(cat=><button type="button" className="j-category-tile" key={cat.name} onClick={()=>goShop(cat.name)}>
      <div className={'j-category-symbol j-art-'+cat.name.toLowerCase()}>{cat.emoji}</div><span>{cat.name}</span><ChevronRight size={16}/></button>)}</div>
    </section>
    <section className="j-promo-grid">
     <div className="j-promo j-promo-a"><div><span>THE SOUND EDIT</span><h2>Great sound.<br/>Better days.</h2><p>Discover headphones, earbuds and speakers.</p><button type="button" onClick={()=>goShop('Audio')}>Shop Audio <ArrowRight size={17}/></button></div><span className="j-promo-emoji">🎧</span></div>
     <div className="j-promo j-promo-b"><div><span>STAY CHARGED</span><h2>Power for every<br/>moment.</h2><p>Chargers and batteries made for the move.</p><button type="button" onClick={()=>goShop('Power')}>Shop Power <ArrowRight size={17}/></button></div><span className="j-promo-emoji">🔋</span></div>
    </section>
    <section className="j-section" id="products"><SectionHeading eyebrow="CURATED FINDS" title="Popular Products" action={()=>goShop()}>Browse all</SectionHeading>
     <div className="j-product-grid">{products.slice(0,8).map(renderCard)}</div>
    </section>
    <section className="j-feature-cta"><div><Tag size={30}/><h2>Try a complete shopping journey.</h2><p>Add items, apply <strong>{DEMO_PROMO}</strong>, choose delivery, and place a completely simulated order.</p></div>
     <button className="j-primary" type="button" onClick={()=>goShop()}>Start exploring <ArrowRight size={18}/></button></section>
   </div>}

   {page.name==='shop'&&<div className="j-page-enter">
    <div className="j-page-top"><span className="j-kicker">THE CATALOGUE</span><h1>Find your next favourite gadget</h1><p>Explore illustrative product listings across six categories.</p></div>
    <div className="j-shop-layout">
     <aside className="j-shop-sidebar"><h3>Categories</h3>{allCategories.map(c=><button type="button" key={c} className={category===c?'j-current':''} onClick={()=>setCategory(c)}>{c}<span>{c==='All'?products.length:products.filter(p=>p.category===c).length}</span></button>)}
      <div className="j-shop-note"><Sparkles size={18}/><strong>Client preview</strong><p>Everything shown here is sample data, not real stock.</p></div>
     </aside>
     <section className="j-shop-results" aria-label="Product results"><div className="j-shop-toolbar">
      <div><strong>{visibleProducts.length} products</strong><span>{category==='All'?'All categories':category}{search?' · Search: '+search:''}</span></div>
      <label>Sort by <select aria-label="Sort products" value={sort} onChange={e=>setSort(e.target.value as SortMode)}>
       <option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name A–Z</option>
      </select></label></div>
      <div className="j-filter-scroll" aria-label="Filter products by category">{allCategories.map(c=><button type="button" key={c} onClick={()=>setCategory(c)} className={category===c?'j-selected':''}>{c}</button>)}</div>
      {visibleProducts.length?<div className="j-product-grid">{visibleProducts.map(renderCard)}</div>:<div className="j-empty" role="status"><Search size={38}/><h2>No matching products</h2><p>No matching products. Try a different search or category.</p><button type="button" className="j-primary" onClick={()=>{setCategory('All');setSearch('');setSort('featured')}}>Clear filters</button></div>}
     </section>
    </div>
   </div>}

   {page.name==='product'&&detail&&<div className="j-page-enter">
    <div className="j-breadcrumb"><button type="button" onClick={()=>goShop()}>Shop</button><ChevronRight size={14}/><button type="button" onClick={()=>goShop(detail.category)}>{detail.category}</button><ChevronRight size={14}/><span>{detail.name}</span></div>
    <div className="j-detail-grid"><div className="j-detail-art"><ProductArt product={detail} large/><div className="j-detail-thumbs">{[0,1,2].map(n=><span key={n} className="j-thumb">{detail.emoji}</span>)}</div></div>
     <div className="j-detail-copy"><span className="j-kicker">{detail.category.toUpperCase()} COLLECTION · SAMPLE PRODUCT</span><h1>{detail.name}</h1>
      <div className="j-rating"><Star size={18} fill="currentColor"/> 4.8 <span>Sample rating · No customer reviews collected</span></div>
      <div className="j-detail-price">{naira(detail.price)}<span>Illustrative price</span></div>
      <p className="j-detail-description">{detail.description} Experience this example product detail page with working quantities, saving and cart actions.</p>
      <ul className="j-spec-list"><li><CheckCircle2 size={17}/> Curated gadget selection</li><li><CheckCircle2 size={17}/> Demo delivery options at checkout</li><li><CheckCircle2 size={17}/> No actual stock or payment</li></ul>
      <div className="j-detail-actions"><div className="j-quantity j-quantity-lg">
       <button type="button" aria-label="Decrease product quantity" disabled={quantity<=1} onClick={()=>setQuantity(q=>Math.max(1,q-1))}><Minus size={18}/></button>
       <span>{quantity}</span>
       <button type="button" aria-label="Increase product quantity" disabled={quantity>=99} onClick={()=>setQuantity(q=>Math.min(99,q+1))}><Plus size={18}/></button></div>
       <button className="j-primary j-product-buy" type="button" aria-label={'Add '+detail.name+' x '+quantity+' to cart'} onClick={()=>addItem(detail.id,quantity)}><ShoppingCart size={18}/> Add to Cart</button>
       <button className={'j-detail-save'+(wishlist.includes(detail.id)?' j-saved':'')} type="button" onClick={()=>toggleSaved(detail.id)} aria-label={wishlist.includes(detail.id)?'Remove from wishlist':'Save to wishlist'}><Heart size={20} fill={wishlist.includes(detail.id)?'currentColor':'none'}/></button></div>
      <div className="j-detail-disclaimer"><ShieldCheck size={19}/> This item is for demonstration. Nothing can be purchased yet.</div>
     </div>
    </div>
    <section className="j-section"><SectionHeading eyebrow="KEEP EXPLORING" title="You might also like" action={()=>goShop(detail.category)}>View category</SectionHeading>
     <div className="j-product-grid">{products.filter(p=>p.category===detail.category&&p.id!==detail.id).concat(products.filter(p=>p.category!==detail.category)).slice(0,4).map(renderCard)}</div></section>
   </div>}

   {page.name==='wishlist'&&<div className="j-page-enter">
    <div className="j-page-top"><span className="j-kicker">JUST FOR YOU</span><h1>Saved items <span className="j-subtle-count">({wishlist.length})</span></h1><p>Keep track of products you like on this device.</p></div>
    {savedProducts.length?<><div className="j-product-grid">{savedProducts.map(renderCard)}</div><div className="j-back-bar"><button className="j-text-action" onClick={()=>goShop()}><ArrowLeft size={16}/> Continue shopping</button></div></>:
    <div className="j-empty"><Heart size={43}/><h2>Nothing saved yet</h2><p>Tap the heart on any item to add it to your wishlist.</p><button type="button" className="j-primary" onClick={()=>goShop()}>Explore products <ArrowRight size={17}/></button></div>}
   </div>}

   {page.name==='cart'&&<div className="j-page-enter">
    <div className="j-page-top"><span className="j-kicker">YOUR BAG</span><h1>Your Cart ({cartCount})</h1><p>Make changes before trying out our simulated checkout.</p></div>
    {cartCount?<div className="j-checkout-layout"><div className="j-panel"><div className="j-panel-title"><h2>Cart items</h2><button type="button" className="j-link-muted" onClick={()=>{clear();showToast('Demo cart cleared')}}><Trash2 size={16}/> Clear cart</button></div>
     <CartRows items={items} onAdjust={changeItem} onRemove={id=>change(id,-(items[id]||0))}/>
     <button type="button" className="j-text-action j-continue" onClick={()=>goShop()}><ArrowLeft size={16}/> Continue shopping</button></div>
     <aside className="j-panel j-order-sidebar"><h2>Order summary</h2>
      <label className="j-field"><span>Promo code</span><div className="j-promo-input"><Tag size={17}/><input aria-label="Promo code" value={promo} placeholder={DEMO_PROMO} onChange={e=>setPromo(e.target.value)}/></div></label>
      <p className={'j-field-helper'+(promo&&!promoApplies(promo)?' j-invalid':'')}>{!promo?'Try '+DEMO_PROMO+' for 10% off (capped at ₦50,000)':promoApplies(promo)?'Demo discount applied!':'This promo code is not active in the demo.'}</p>
      <Totals {...totals}/><button className="j-primary j-full" type="button" onClick={startCheckout}>Continue to demo checkout <ArrowRight size={18}/></button>
      <p className="j-safe-note"><ShieldCheck size={15}/> No payment information or orders are sent.</p></aside>
    </div>:<div className="j-empty"><ShoppingBag size={45}/><h2>Your cart is empty. Add a product to get started.</h2><p>Discover something exciting from our gadget collection.</p><button type="button" className="j-primary" onClick={()=>goShop()}>Continue shopping <ArrowRight size={17}/></button></div>}
   </div>}

   {page.name==='checkout'&&<div className="j-page-enter">
    <div className="j-page-top"><span className="j-kicker">DEMO CHECKOUT</span><h1>Checkout experience</h1><p>No payments will be processed or personal details retained.</p></div>
    {!cartCount?<div className="j-empty"><ShoppingCart size={42}/><h2>Your cart is empty</h2><p>Add a sample product before trying checkout.</p><button className="j-primary" onClick={()=>goShop()}>Browse products</button></div>:
    <div className="j-checkout-layout"><div className="j-checkout-primary"><div className="j-checkout-steps"><span className={checkoutStep==='details'?'j-step-active':''}><b>1</b> Delivery details</span><span className={checkoutStep==='review'?'j-step-active':''}><b>2</b> Review & confirm</span></div>
     {checkoutStep==='details'?<form className="j-panel j-checkout-form" onSubmit={onReview} noValidate>
      <div className="j-panel-title"><h2>Contact & delivery</h2><span className="j-demo-chip">EXAMPLE ONLY</span></div>
      <p className="j-form-notice">Use the prefilled sample data. Do not enter your real name, contact details or address.</p>
      <div className="j-form-grid"><label className="j-field"><span>Full name</span><input autoComplete="off" value={contact.fullName} onChange={e=>setContact(c=>({...c,fullName:e.target.value}))} aria-label="Full name"/></label>
       <label className="j-field"><span>Email address</span><input type="email" autoComplete="off" value={contact.email} onChange={e=>setContact(c=>({...c,email:e.target.value}))} aria-label="Email address"/></label>
       <label className="j-field"><span>Phone number</span><input type="tel" autoComplete="off" value={contact.phone} onChange={e=>setContact(c=>({...c,phone:e.target.value}))} aria-label="Phone number"/></label>
       <label className="j-field"><span>Delivery city</span><select aria-label="Delivery city" value={destination} onChange={e=>setDestination(e.target.value as Destination)}>
        <option>Abuja</option><option>Lagos</option><option>Port Harcourt</option><option>Other cities</option></select></label></div>
      <label className="j-field"><span>Address (sample text only)</span><textarea rows={2} aria-label="Delivery address" autoComplete="off" value={contact.address} onChange={e=>setContact(c=>({...c,address:e.target.value}))}/></label>
      <h3>Delivery method</h3><div className="j-option-grid">{([
       {id:'pickup',label:'Store pickup',desc:'Free · location to be confirmed',Icon:Store},
       {id:'standard',label:'Standard delivery',desc:'Illustrative local estimate',Icon:Truck},
       {id:'express',label:'Express delivery',desc:'Illustrative expedited rate',Icon:PackageCheck},
      ] as const).map(({id,label,desc,Icon})=><label key={id} className={'j-select-card'+(deliveryMode===id?' j-chosen':'')}>
       <input type="radio" name="delivery" value={id} checked={deliveryMode===id} onChange={()=>setDeliveryMode(id)}/><Icon size={21}/><strong>{label}</strong><small>{desc}</small></label>)}</div>
      <h3>Simulated payment method</h3><p className="j-fine">These options are interactive only. No card number, bank details or money will be requested.</p>
      <div className="j-option-grid">{([
       {id:'transfer',label:'Bank transfer',desc:'Demo confirmation only',Icon:WalletCards},
       {id:'card',label:'Card',desc:'No card details required',Icon:CreditCard},
       {id:'delivery',label:'Pay on delivery',desc:'No actual delivery',Icon:Truck},
      ] as const).map(({id,label,desc,Icon})=><label key={id} className={'j-select-card'+(paymentMethod===id?' j-chosen':'')}>
       <input type="radio" name="payment" value={id} checked={paymentMethod===id} onChange={()=>setPaymentMethod(id)}/><Icon size={21}/><strong>{label}</strong><small>{desc}</small></label>)}</div>
      {validation&&<div className="j-validation" role="alert">{validation}</div>}
      <button className="j-primary j-full" type="submit">Review demo order <ArrowRight size={18}/></button>
     </form>:<div className="j-panel j-review"><div className="j-panel-title"><h2>Review your demo order</h2><span className="j-demo-chip">NO CHARGE</span></div>
      <p>Confirm the simulated purchase below. Creating a demo order will clear the cart and show a mock receipt and tracking view.</p>
      <div className="j-review-data"><div><span>Example contact</span><strong>{contact.fullName}</strong><small>Contact details are not saved</small></div>
       <div><span>Delivery</span><strong>{deliveryMode==='pickup'?'Store pickup':deliveryMode==='express'?'Express delivery':'Standard delivery'}</strong><small>{destination} (illustrative)</small></div>
       <div><span>Payment</span><strong>{paymentMethod==='card'?'Mock card':paymentMethod==='delivery'?'Mock pay on delivery':'Mock bank transfer'}</strong><small>No payment will occur</small></div></div>
      <CartRows items={items} onAdjust={changeItem} onRemove={id=>change(id,-(items[id]||0))}/>
      <button type="button" className="j-primary j-full" onClick={placeDemoOrder}><CheckCircle2 size={19}/> Place demo order (no payment)</button>
      <button className="j-text-action j-continue" onClick={()=>setCheckoutStep('details')}><ArrowLeft size={16}/> Edit details</button>
     </div>}
    </div><aside className="j-panel j-order-sidebar"><h2>Order summary</h2><span className="j-demo-chip">SIMULATION</span>
     <p className="j-fine">Items: {cartCount} · Destination: {destination}</p>
     <Totals {...totals}/><p className="j-safe-note"><ShieldCheck size={16}/> No real transaction, payment gateway or fulfilment.</p>
    </aside></div>}
   </div>}

   {page.name==='order'&&order&&<div className="j-page-enter">
    <div className="j-confirm-hero"><div className="j-confirm-icon"><Check size={34}/></div><span className="j-kicker">SIMULATION COMPLETE</span><h1>Demo order confirmed!</h1>
     <p>Your preview shopping journey is complete. Nothing was purchased, paid for or sent to a store.</p><div className="j-demo-chip">DEMO ORDER · {order.id}</div></div>
    <div className="j-checkout-layout"><section className="j-panel"><div className="j-panel-title"><h2>Example tracking</h2><span className="j-demo-chip">INTERACTIVE ONLY</span></div>
     <p className="j-fine">Tap below to simulate the next stage. These statuses do not reflect any actual shipment.</p>
     <DemoStepper step={trackingStage}/>
     <div className="j-tracker-actions"><button type="button" className="j-outline" onClick={()=>setTrackingStage(0)}>Reset example</button>
      <button type="button" className="j-primary" onClick={()=>setTrackingStage(s=>Math.min(s+1,3))} disabled={trackingStage===3}>Preview next step <ArrowRight size={16}/></button></div>
     <div className="j-panel-title"><h2>Order items</h2></div>
     <div className="j-receipt-items">{products.filter(p=>order.items[p.id]).map(p=><div key={p.id}><span>{p.emoji} {p.name} × {order.items[p.id]}</span><strong>{naira(p.price*(order.items[p.id]||0))}</strong></div>)}</div>
    </section><aside className="j-panel j-order-sidebar"><h2>Mock receipt</h2><div className="j-receipt-meta"><span>Reference</span><strong>{order.id}</strong><span>Created</span><strong>{new Date(order.createdAt).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</strong><span>Destination</span><strong>{order.destination}</strong></div>
     <Totals subtotal={order.subtotal} discount={order.discount} delivery={order.delivery} total={order.total}/>
     <p className="j-safe-note"><ShieldCheck size={16}/> Sample receipt. No payment or real order.</p>
     <button className="j-primary j-full" onClick={()=>go({name:'orders'})}>View demo orders <ArrowRight size={17}/></button>
     <button className="j-outline j-full" onClick={()=>goShop()}>Shop again</button>
    </aside></div>
   </div>}

   {page.name==='order'&&!order&&<div className="j-page-enter j-empty"><Package size={40}/><h1>Demo order not found</h1><p>This browser doesn't have that simulated order saved.</p><button className="j-primary" onClick={()=>go({name:'orders'})}>Go to demo orders</button></div>}

   {page.name==='orders'&&<div className="j-page-enter">
    <div className="j-page-top"><span className="j-kicker">YOUR LOCAL HISTORY</span><h1>Demo orders</h1><p>These are only example orders saved in this browser. No business system receives them.</p></div>
    {orders.length?<div className="j-order-list">{orders.map(o=><article key={o.id} className="j-order-card">
     <div className="j-order-card-head"><div><span className="j-demo-chip">SIMULATED</span><h2>{o.id}</h2><small>{new Date(o.createdAt).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})} · {o.destination}</small></div>
      <strong>{naira(o.total)}</strong></div>
     <div className="j-order-product-strip">{products.filter(p=>o.items[p.id]).slice(0,4).map(p=><span key={p.id}>{p.emoji} {p.name} × {o.items[p.id]}</span>)}</div>
     <button className="j-text-action" onClick={()=>{setTrackingStage(0);go({name:'order',id:o.id})}}>View mock receipt & tracking <ArrowRight size={16}/></button>
    </article>)}</div>:
    <div className="j-empty"><Package size={45}/><h2>No demo orders yet</h2><p>Try the simulated checkout to create your first example order.</p><button className="j-primary" onClick={()=>goShop()}>Start shopping <ArrowRight size={17}/></button></div>}
   </div>}

   {page.name==='account'&&<div className="j-page-enter">
    <div className="j-page-top"><span className="j-kicker">EXAMPLE CUSTOMER HUB</span><h1>My account preview</h1><p>This is how a customer profile could look. Real sign-in and accounts are not active.</p></div>
    <div className="j-account-layout"><section className="j-panel j-profile"><div className="j-avatar"><UserRound size={40}/></div><div><span className="j-demo-chip">DEMO PROFILE</span><h2>Demo Customer</h2><p>demo@example.com</p><p className="j-fine">Sample identity · Not an authenticated account</p></div></section>
     <section className="j-account-actions">
      <button className="j-account-tile" data-testid="account-orders" onClick={()=>go({name:'orders'})}><Package size={26}/><strong>Orders</strong><span>{orders.length} example order(s)</span><ArrowRight size={20}/></button>
      <button className="j-account-tile" onClick={()=>go({name:'wishlist'})}><Heart size={26}/><strong>Saved items</strong><span>{wishlist.length} saved product(s)</span><ArrowRight size={20}/></button>
      <button className="j-account-tile" onClick={()=>go({name:'help'})}><HelpCircle size={26}/><strong>Help centre</strong><span>FAQs and preview information</span><ArrowRight size={20}/></button>
     </section></div>
    <div className="j-feature-cta j-account-banner"><div><ShieldCheck size={26}/><h2>Customer accounts are coming later.</h2><p>Profile editing, authentication and actual order syncing will be integrated after backend development.</p></div><button className="j-outline" onClick={()=>goShop()}>Browse catalogue</button></div>
   </div>}

   {page.name==='help'&&<div className="j-page-enter">
    <div className="j-page-top"><span className="j-kicker">HERE TO HELP</span><h1>Help & preview guide</h1><p>Answers about the Jayson Tech demonstration and what the final store will support.</p></div>
    <div className="j-help-grid"><div className="j-help-feature"><Truck size={28}/><h2>Delivery options</h2><p>Try simulated pickup, standard and express rates during checkout.</p></div>
     <div className="j-help-feature"><CreditCard size={28}/><h2>Payments</h2><p>Preview card, transfer and pay-on-delivery selection without processing money.</p></div>
     <div className="j-help-feature"><ShieldCheck size={28}/><h2>Privacy</h2><p>Your sample contact form is not submitted or saved to an external service.</p></div></div>
    <section className="j-panel j-faq"><h2>Frequently asked questions</h2>{faq.map(({q,a})=><details key={q}><summary>{q}<Plus size={18}/></summary><p>{a}</p></details>)}</section>
    <div className="j-feature-cta"><div><HelpCircle size={27}/><h2>What should we build next?</h2><p>Client feedback on branding, real catalogue, logistics and checkout integration will shape the production release.</p></div><button className="j-primary" onClick={()=>goShop()}>Explore the preview <ArrowRight size={16}/></button></div>
   </div>}
  </main>

  <footer className="j-footer"><div className="j-container j-footer-top">
   <div><button type="button" className="j-logo j-footer-logo" onClick={()=>go({name:'home'})}>JAYSON<span>TECH</span></button><p>Your everyday gadget store — currently an interactive design and journey demonstration.</p></div>
   <div><strong>Explore</strong><button onClick={()=>goShop()}>All products</button><button onClick={()=>go({name:'wishlist'})}>Wishlist</button><button onClick={()=>go({name:'cart'})}>Your cart</button></div>
   <div><strong>Information</strong><button onClick={()=>go({name:'help'})}>Help & FAQs</button><button onClick={()=>go({name:'orders'})}>Demo order history</button><button onClick={()=>go({name:'account'})}>Account preview</button></div>
   <div><strong>Preview notice</strong><p>Illustrative catalogue, pricing, shipping and payments. No live orders, customer accounts or transactions.</p></div>
  </div><div className="j-container j-footer-bottom"><span>© 2026 Jayson Tech · Client preview only</span><span>Powered by NEN</span></div></footer>

  <nav className="j-mobile-tabs" aria-label="Mobile navigation">
   <button className={page.name==='home'?'j-active':''} onClick={()=>go({name:'home'})}><Store size={20}/>Home</button>
   <button className={page.name==='shop'?'j-active':''} onClick={()=>goShop()}><Search size={20}/>Shop</button>
   <button className={page.name==='wishlist'?'j-active':''} onClick={()=>go({name:'wishlist'})}><Heart size={20}/>Saved</button>
   <button className={page.name==='cart'?'j-active':''} onClick={()=>go({name:'cart'})}><ShoppingCart size={20}/>Cart ({cartCount})</button>
   <button className={page.name==='account'?'j-active':''} onClick={()=>go({name:'account'})}><UserRound size={20}/>Account</button>
  </nav>
  {menuOpen&&<div className="j-menu-backdrop" onMouseDown={()=>setMenuOpen(false)}>
   <aside className="j-menu-panel" role="dialog" aria-modal="true" aria-label="Store navigation" onMouseDown={e=>e.stopPropagation()}>
    <div className="j-menu-panel-head"><strong>Explore Jayson Tech</strong><button type="button" aria-label="Close navigation menu" onClick={()=>setMenuOpen(false)}><X size={21}/></button></div>
    <button onClick={()=>go({name:'home'})}><Store size={18}/> Home</button><button onClick={()=>goShop()}><ShoppingBag size={18}/> All products</button>
    {categories.map(c=><button key={c.name} onClick={()=>goShop(c.name)}><span>{c.emoji}</span> {c.name}</button>)}
    <div className="j-menu-divider"/>
    <button onClick={()=>go({name:'wishlist'})}><Heart size={18}/> Wishlist</button><button onClick={()=>go({name:'orders'})}><Package size={18}/> Demo orders</button><button onClick={()=>go({name:'help'})}><HelpCircle size={18}/> Help centre</button>
   </aside>
  </div>}
  {toast&&<div className="j-toast" role="status"><CheckCircle2 size={19}/>{toast}</div>}
 </div>
}
