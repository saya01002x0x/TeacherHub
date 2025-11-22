import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Routes, Route, Navigate } from "react-router";
import * as Sentry from "@sentry/react";
import { useAuth } from "./context/AuthContext";

const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);

const App = () => {
    const { currentUser } = useAuth();

    return (
        <>
            <div style={{ padding: 20 }}>
                <h1>Testing Mock User</h1>
                <pre>{JSON.stringify(currentUser, null, 2)}</pre>
            </div>
            {/*<SignedIn>*/}
            {/*    <SentryRoutes>*/}
            {/*        <Route path="/" element={<HomePage />} />*/}
            {/*        <Route path="/auth" element={<Navigate to={"/"} replace />} />*/}
            {/*    </SentryRoutes>*/}
            {/*</SignedIn>*/}

            {/*<SignedOut>*/}
            {/*    <SentryRoutes>*/}
            {/*        <Route path="/auth" element={<AuthPage />} />*/}
            {/*        <Route path="*" element={<Navigate to={"/auth"} replace />} />*/}
            {/*    </SentryRoutes>*/}
            {/*</SignedOut>*/}
        </>
    );
};

export default App;