import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Homepage from "./pages/Homepage.jsx";
import Writepage from "./pages/Writepage.jsx";
import Editpage from "./pages/Editpage.jsx";
import Mainlayout from "./components/Mainlayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter([
  {
    element: <Mainlayout />,
    children: [
      { path: "/", element: <Homepage /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/newletter", element: <Writepage /> },
      { path: "/editletter/:id", element: <Editpage /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
    <ToastContainer position="bottom-right" />
  </StrictMode>
);
