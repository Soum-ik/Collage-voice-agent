import { Route, Routes } from "react-router";
import MainLayout from "../layouts/MainLayout";
import AgentPage from "../pages/AgentPage";

const AllRoute = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<AgentPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default AllRoute;
