import { Outlet } from "react-router-dom";

function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Sidebar / header goes here */}
      <Outlet />
    </div>
  );
}

export default AdminDashboard;
