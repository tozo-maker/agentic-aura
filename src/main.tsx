import { createRoot } from "react-dom/client";
import "@fontsource/instrument-serif/400.css";
import "@fontsource-variable/work-sans";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");

if (root) createRoot(root).render(<App />);
