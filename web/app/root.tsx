import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  Navigate,
  ScrollRestoration,
  useNavigation,
} from "react-router";
import { redirect } from "react-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./Context/AppContext";
import type { Route } from "./+types/root";
import "./app.css";
import Aside from "./components/Aside";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <main className="mx-auto flex gap-4 w-full bg-gray-300">
          <Aside />
          <div className="flex-1 bg-white m-1 rounded-md p-2">{children}</div>
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-indigo-600" />
    </div>
  );
}

export default function App() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId="767126589910-1dkq7e4p4f92aufiv7h01pkjn9ouhtmn.apps.googleusercontent.com">
        {isLoading && (
          <LoadingSpinner size={6} color="border-green-500" />
        )}
        <div className="relative flex-1">
          {navigation.state === "loading" ? (
            <div className="p-4">Loading page…</div>
          ) : (
            <Outlet />
          )}
        </div>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}
