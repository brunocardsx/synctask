import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";
import { router } from "./router";

console.log("Main.tsx loaded");
console.log("Creating React root...");

console.log("Rendering app with SocketProvider...");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SocketProvider>
      <RouterProvider router={router} />
      <Toaster />
    </SocketProvider>
  </React.StrictMode>
);

console.log("App rendered successfully");
