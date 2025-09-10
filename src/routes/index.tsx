import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/user/Home";
import AdminDashboard from "../pages/admin/Dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
]);

export default router;
