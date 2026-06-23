import { Navigate, Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import { GeneratePage } from "./pages/generate/GeneratePage";
import { HistoryPage } from "./pages/history/HistoryPage";
import { SettingsPage } from "./pages/settings/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<GeneratePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
