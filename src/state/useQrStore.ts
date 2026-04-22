import { useContext } from "react";
import { QrStoreContext } from "../types/qr";

export function useQrStore() {
  const context = useContext(QrStoreContext);
  if (!context) {
    throw new Error("useQrStore must be used within QrStoreProvider");
  }
  return context;
}
