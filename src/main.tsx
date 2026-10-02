import { createRoot } from "react-dom/client";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/work-sans";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");

if (root) createRoot(root).render(<App />);
