import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import LoaderLogo from "../../components/Loader/LoaderLogo";

const Splash: React.FC = () => {
  const [redirect, setRedirect] = useState<boolean>(false);

  useEffect(() => {
    const timerId = setTimeout(() => setRedirect(true), 6000);
    return () => clearTimeout(timerId);
  }, []);

  return redirect ? (
    <Navigate to="/home" replace />
  ) : (
    <LoaderLogo />
  );
};

export default Splash;
