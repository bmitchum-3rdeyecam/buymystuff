import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../../utility/helpers';

interface Product {
  name: string;
  category: string;
  price: string;
  inventory: number;
}

interface SearchData {
  search: {
    query: string;
    list?: any[];
  };
}

interface ProductNotFoundProps {
  setSearch: (data: SearchData) => void;
}

export default function ProductNotFound({setSearch}: ProductNotFoundProps) {

  const [allProducts, setAllProducts] = useState<Product[]>();

  useEffect(() => {
    const fetchData = async () => {
      const response = await getAllProducts();
      setAllProducts(response);
    }

    fetchData();
  }, [])

  const handleClick = (product: string) => {
    setSearch({
      search: {
        query: product
      }
    })
  }

  if(!allProducts) return null;

  const productsList = allProducts.map((product) => {
    return (
      <div className="product" key={product.name}>
        <Link onClick={() => handleClick(product.name)} to={`../product/${product.name}`}>
          <img src={`../img/${product.name.replace(/\s+/g, '')}.jpg`} alt={`Container of ${product.name}`}/>
          <p>{product.name}</p>
        </Link>
      </div>
    )
  })

  return(
    <div className="container">
      <h1>Product Not Found</h1>
      <h2>All Products</h2>
      {productsList}
  </div>
  )
}