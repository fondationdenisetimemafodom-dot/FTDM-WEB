import { createBrowserRouter } from "react-router-dom";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/AboutUs",
    element: <AboutUs />,
  },
  {
    path: "/ContactUs",
    element: <ContactUs />,
  },
  {
    path: "/Donate",
    element: <Donate />,
  },
  {
    path: "/Media",
    element: <Media />,
  },
  {
    path: "/Projects",
    element: <Projects />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />, // acts as layout
    children: [
      { path: "projects", element: <AdminProjects /> },
      { path: "donation-history", element: <DonationHistory /> },
      { path: "forms", element: <Forms /> },
      { path: "media-library", element: <MediaLibrary /> },
      { path: "news-articles", element: <NewsArticles /> },
    ],
  },
]);

export default router;
