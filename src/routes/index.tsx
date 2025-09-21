import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "../pages/user/Home";
import AdminDashboard from "../pages/admin/Dashboard";
import AboutUs from "../pages/user/AboutUs";
import ContactUs from "../pages/user/ContactUs";
import Donate from "../pages/user/Donate";
import Media from "../pages/user/Media";
import Projects from "../pages/user/Projects";
import AdminProjects from "../pages/admin/AdminProjects";
import DonationHistory from "../pages/admin/DonationHistory";
import Forms from "../pages/admin/Forms";
import MediaLibrary from "../pages/admin/MediaLibrary";
import NewsArticles from "../pages/admin/NewsArticles";
import AdminLogin from "../pages/admin/auth/AdminLogin";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about-us",
    element: <AboutUs />,
  },
  {
    path: "/contact-us",
    element: <ContactUs />,
  },
  {
    path: "/donate",
    element: <Donate />,
  },
  {
    path: "/media",
    element: <Media />,
  },
  {
    path: "/projects",
    element: <Projects />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
    children: [
      { index: true, element: <Navigate to="projects" replace /> },
      { path: "projects", element: <AdminProjects /> },
      { path: "donation-history", element: <DonationHistory /> },
      { path: "forms", element: <Forms /> },
      { path: "media-library", element: <MediaLibrary /> },
      { path: "news-articles", element: <NewsArticles /> },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
]);

export default router;
