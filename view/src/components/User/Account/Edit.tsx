import React, { useState, useEffect } from "react";
import { Routes, Route, NavLink } from 'react-router-dom';

interface EditProps {
  token: string | undefined;
}

export default function Details({ token }: EditProps) {
  return (
    <h1>Edit Details</h1>
  )
}