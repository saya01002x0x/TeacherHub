import { createContext, useContext, useState } from "react";
import { MOCK_USERS } from "../mock/users";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(MOCK_USERS[0]); // default user A

    const switchUser = (id) => {
        const found = MOCK_USERS.find((u) => u.id === id);
        if (found) setCurrentUser(found);
    };

    return (
        <AuthContext.Provider value={{ currentUser, switchUser, users: MOCK_USERS }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};
