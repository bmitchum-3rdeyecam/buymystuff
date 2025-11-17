import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe('pk_test_51MpCyhDoFFCpZ0bnXeGikLiIbkZ2f2GcDkzkvYgLXIJamiz6XojIzXOsymQFmXdoaLFxTAQu2WoyOASqDicB5XLQ001b0QGfud');

interface InputFields {
  first: string;
  last: string;
  email: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
}

interface ReviewProps {
  inputFields: InputFields;
  success: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  radio: string;
  handleRadioChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSame: () => void;
  token: string | undefined;
  cartItems: JSX.Element;
  cartTotal: JSX.Element;
  placeOrder: () => Promise<void>;
  updateInventory: () => Promise<void>;
  handleDelete: () => Promise<void>;
}

export default function Review({
  inputFields,
  success,
  handleChange, 
  handleSubmit,
  radio,
  handleRadioChange,
  onSame,
  token,
  cartItems,
  cartTotal,
  placeOrder,
  updateInventory,
  handleDelete
}: ReviewProps) {

  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("/checkout/create-payment-intent", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": token ? token : '1'
        },
      body: token ? '' : JSON.stringify(JSON.parse(localStorage.getItem('cart-ids') || '[]')) 
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [token]);

  const appearance: any = {
    theme: 'stripe',
  };
  const options: any = {
    clientSecret,
    appearance,
  };

  const successMessage = () => {
      return (
        <div
          className="success"
          style={{
            display: success ? '' : 'none',
          }}>
          <h3>Billing saved!</h3>
        </div>
      );
    };

  return (
        <div className='checkout'>
          <div className='page-history'><Link to='../shipping'>&lt;Shipping</Link>
          </div>
          <div className="review">
            <h1>Review and Pay</h1>
            <div className='summary-container'>
              <div className='summary-card'>
                <h2>Shipping to:</h2>
                <p>{inputFields.first} {inputFields.last}<br/>
                {inputFields.shippingAddress}<br/>
                {inputFields.shippingCity}, {inputFields.shippingState} {inputFields.shippingZip}</p>
                <Link to='../shipping'>Change shipping address</Link>
                <h2>Shipping method:</h2>
                <p>Standard shipping - FREE<br/>
                Estimated arrival: 5 business days</p> 
              </div>
              <div className='summary-card'>
                <div className="checkoutcart">
                  {cartItems}
                </div>
                {cartTotal}
              </div>
              <div className='summary-card'>
                <h2>Billing</h2>
                <h3>{success ? successMessage() : 'Select the option that matches your card or payment method.'}</h3>
                <div className="billing-check">
                  <label>
                    <input 
                      type="radio" 
                      name='same'
                      value="same" 
                      checked={radio==='same'} 
                      onChange={(e) => {
                        handleRadioChange(e);
                        onSame();
                      }}
                      className='radio-same'/>
                    Same as shipping address  
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name='different'
                      value="different"
                      checked={radio==='different'}   
                      onChange={handleRadioChange}
                      className='radio-different'/>
                    Use a different billing address  
                  </label>
                </div>
                <div id="billing-form">
                  <label htmlFor="address">
                    Billing address*
                    <input value={inputFields.billingAddress} className="input" onChange={handleChange} type="text" name="billingAddress"/>
                  </label>
                  <label htmlFor="city">
                    City*
                    <input value={inputFields.billingCity} className="input" onChange={handleChange} type="text" name="billingCity"/>
                  </label>
                  <label htmlFor="state">
                    State*
                    <input value={inputFields.billingState} className="input" onChange={handleChange} type="text" name="billingState"/>
                  </label>
                  <label htmlFor="zip">
                    Postal code*
                    <input value={inputFields.billingZip} className="input" onChange={handleChange} type="text" name="billingZip"/>
                  </label>
                  <button className="checkout-btn" type='submit' onClick={e => handleSubmit(e)}>Save Billing</button>
                </div>
              </div>
              <div className='summary-card'>
                <h2>Payment options</h2>
                {clientSecret && (
                  <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm 
                      placeOrder={placeOrder}
                      updateInventory={updateInventory}
                      handleDelete={handleDelete} />
                  </Elements>
                )}
              </div>
            </div>
          </div>
        </div>
      );
}
