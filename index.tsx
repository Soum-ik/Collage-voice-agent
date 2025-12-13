import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import AllRoute from "./src/routes/Routes";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Check and set default voice style in localStorage
if (!localStorage.getItem("voiceStyle")) {
  localStorage.setItem("voiceStyle", "Despina");
}

ReactDOM.createRoot(rootElement).render(
  // Update: Wrap with BrowserRouter
  <BrowserRouter>
    <AllRoute />
  </BrowserRouter>
);
