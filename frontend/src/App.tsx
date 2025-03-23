import {BrowserRouter, Routes} from "react-router-dom";
import routes from "@/lib/generate-routes.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { PreferencesProvider } from "./lib/preferences-context";
import { UserProvider } from "./lib/profile-context";

const queryClient = new QueryClient();

const App = () => {
    return (
        <UserProvider>
        <PreferencesProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Routes>
                        {routes}
                    </Routes>
                </BrowserRouter>
            </QueryClientProvider>
        </PreferencesProvider>
        </UserProvider>
    );
};

export default App;