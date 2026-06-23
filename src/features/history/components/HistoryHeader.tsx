import { useNavigate } from "react-router";

import { BackIcon } from "../../../components";

export function HistoryHeader() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/")}
      className="inline-flex w-fit items-center gap-1.5 text-sm text-stone-400 transition hover:text-stone-100"
    >
      <BackIcon className="h-4 w-4" />
      Back
    </button>
  );
}
