import React, { useContext, useState } from "react";

import apiClient from "../apiClient";

import { AuthContext } from "../AuthContextProvider";

const LoginPage = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");

  return (
    <div>
      <h1>Logowanie</h1>
      <form>
        {/* TODO: Uzupełnij widok logowania bazując na widoku rejestracji. */}
      </form>
    </div>
  );
};

export default LoginPage;
