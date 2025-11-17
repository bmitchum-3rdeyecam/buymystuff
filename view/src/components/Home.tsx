import React, { useState, useEffect } from "react";
import { getUser } from "../utility/helpers";
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/Shop/SearchBar';

interface SearchData {
  search: {
    query: string;
    list: any[];
  };
}

interface HomeProps {
  token: string | undefined;
  search: {
    query: string;
    list: any[];
  };
  setSearch: (data: SearchData) => void;
}

export default function Home({ token, search, setSearch }: HomeProps) {
  const [first, setFirst] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search)
  const searchParam = params.get("search")

  useEffect(() => {
    if(searchParam){
      setSearch({
      search: {
        query: searchParam,
        list: []
      }
    })
      navigate(`product/${searchParam}`)
    }
    setSearch({
      search: {
        query: '',
        list: []
      }
    })
    const fetchData = async () => {
      setIsLoading(true);
      const user = await getUser(token);
      const newFirst = user.first_name;
      setFirst(newFirst);
      setIsLoading(false)
    };
      
    if(token) fetchData();
  }, [token])

  if (!search) return null;

  return (
    <div className="container">
        <SearchBar setSearch={setSearch} search={search}/>
      <h1>Welcome{token && !isLoading ? `, ${first}` : ""}! Let's buy some stuff!</h1>
      <h2>Categories of stuff we sell</h2>
      <div className='categories-container'>
        <Link to="/c/hair">
          <div className='category'>
            <img src='../img/hair.jpg' alt='some dreads'/>
            <p>Hair</p>
          </div>
        </Link>
        <Link to="/c/face">
          <div className='category'>
            <img src='../img/face.jpg' alt='pug face'/>
          <p>Face</p>
          </div>
        </Link>
        <Link to="/c/body">
          <div className='category'>
            <img src='../img/body.jpg' alt='manikin body'/>
            <p>Body</p>
          </div>
        </Link>
      </div>
    </div>
  )
}