import React from 'react';
import { Navigate } from 'react-router-dom';

export default function MyOrders() {
  return <Navigate to="/profile?tab=orders" replace />;
}
