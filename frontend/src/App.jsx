import { useAuth } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";

import AuthPage from "./pages/AuthPage";
import CallPage from "./pages/CallPage";
import ChatPage from "./pages/ChatPage";
import HomePage from "./pages/HomePage";

import * as Sentry from "@sentry/react";

const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);

const App = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <SentryRoutes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={isSignedIn ? <ChatPage /> : <Navigate to={"/auth"} replace />} />
      <Route path="/auth" element={!isSignedIn ? <AuthPage /> : <Navigate to={"/chat"} replace />} />

      <Route
        path="/call/:id"
        element={isSignedIn ? <CallPage /> : <Navigate to={"/auth"} replace />}
      />

      <Route
        path="*"
        element={isSignedIn ? <Navigate to={"/chat"} replace /> : <Navigate to={"/auth"} replace />}
      />
    </SentryRoutes>
  );
};

export default App;

// first version of routing:
// return (
//   <>
//     <SignedIn>
//       <SentryRoutes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/auth" element={<Navigate to={"/"} replace />} />
//       </SentryRoutes>
//     </SignedIn>

//     <SignedOut>
//       <SentryRoutes>
//         <Route path="/auth" element={<AuthPage />} />
//         <Route path="*" element={<Navigate to={"/auth"} replace />} />
//       </SentryRoutes>
//     </SignedOut>
//   </>
// );
