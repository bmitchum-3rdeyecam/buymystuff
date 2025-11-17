import React, { useState, useEffect } from 'react';
import {Link, useParams, useNavigate } from 'react-router-dom';
import { getProduct, addToCartDB, addToCartLocal } from '../../utility/helpers';

interface ProductData {
  name: string;
  category: string;
  price: string;
  inventory: number;
}

interface SearchData {
  query: string;
  list?: any[];
}

interface ProductProps {
  setSearch: (data: { search: SearchData }) => void;
  search: SearchData;
  token: string | undefined;
}

export default function Product({ setSearch, search, token }: ProductProps) {
  const [product, setProduct] = useState<ProductData[]>();

  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const {name} = useParams<{ name: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(search)
    console.log(name)
    const fetchData = async () => {
      let newProductArray: ProductData[] = []
      const response = await 
      getProduct(name as string);
      if(response.error){
        navigate("/productnotfound")
      }
      newProductArray.push(response);
      setProduct(newProductArray);
    };
    
    fetchData();
  }, [search])

  function resetSuccess() {
    let el = document.getElementById('success');
    if (!el) return;
    el.style.animation = '';
    el.style.display = '';
    setTimeout(() => {
      el.style.display='none';
      el.style.animation='none';
    }, 3000)
  }

  const handleAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setError(false);
    let localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setSearch({
      search: {
        query: e.currentTarget.getAttribute('value') || ''
      }
    })
    if(token){
      const response = await addToCartDB(search.query, token, 1);
      console.log(response)
      if(!response) {
        setSuccess(false)
        setError(true)
      }
      setSuccess(true);
      resetSuccess();
      return;
    }
    let filteredCart;
    if (!localCart || localCart.length === 0){
      addToCartLocal({name: search.query, amount: 1});
      localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setSuccess(true);
      resetSuccess();
      return;
    }
    if (localCart) {
      filteredCart = localCart.filter((item: any) => item.name===search.query)
      if (!filteredCart[0]){
        addToCartLocal({name: search.query, amount: 1});
        localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      } else {
          const newCart = localCart.map((item: any) => {
          if(item.name === search.query){
            return {...item, amount: item.amount + 1};
          } else {
              return item;
            }
        })
        localStorage.setItem('cart', JSON.stringify(newCart));
      }
      setSuccess(true);
      resetSuccess();
    }
  }

  const successMessage = () => {
    return (
      <div
        id="success"
        style={{
          display: success ? '' : 'none',
        }}>
        <h3>Item added to cart!</h3>
      </div>
    );
  };

  const errorMessage = () => {
    return (
      <div
        id="error"
        style={{
          display: error ? '' : 'none',
        }}>
        <h3>{error ? 'Error adding to cart. Please try again or contact us if error persists' : ''}</h3>
      </div>
    );
  };

  

  if(!product) return null;

  return (
    <div className="container" key={product[0].name}>
      {errorMessage()}
      {successMessage()}
      <div className='page-history'><Link to='/'>/ home </Link><Link to={`/c/${product[0].category}`}>/ {product[0].category}</Link>
      </div>
      <div className="product-page">
        <h2>{product[0].name}</h2>
        <img src={`../img/${product[0].name.replace(/\s+/g, '')}.jpg`} alt={`Container of ${product[0].name}`}/>
        <h3>{product[0].price}</h3>
        <button value={product[0].name} onClick={handleAdd} type="submit">Add to cart</button>
      </div>
    </div>
  )
}