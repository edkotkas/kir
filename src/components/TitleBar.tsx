import { getCurrentWindow } from "@tauri-apps/api/window";
import { useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { cn } from "../helpers/class-name";
import { useQrStore } from "../state/useQrStore";
import {
  CheckIcon,
  CloseIcon,
  HistoryIcon,
  MinimizeIcon,
  SettingsIcon,
} from "./index";

const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export function TitleBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    state: { lastSavedAt },
  } = useQrStore();
  const winRef = useRef(isTauri ? getCurrentWindow() : null);

  if (!isTauri) return null;

  const win = winRef.current!;

  return (
    <div
      data-tauri-drag-region
      className="grid h-11 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-bg-300/80 px-3 bg-linear-to-r from-bg-100/95 via-bg-200/95 to-bg-100/95"
    >
      <div data-tauri-drag-region className="flex min-w-0 items-center gap-1">
        <NavButton
          label="Settings"
          active={pathname === "/settings"}
          onClick={() => navigate(pathname === "/settings" ? "/" : "/settings")}
        >
          <SettingsIcon className="h-5 w-5" />
        </NavButton>
        <NavButton
          label="History"
          active={pathname === "/history"}
          onClick={() => navigate(pathname === "/history" ? "/" : "/history")}
        >
          <span
            key={lastSavedAt ?? "history-idle"}
            className="relative inline-flex h-5 w-5 items-center justify-center"
          >
            <HistoryIcon
              className={cn(
                "h-5 w-5",
                Boolean(lastSavedAt) && "history-icon-pulse",
              )}
            />
            <CheckIcon
              className={cn(
                "pointer-events-none absolute h-5 w-5 opacity-0 text-emerald-300",
                Boolean(lastSavedAt) && "history-check-pulse",
              )}
            />
          </span>
        </NavButton>
      </div>

      <div
        data-tauri-drag-region
        className="flex select-none items-center justify-center"
      >
        <span
          data-tauri-drag-region
          className="text-sm font-semibold tracking-[0.2em] text-text-200"
        >
          キR
        </span>
      </div>

      <div data-tauri-drag-region className="flex justify-end gap-0.5">
        <TitleBarButton
          label="Minimize"
          onClick={() => {
            void win.minimize();
          }}
        >
          <MinimizeIcon />
        </TitleBarButton>

        <TitleBarButton
          label="Close"
          onClick={() => {
            void win.close();
          }}
          className="hover:bg-red-900/30 hover:text-red-300 hover:border-red-800/50"
        >
          <CloseIcon />
        </TitleBarButton>
      </div>
    </div>
  );
}

function NavButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition",
        active
          ? "border-primary-100/50 bg-primary-100/15 text-primary-200"
          : "border-transparent text-text-200 hover:border-bg-300 hover:bg-bg-200/70 hover:text-text-100",
      )}
    >
      {children}
    </button>
  );
}

function TitleBarButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-text-200 transition hover:border-bg-300 hover:bg-bg-200/70 hover:text-text-100",
        className,
      )}
    >
      {children}
    </button>
  );
}
