import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import LoaderLogo from "../../components/Loader/LoaderLogo.js";

function Splash() {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => setRedirect(true), 6000);
    return () => clearTimeout(timerId);
  }, []);

  return redirect ? (
    <Navigate to="/home" replace />
  ) : (
    <LoaderLogo />
  );
}

export default Splash;
