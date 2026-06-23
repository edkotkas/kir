import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export function ShellGuards() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const onContextMenu = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const allow = target.closest(
        [
          "textarea",
          "canvas.qr-code-media",
          "svg.qr-code-media",
          "[data-allow-context-menu='true']",
        ].join(","),
      );

      if (!allow) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", onContextMenu);

    let unlisten: (() => void) | null = null;
    if (isTauri) {
      void listen<string>("app:navigate", (event) => {
        const targetPath = event.payload || "/";
        navigate(targetPath);
      }).then((fn) => {
        unlisten = fn;
      });
    }

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      if (unlisten) {
        unlisten();
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (!isTauri) {
      return;
    }

    void invoke("set_last_route", { path: pathname });
  }, [pathname]);

  return null;
}
