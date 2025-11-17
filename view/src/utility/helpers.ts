import { useState } from 'react';

interface TokenData {
  token?: string;
}

interface SearchData {
  search?: {
    query: string;
    list: any[];
  };
}

interface CartItem {
  name: string;
  amount: number;
}

export function useToken() {
  const getToken = (): string | undefined => {
    const tokenString = sessionStorage.getItem('token');
    if (!tokenString) return undefined;
    const userToken: TokenData = JSON.parse(tokenString);
    return userToken?.token
  };

  const [token, setToken] = useState<string | undefined>(getToken());

  const saveToken = (userToken: TokenData) => {
    sessionStorage.setItem('token', JSON.stringify(userToken));
    setToken(userToken.token);
  };

  return {
    setToken: saveToken,
    token
  }
}

export function useSearch() {
  const getSearch = () => {
    const searchString = sessionStorage.getItem('search');
    if (!searchString) return undefined;
    const search: SearchData = JSON.parse(searchString);
    return search?.search
  };

  const [search, setSearch] = useState(getSearch() || {
    query: '',
    list: []
  });

  const saveSearch = (userSearch: SearchData) => {
    sessionStorage.setItem('search', JSON.stringify(userSearch));
    setSearch(userSearch.search);
  };

  return {
    setSearch: saveSearch,
    search
  }
}

export function setCheckoutSession(value: any): void {
  const prevDataString = sessionStorage.getItem('checkout');
  let prevData = prevDataString ? JSON.parse(prevDataString) : {};
  Object.assign(prevData, value)
  sessionStorage.setItem('checkout', JSON.stringify(prevData));
}

export function addToCartLocal(item: CartItem): CartItem[] {
  let cart: CartItem[] = [];
  const currentCartString = localStorage.getItem('cart')
  if(!currentCartString){
    cart[0]=item;
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart
  }
  const currentCart: CartItem[] = JSON.parse(currentCartString);
  cart = currentCart || [];
  cart.push(item);
  localStorage.setItem('cart', JSON.stringify(cart));
  return cart;
}

export async function localCartTotal(): Promise<number> {
  const cartString = localStorage.getItem('cart')
  if(!cartString) {
    localStorage.setItem('cart-total', JSON.stringify({total: 0}));
    return 0;
  }
  const cart: CartItem[] = JSON.parse(cartString);
  let stringPriceArray: number[] = [];
  let price: number;
  let amount: number;
  let cost: number;
  for (let item of cart) {
    price = await getProductPrice(item.name);
    price = Number(price).toFixed(2) as any;
    amount = item.amount;
    cost = price*amount;
    stringPriceArray.push(cost);
  }
  const priceArray = stringPriceArray.map(Number);
  const total = priceArray.reduce((x, y) => x+y);
  return total;
}

export async function addLocalCartToDB(token: string): Promise<void>{
  const cartString = localStorage.getItem('cart');
  if(!cartString) return;
  const cart: CartItem[] = JSON.parse(cartString);
  try {
    for (let item of cart) {
    await addToCartDB(item.name, token, item.amount)
    }
  } catch(error) {
    console.log('error')
  }
}

export async function noLoginCheckout(): Promise<void>{
  let idArray: string[] = [];
  const cartString = localStorage.getItem('cart');
  if(!cartString) return;
  const cart: CartItem[] = JSON.parse(cartString);
  try {
    for (let item of cart) {
      const results = await fetch(`/products/${item.name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({amount: item.amount})
      })
      const json = await results.json();
      idArray.push(json)
      localStorage.setItem('cart-ids', JSON.stringify(idArray))
    }
  } catch(error) {
    console.log('error')
  }
}

export function useAuth(): boolean {
  const token = sessionStorage.getItem("token");
  if(token){
    return true;
  }
  return false;
}

interface Credentials {
  [key: string]: any;
}

export async function createUser(credentials: Credentials): Promise<any> {
  return fetch('/register' , {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  })
  .then(data => data.json());
}

export async function updateDetails(token: string | undefined, credentials: Credentials): Promise<any> {
  if(!token){
    return;
  }
  return fetch('/account/details' , {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify(credentials)
  })
  .then(data => data.json());
}

export async function updatePassword(token: string | undefined, credentials: Credentials): Promise<any> {
  if(!token){
    return;
  }
  return fetch('/account/password' , {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify(credentials)
  })
  .then(data => data.json());
}

export async function loginUser(credentials: Credentials): Promise<any> {
  return fetch('/login' , {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  })
  .then(data => data.json())
}

export async function getUser(token: string | undefined): Promise<any> {
  if(!token){
    return;
  }
  return fetch('/account', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    }
  })
  .then(data => data.json())
}

export async function getProductsOfCategory(category: string): Promise<any> {
  return fetch(`/products/c/${category}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(data => data.json())
}

export async function getProduct(product: string): Promise<any> {
  return fetch(`/products/${product}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  })
  .then(data => data.json())
}

export async function getProductPrice(product: string): Promise<any> {
  return fetch(`/products/${product}/price`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(data => data.json())
}

export async function getAllProducts(): Promise<any> {
  return fetch('/products', {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(data => data.json())
}

export async function updateProducts(credentials: Credentials, token: string | undefined): Promise<any> {
  return fetch('/checkout', {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token || ''
    },
    body: JSON.stringify(credentials)
  })
  .then(data => data.json())
}

export async function addToCartDB(product: string, token: string, amount: number): Promise<any> {
  return fetch(`/products/${product}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({amount: amount})
  })
  .then(data => data.json());
}

export async function getCart(token: string | undefined): Promise<any> {
  return fetch('/cart', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token || ''
    }
  })
  .then(data => data.json())
}

export async function getCartTotal(token: string | undefined): Promise<any> {
  return fetch('/cart/total', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token || ''
    }
  })
  .then(data => data.json())
}

export async function updateCart(id: string, amount: number): Promise<any> {
  return fetch(`/cart/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({amount: amount})
  })
  .then(data => data.json())
}

export async function deleteFromCartDB(id: string): Promise<any> {
  return fetch(`/cart/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then(data => data.status)
}

export async function deleteCart(credentials: Credentials, token: string | undefined): Promise<any> {
  return fetch(`/checkout`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    "Authorization": token || ''
    },
    body: JSON.stringify(credentials)
  })
  .then(data => data.status)
}

export async function createOrder(credentials: Credentials, token: string | undefined): Promise<any> {
  return fetch('/checkout' , {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token || ''
    },
    body: JSON.stringify(credentials)
  })
  .then(data => data.json());
}

export async function getOrders(token: string | undefined): Promise<any> {
  return fetch('/orders', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token || ''
    },
  })
  .then(data => data.json())
}

export async function getOrderDetails(token: string | undefined, id: string): Promise<any> {
  return fetch(`/orders/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token || ''
    },
  })
  .then(data => data.json())
}
