import { Outlet } from "react-router-dom";
import Header from "./Header";

const Mainlayout = () => {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
};

export default Mainlayout;
