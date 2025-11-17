import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { getUser, updateDetails } from "../../../utility/helpers";

interface DetailsProps {
  token: string | undefined;
}

export default function Details({ token }: DetailsProps) {
  const [first, setFirst] = useState<string>('');
  const [last, setLast] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [zip, setZip] = useState<string>('');

  const [updated, setUpdated] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const user = await getUser(token);
      const newFirst = user.first_name;
      setFirst(newFirst);
      const newLast = user.last_name;
      setLast(newLast);
      const newEmail = user.email;
      setEmail(newEmail);
      const newUsername = user.username;
      setUsername(newUsername);
      const newAddress = user.address;
      setAddress(newAddress);
      const newCity = user.city;
      setCity(newCity);
      const newState = user.state;
      setState(newState);
      const newZip = user.zip;
      setZip(newZip);
    };
    
    fetchData();
  }, [])

  const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+\.[a-zA-Z_.+-]+$/, "gm");

  const handleFirst = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirst(e.target.value);
    setUpdated(false);
  };

  const handleLast = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLast(e.target.value);
    setUpdated(false);
  };

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setUpdated(false);
  };

  const handleUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setUpdated(false);
  };

  const handleAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setUpdated(false);
  };

  const handleCity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    setUpdated(false);
  };

  const handleState = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(e.target.value);
    setUpdated(false);
  };

  const handleZip = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZip(e.target.value);
    setUpdated(false);
  };
  
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setEmailError(false);
    if (first === '' || last === '' || email === '' || username === '') {
      setError(true);
      return;
    }
    if (!emailRegex.test(email)){
      setEmailError(true);
      return;
    }
    setError(false);
    setEmailError(false);
    setUpdated(true);
    await updateDetails(token, {
      first: first,
      last: last,
      email: email,
      username: username,
      address: address,
      city: city,
      state: state,
      zip: zip
    });
  }

  const successMessage = () => {
    return (
      <div
        className="success"
        style={{
          display: updated ? '' : 'none',
        }}>
        <h3>Details updated</h3>
      </div>
    );
  };

  const updateError = () => {
    return (
      <div
        className="error"
        style={{
          display: error ? '' : 'none',
        }}>
        <h3>Please fill in all required fields</h3>
      </div>
    );
  };

  const emailErrorMessage = () => {
    return (
      <div
        className="error"
        style={{
          display: emailError ? '' : 'none',
        }}>
        <h3>Please enter a valid email</h3>
      </div>
    );
  };

  return (
    <div className="container">
      <div className='page-history'><Link to='/account'>&lt; account</Link>
      </div>
      <div className="messages">
        {emailErrorMessage()}
        {updateError()}
        {successMessage()}
      </div>
      <h1>Your personal details</h1>
      <div className="account-details">
        <label htmlFor="first">
          First name*
          <input value={first} className="input" onChange={handleFirst} type="text" name="first"/>
        </label>
        <label htmlFor="last">
          Last name*
          <input value={last} className="input" onChange={handleLast} type="text" name="last"/>
        </label>
        <label htmlFor="email">
          Email*
          <input value={email} className="input" onChange={handleEmail} type="email" name="email"/>
        </label>
        <label htmlFor="username">
          Username*
          <input value={username} className="input" onChange={handleUsername} type="text" name="username"/>
        </label>
        <label htmlFor="address">
          Mailing address
          <input value={address} className="input" onChange={handleAddress} type="text" name="address"/>
        </label>
        <label htmlFor="city">
          City
          <input value={city} className="input" onChange={handleCity} type="text" name="city"/>
        </label>
        <label htmlFor="state">
          State
          <input value={state} className="input" onChange={handleState} type="text" name="state"/>
        </label>
        <label htmlFor="zip">
          Postal code
          <input value={zip} className="input" onChange={handleZip} type="text" name="zip"/>
        </label>
        <button onClick={handleUpdate} className="btn" type="submit">Update</button>
      </div>
    </div>
  )
}
