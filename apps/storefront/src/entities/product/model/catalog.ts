export type Category = 'Phones'|'Audio'|'Chargers'|'Power'|'Cases'|'Accessories'
export type Product = {id:string;name:string;price:number;category:Category;emoji:string;description:string}
export const products:Product[]=[
{id:'headphones',name:'Wireless Headphones',price:75000,category:'Audio',emoji:'🎧',description:'Immersive wireless listening with all-day comfort.'},
{id:'buds',name:'True Wireless Earbuds',price:42000,category:'Audio',emoji:'🎧',description:'Pocket-friendly audio for everyday listening.'},
{id:'charger',name:'65W Fast Charger',price:28000,category:'Chargers',emoji:'🔌',description:'Fast charging for compatible devices.'},
{id:'powerbank',name:'20,000mAh Power Bank',price:50000,category:'Power',emoji:'🔋',description:'Extra power for long days on the move.'},
{id:'case',name:'Samsung Phone Case',price:15000,category:'Cases',emoji:'📱',description:'Protective everyday phone case.'},
{id:'wireless',name:'Magnetic Wireless Charger',price:35000,category:'Chargers',emoji:'⚡',description:'Convenient wireless charging.'},
{id:'cable',name:'Braided USB-C Cable',price:12000,category:'Accessories',emoji:'🔗',description:'Durable charging and data cable.'},
{id:'protector',name:'Screen Protector',price:10000,category:'Accessories',emoji:'🛡️',description:'Extra protection for your screen.'},
{id:'galaxy',name:'Samsung Galaxy S24 Ultra',price:1250000,category:'Phones',emoji:'📱',description:'Premium Galaxy flagship demo product.'},
{id:'s24',name:'Samsung Galaxy S24',price:850000,category:'Phones',emoji:'📱',description:'Galaxy smartphone demo product.'},
{id:'watch',name:'Smartwatch',price:98000,category:'Accessories',emoji:'⌚',description:'Everyday wearable tech.'},
{id:'speaker',name:'Bluetooth Speaker',price:39000,category:'Audio',emoji:'🔊',description:'Portable music wherever you go.'}
]
export const categories: {name:Category;emoji:string}[]=[{name:'Phones',emoji:'📱'},{name:'Audio',emoji:'🎧'},{name:'Accessories',emoji:'⌚'},{name:'Chargers',emoji:'🔌'},{name:'Power',emoji:'🔋'},{name:'Cases',emoji:'📱'}]
export const naira=(n:number)=>'₦'+n.toLocaleString('en-NG')

/** Shared, side-effect-free product filtering for the storefront and QA tests. */
export function filterProducts(category:Category|'All',query:string):Product[]{
 const term=query.trim().toLocaleLowerCase()
 return products.filter(product=>(category==='All'||product.category===category)&&
  (product.name+' '+product.description+' '+product.category).toLocaleLowerCase().includes(term))
}
