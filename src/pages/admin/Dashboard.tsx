import { Outlet, useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { useEffect } from "react";

function AdminDashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/admin/projects");
  }, []);
  return (
    <div>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content Area*/}
      <Outlet />
    </div>
  );
}

export default AdminDashboard;
