import React from "react";

import { Link } from "react-router-dom";

const UserListItem = ({ user }) => {
  // user_id, user_name, online
  return (
    <div>
      <h5>
        <div>
          {user.user_name} (ID: {user.user_id}) - {user.online ? 'Online' : 'Offline'}
        </div>
        <p></p>
        <p>
          <Link to={`/chat/${user.user_id}`}>Przejdź do chatu</Link>
        </p>
      </h5>
      <hr />
    </div>
  );
};

export default UserListItem;
