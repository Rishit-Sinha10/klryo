import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";
import App from "./App";
import { Analytics } from "@vercel/analytics/react";
import * as Sentry from "@sentry/react";
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk publishable key");
}
Sentry.init({
  dsn: "https://2593269533fb692aeb69f875e01082fc@o4512095166988288.ingest.de.sentry.io/4512095174131792",
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  dataCollection: {
    // userInfo: false,
    // httpBodies: []
  },
});
createRoot(document.getElementById("root")).render(
  <Sentry.ErrorBoundary
    fallback={<p>Something went wrong. We've been notified.</p>}
  >
    <BrowserRouter>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <ThemeProvider>
          <ToastProvider>
            <Analytics />
            <App />
          </ToastProvider>
        </ThemeProvider>
      </ClerkProvider>
    </BrowserRouter>
  </Sentry.ErrorBoundary>,
);
