import { Outlet } from "react-router";
import { TitleBar } from "./TitleBar";

export function Layout() {
  return (
    <div className="mx-auto flex h-full w-full flex-col overflow-hidden">
      <TitleBar />
      <main className="min-h-0 flex-1 p-2 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
