import "vite/modulepreload-polyfill";
import axios from "axios";

import React from "react";
import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import Layout from "@/components/Layout";
import { Toaster } from "./components/ui/sonner";
import AuthProvider from "./AuthContext";

import "../css/main.css";

const pages = import.meta.glob("./pages/**/*.jsx");

document.addEventListener("DOMContentLoaded", () => {
  axios.defaults.xsrfCookieName = "csrftoken";
  axios.defaults.xsrfHeaderName = "X-CSRFToken";

  createInertiaApp({
    resolve: async (name) => {
      const page = (await pages[`./pages/${name}.jsx`]()).default;
      page.layout = page.layout || Layout;
      return page;
    },
    setup({ el, App, props }) {
      const initialAuth = props.initialPage.props.auth;
      
      createRoot(el).render(
        <>
          <AuthProvider initialAuth={initialAuth}>
            <App {...props} />
            <Toaster />
          </AuthProvider>
        </>
      );
    },
  });
});
