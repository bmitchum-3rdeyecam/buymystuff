import React from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../../utility/helpers';

interface Product {
  name: string;
  category: string;
  price: string;
  inventory: number;
}

interface SearchData {
  query: string;
  list?: Product[];
}

interface SearchBarProps {
  search: SearchData;
  setSearch: (data: { search: SearchData }) => void;
}

const SearchBar = ({ search, setSearch }: SearchBarProps) => {

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    const products = await getAllProducts();
    const results = products.filter((product: Product) => {
      if (!query) return false;
      return product.name.toLowerCase().includes(e.target.value.toLowerCase()) || product.category.toLowerCase().includes(e.target.value.toLowerCase())  
    })
    setSearch({search: {
      ...search,
      query: query,
      list: results
    }})
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setSearch({
      search: {
        query: e.currentTarget.getAttribute('data-value') || '',
        list: []
      }
    })
  }

  const Results = () => {
    if (!search || !search.list) return null;
    if (!search.list.length) return null;
    return (
      <div className='search-auto'>
        <ul>
          {search.list.map(product => {
            return <li key={product.name.replace(/\s+/g, '')}><Link data-value={product.name} onClick={handleClick} to={`/product/${product.name.replace(/\s+/g, '')}`}>{product.name}</Link></li>
          })}
        </ul>
      </div>
    )
   
  }

  return(
    <div className="search-bar">
      <form>
        <input
          value={search.query}
          onChange={handleChange}
          type="search"
          id="header-search"
          placeholder="Search for stuff"
          name="search" 
        />
      </form>
      <Results />
    </div>
  )
};

export default SearchBar;