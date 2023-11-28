import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../AuthContextProvider";
import apiClient from "../apiClient";

import UserListItem from "../components/UserListItem";

const UserListPage = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  // TODO: Jeśli użytkownik jest zalogowany ustaw listę użytkowników

  useEffect(() => {
    apiClient.getUsers().then((data) => {
      if (data.loggedin !== false) {
        console.log(data.data);
        setUsers(data.data);
      }
    });
  }, []);

  // TODO:WEBSOCKET Jeśli zostanie utworzony nowy użytkownik zaktualizuj
  // listę użytkowników przez WebSocket.
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/stream/');
    ws.onopen = () => console.log('WebSocket otwarty');
    ws.onclose = () => console.log('WebSocket zamknięty');
    ws.onmessage = (event) => {
      // Otrzymanie nowego użytkownika z WebSocket
      const newUsers = JSON.parse(event.data);

      // Aktualizacja stanu komponentu o nowego użytkownika
      //setUsers(newUsers);
    };

    return () => {
      ws.close();
    };
  }, []);

  if (!isLoggedIn) {
    return <p>Zaloguj się aby wyświetlić użytkowników czatu</p>;
  }
  return (
    <div>
      <h1>Lista użytkowników</h1>
      {users && users.map((user, idx) => (
        // TODO: Wyświetl element z listy użytkowników
        <UserListItem key={user.user_id} user={user} />
      ))}
    </div>
  );
};

export default UserListPage;
