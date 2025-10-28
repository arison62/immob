/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { createInertiaApp } from "@inertiajs/react";
import Layout from "@/pages/DefaultLayout";
import { Toaster } from "@/components/ui/sonner";
import AppInitializer from "./AppInitializer";

import "../css/main.css";

const pages = import.meta.glob("./pages/**/*.tsx");

document.addEventListener("DOMContentLoaded", () => {
  axios.defaults.xsrfCookieName = "csrftoken";
  axios.defaults.xsrfHeaderName = "X-CSRFToken";

  createInertiaApp({
    resolve: async (name) => {
      const importer = pages[`./pages/${name}.tsx`] as
        | (() => Promise<{ default: any }>)
        | undefined;
      if (!importer) {
        throw new Error(`Page not found: ${name}`);
      }
      const page = (await importer()).default;
      page.layout = page.layout || Layout;
      return page;
    },
    setup({ el, App, props }) {
      const initialAuth = props.initialPage.props.auth as {
        user: Record<string, any>;
      };

      createRoot(el).render(
        <StrictMode>
          <AppInitializer initialAuth={initialAuth}>
            <App {...props} />
            <Toaster />
          </AppInitializer>
        </StrictMode>
      );
    },
  });
});
