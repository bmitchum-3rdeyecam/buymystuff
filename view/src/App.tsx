import React from 'react';
import { Routes, Route, NavLink, useNavigate, Outlet, Navigate } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Registration from './components/Registration';
import Login from './components/Login';
import Category from './components/Shop/Category';
import Product from './components/Shop/Product';
import ProductNotFound from './components/Shop/ProductNotFound';
import ProtectedRoutes from './components/ProtectedRoutes';
import Account from './components/User/Account/Account';
import Details from "./components/User/Account/Details";
import Orders from "./components/User/Account/Orders";
import OrderDetails from "./components/User/Account/OrderDetails";
import Returns from "./components/User/Account/Returns";
import Password from "./components/User/Account/Password";
import Cart from "./components/User/Cart";
import CheckoutContainer from "./components/Checkout/CheckoutContainer";
import CheckoutLogin from "./components/CheckoutLogin";
import Confirmation from './components/Confirmation';
import NotFound from './components/NotFound';
import { useToken, useSearch } from './utility/helpers';

interface TokenData {
  token: string | null;
}

interface SearchData {
  search: {
    query: string;
    list: any[];
  };
}

function App () {
  const navigate = useNavigate();
  const { token, setToken } = useToken();
  const { search, setSearch } = useSearch();

  function handleLogOut() {
    sessionStorage.removeItem("token");
    setToken({token: null});
    navigate("/")
  }

  const NavBar = () => {
    if(!token){
      return (
        <nav>
          <ul>
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink to="/login">Login</NavLink>
            </li>
            <li>
              <NavLink to="/register">Sign Up</NavLink>
            </li>
            <li>
              <NavLink to="/cart">Cart</NavLink>
            </li>
          </ul>
        </nav>
      )
    }
    return (
      <nav>
        <ul>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/account">Account</NavLink>
          </li>
          <li>
            <NavLink to="/cart">Cart</NavLink>
          </li>
        </ul>
        <button className="logout" onClick={handleLogOut}>Log Out</button>
      </nav>
    )
  }

  const Redirect = () => {
    return token ? <Navigate to="/" /> : <Outlet />;
  };

    return (
      <div>

        <NavBar />

        <Routes>
          <Route path="/" element={<Home token={token} setSearch={setSearch} search={search} />} />
          <Route path="*" element={<NotFound />} />
          <Route element={<Redirect />}>
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/register" element={<Registration setToken={setToken} />} />
            <Route path="/checkoutlogin" element={<CheckoutLogin setToken={setToken} />} />
          </Route>
          <Route path="/c/:category" element={<Category setSearch={setSearch} />} />
          <Route path="/product/:name" element={<Product setSearch={setSearch} search={search} token={token}/>} />
          <Route path="/productnotfound" element={<ProductNotFound setSearch={setSearch}/>} />
          <Route path="/cart" element={<Cart token={token} setSearch={setSearch} />} />
          <Route path="/checkout/*" element={<CheckoutContainer token={token} />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route element={<ProtectedRoutes token={token} />}>
            <Route path="account" element={<Account token={token} />} />
            <Route path="/account/details" element={<Details token={token} />} />
            <Route path="/account/password" element={<Password token={token} />} />
            <Route path="/account/orders" element={<Orders token={token} />} />
            <Route path="/account/orders/:id" element={<OrderDetails token={token} />} />
            <Route path="/returns" element={<Returns />} />
          </Route>
        </Routes>
      </div>
    )
}

export default App;
