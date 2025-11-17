import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCart, getCartTotal, localCartTotal, deleteFromCartDB, getUser } from '../../utility/helpers';

interface CartItem {
  id?: string;
  name: string;
  amount: number;
}

interface SearchData {
  search: {
    query: string;
    list?: any[];
  };
}

interface CartProps {
  token: string | undefined;
  setSearch: (data: SearchData) => void;
}

export default function Cart({ token, setSearch }: CartProps) {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>();
  const [total, setTotal] = useState<string | null>(null);

  useEffect(() => {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const fetchCart = async () => {
      const cart = await getCart(token);
      setCart(cart);
    };
    const fetchTotal = async () => {
      let cartTotal: number | string = 0;
      if(token) {
        cartTotal = await getCartTotal(token)
      } else {
        cartTotal = await localCartTotal()
      }
      cartTotal = Number(cartTotal).toFixed(2)
      setTotal(cartTotal);
    }
    if(!token) {
      setCart(localCart) 
      fetchTotal()
      return
      };
    fetchCart();
    fetchTotal();
  }, [token])

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>, i: number) => {
    e.preventDefault();
    if (!cart) return;

    const thisClicked = e.currentTarget;
    thisClicked.innerText = "Removing";

    if(token) {
      const id = cart[i].id;
      const status = await deleteFromCartDB(id as string);
      console.log(status);
      if (status === 200){
        thisClicked.closest("tr")?.remove();
        const newCart = cart.filter((item, index) => index !== i);
        setCart(newCart);
        const cartTotalValue = await getCartTotal(token);
        const cartTotal = Number(cartTotalValue).toFixed(2)
        setTotal(cartTotal);
      } else {
        alert("Unable to delete!")
      }
    }
    if(!token) {
      const newCart = cart.filter((item, index) => index !== i);
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
      thisClicked.closest("tr")?.remove();
    }
  };

  const handleDecrement = async (i: number) => {
    if (!cart) return;
    const newCart = cart.map((item, index) => {
      if (index === i) {
        return {...item, amount: item.amount - (item.amount > 1 ? 1:0)};
      } else {
        return item;
      }
    })
    setCart(newCart);
    if(token) {
      const id = newCart[i].id;
      const amount = newCart[i].amount
      await updateCart(id as string, amount);
      const cartTotalValue = await getCartTotal(token);
      const cartTotal = Number(cartTotalValue).toFixed(2)
      setTotal(cartTotal);
    }
    if(!token) {
      localStorage.setItem('cart', JSON.stringify(newCart))
      const cartTotalValue = await localCartTotal();
      const cartTotal = Number(cartTotalValue).toFixed(2);
      setTotal(cartTotal);
    }
  };

  const handleIncrement = async (i: number) => {
    if (!cart) return;
    const newCart = cart.map((item, index) => {
      if (index === i) {
        return {...item, amount: item.amount + (item.amount < 10 ? 1:0)};
      }else {
        return item;
      }
    })
    setCart(newCart);
    if(token) {
      const id = newCart[i].id;
      const amount = newCart[i].amount
      await updateCart(id as string, amount);
      const cartTotalValue = await getCartTotal(token);
      const cartTotal = Number(cartTotalValue).toFixed(2);
      setTotal(cartTotal);
    }
    if(!token) {
    localStorage.setItem('cart', JSON.stringify(newCart));
      const cartTotalValue = await localCartTotal();
      const cartTotal = Number(cartTotalValue).toFixed(2)
      setTotal(cartTotal);
    }
  }

  const handleClick = async () => {
    if(token) {
      const user = await getUser(token);
      sessionStorage.setItem('checkout', JSON.stringify({
        first: user.first_name,
        last: user.last_name,
        email: user.email,
        shippingAddress: user.address ? user.address : '',shippingCity: user.city ? user.city : '',
        shippingState: user.state ? user.state : '',
        shippingZip: user.zip ? user.zip : '',
        billingAddress: '',
        billingCity: '',
        billingState: '',
        billingZip: '',
      }))
      navigate("/checkout/shipping")
    }
    if(!token) {
      sessionStorage.setItem('checkout', JSON.stringify({
        first: '',
        last: '',
        email: '',
        billingAddress: '',billingCity: '',
        billingState: '',
        billingZip: '',
        shippingAddress: '',
        shippingCity: '',
        shippingState: '',
        shippingZip: '',
      }))
      navigate("/checkoutlogin")
    } 
  }

  const handleLink = (product: string) => {
    setSearch({
      search: {
        query: product
      }
    })
  }

  const CartTotal = () => {
    if (!cart) return null;
    if (cart.length===0) return null;
    return <h3>Total: ${total}</h3>
  }

  const CartItems = () => {
    if(!cart) return null;
    return (
      <table className = 'cart-table'>
        <tbody>
          {cart.map((item, i) => {
            return <tr key={item.name.replace(/\s+/g, '')}className='item-card'>
              <td className='first-col'>
                <Link onClick={() => handleLink(item.name)} to={`../product/${item.name}`}>{item.name}</Link>
              </td>
              <td> 
                <div className='second-col'>
                  <img src={`../img/${item.name.replace(/\s+/g, '')}.jpg`} alt={`Container of ${item.name}`}/>
                </div>
              </td>
              <td>
                <button onClick={() =>{handleDecrement(i)}} className='amount-btn'>-</button>
              </td>
              <td>
                <input value={item.amount} className='amount-input' type='number' readOnly />
              </td>
              <td>
                <button onClick={() => {handleIncrement(i)}} className='amount-btn'>+</button>
              </td>
              <td>
                <button onClick={(e) => {handleDelete(e, i)}}>Remove</button>
              </td>
            </tr>
            }
          )}
          <tr>
            <td colSpan={6}>
              <div className="cart-total">
                  <CartTotal />
                  <button style={{
          display: !cart || cart.length===0 ? 'none' : '',
        }} onClick={() => {handleClick()}}>Checkout</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }

  return (
    <div className="cart container">
      <h1>Cart</h1>
      <CartItems />
    </div>
  )
}
