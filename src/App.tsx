import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider, useStore } from "./store/StoreContext";
import { HomePage } from "./features/home/HomePage";
import { OnboardingPage } from "./features/onboarding/OnboardingPage";

function AppRoutes() {
  const { state } = useStore();

  if (!state.settings.onboardingCompleted) {
    return <OnboardingPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<Navigate to="/" replace />} />
      <Route path="/group/new" element={<Navigate to="/" replace />} />
      <Route path="/group/edit" element={<Navigate to="/" replace />} />
      <Route path="/time-search" element={<Navigate to="/" replace />} />
      <Route path="/settings" element={<Navigate to="/" replace state={{ openSettings: true }} />} />
      <Route path="/city-order" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StoreProvider>
  );
}
