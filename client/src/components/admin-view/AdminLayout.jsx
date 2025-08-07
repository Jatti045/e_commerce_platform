import React from "react";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex w-full">
      <AdminSidebar />
      <div className="flex flex-col flex-1 w-full">
        <main className="h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
