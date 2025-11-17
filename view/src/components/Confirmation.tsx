import React from "react";

interface ConfirmationData {
  id: string;
}

export default function Confirmation() {
  const confirmationString = sessionStorage.getItem('confirmation');
  const confirmation: ConfirmationData = confirmationString ? JSON.parse(confirmationString) : { id: '' };
  const confID = confirmation.id;

  return (
    <div className='container'>
      <h1>Order confirmed!</h1>
      <h2>Confirmation #: {confID}</h2>
    </div>
  )
}