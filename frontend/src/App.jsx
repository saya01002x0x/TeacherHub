import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Routes, Route, Navigate } from "react-router";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import * as Sentry from "@sentry/react";
import "./index.css";
// import { useAuth } from "./context/AuthContext";

const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);

const App = () => {
    // const { currentUser } = useAuth();

    return (
        <>
            <SentryRoutes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<Navigate to={"/"} replace />} />
            </SentryRoutes>

            {/*<SentryRoutes>*/}
            {/*    <Route path="/auth" element={<AuthPage />} />*/}
            {/*    <Route path="*" element={<Navigate to={"/auth"} replace />} />*/}
            {/*</SentryRoutes>*/}
        </>
    );
};

export default App;