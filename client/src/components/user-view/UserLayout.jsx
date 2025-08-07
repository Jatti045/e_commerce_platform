import React from "react";
import { Outlet } from "react-router-dom";
import UserNavbar from "./UserNavbar";

const UserLayout = () => {
  return (
    <div>
      <UserNavbar />
      <div>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
