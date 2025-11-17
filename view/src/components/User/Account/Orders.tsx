import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { getOrders } from "../../../utility/helpers";

interface Order {
  id: string;
  date: string;
  total: string;
}

interface OrdersProps {
  token: string | undefined;
}

export default function Orders({ token }: OrdersProps) {

  const [orders, setOrders] = useState<Order[]>();

  useEffect(() => {
    const fetchData = async () => {
      const results = await getOrders(token);
      setOrders(results);
    };
    
    fetchData();
  }, [token])

  const dateFormator = (date: string) => {
    let newDate = date.slice(0, 10)
    const y = newDate.slice(0, 4)
    const x = newDate.slice(5).replace('-', '/')
    newDate = x + ' ' + y
    return newDate;
  }

  const OrderItems = () => {
    if(!orders) return null;
    return (
      <table className='orders-table'>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Date</th>
            <th>Total</th>
          </tr>
          </thead>
        <tbody>
          {orders.map((item) => {
            return <tr key={item.id}className='item-card'>
              <td>
                {item.id}
              </td>
              <td>
                {dateFormator(item.date)} 
              </td>
              <td>
                {item.total}
              </td>
              <td>
                <Link to={`${item.id}`}>Order details</Link>
              </td>
            </tr>
            }
          )}
        </tbody>
      </table>
    )
  }

  return (
    <div className="orders container">
      <h1>Order History</h1>
      <OrderItems />
    </div>
  )
}
