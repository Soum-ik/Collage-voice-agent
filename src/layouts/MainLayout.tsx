import { Outlet } from "react-router";
import { Toaster } from "sonner";

const MainLayout = () => {
  return (
    <>
      <div className="lg:px-4 lg:pt-4 min-h-screen flex flex-col bg-[#0C1630] ">
        <Outlet />
        <Toaster />
      </div>
    </>
  );
};

export default MainLayout;
