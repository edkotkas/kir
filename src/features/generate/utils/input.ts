import { MAX_INPUT_LENGTH } from "../constants";

export function clampInput(value: string) {
  return value.slice(0, MAX_INPUT_LENGTH);
}
