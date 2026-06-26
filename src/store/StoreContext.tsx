import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { reducer, type Action } from "./reducer";
import { createInitialState } from "./initialState";
import { applyColorMode } from "../lib/colorMode";
import { applyAppLanguage } from "../lib/syncAppLanguage";
import { loadState, saveState } from "./persistence";
import type { AppState } from "./types";

interface StoreContextValue {
  state: AppState;
  dispatch: (action: Action) => void;
  storageReset: boolean;
  clearStorageReset: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const loaded = useRef(loadState());
  const [state, dispatch] = useReducer(reducer, loaded.current.state);
  const [storageReset, setStorageReset] = useState(loaded.current.reset);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    applyAppLanguage(state.settings.language);
  }, [state.settings.language]);

  useEffect(() => {
    applyColorMode(state.settings.colorMode);
    if (state.settings.colorMode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyColorMode("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [state.settings.colorMode]);

  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
        storageReset,
        clearStorageReset: () => setStorageReset(false),
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}
