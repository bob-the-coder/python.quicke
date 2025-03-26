import React, { JSX, Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { CgSpinner } from "react-icons/cg";

type RouteTree = {
    page?: string,
    layout?: string,
    children: Record<string, RouteTree>
}

// Use Record type for better type safety with modules
type ModuleRecord = Record<string, () => Promise<{ default: any }>>;

// Update the glob pattern to be more specific
const modules: ModuleRecord = import.meta.glob([
    "/src/pages/**/page.tsx",
    "/src/pages/**/layout.tsx"
], {
    eager: false,
    import: 'default'
});

// Create a memoization cache for lazy components to avoid recreating them
const componentCache = new Map<string, React.LazyExoticComponent<any>>();

// Helper to create cached lazy components
const createLazyComponent = (modulePath: string) => {
    if (!componentCache.has(modulePath)) {
        componentCache.set(
            modulePath,
            lazy(() => modules[modulePath]().then(mod => ({ default: mod })))
        );
    }
    return componentCache.get(modulePath)!;
};

const routeTree: {
    "": RouteTree
} = { "": { children: {} } };

const parseRouteParams = (path: string): string => {
    return path
        .split('/')
        .map(segment => segment.startsWith('[') && segment.endsWith(']') ? 
            `:${segment.slice(1, -1)}` : segment)
        .join('/');
};

// Build route tree from modules
for (const path in modules) {
    const cleanPath = path.replace("/src/pages/", "");
    const parts = cleanPath.split("/");
    
    let current = routeTree[""];

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (part === "page.tsx") {
            current.page = path;
            break;
        }

        if (part === "layout.tsx") {
            current.layout = path;
            break;
        }

        if (!current.children[part]) {
            current.children[part] = { children: {} };
        }
        current = current.children[part];
    }
}

// Placeholder component with configurable size
const Placeholder = ({ size = 36 }: { size?: number }) => (
    <div className="w-full h-full bg-inherit flex flex-center text-inherit">
        <CgSpinner className="animation spin" size={size} />
    </div>
);

type TLayout = (props: { children: React.ReactNode }) => JSX.Element;
const NoLayout: TLayout = ({ children }) => <>{children}</>;

const routes: React.ReactElement[] = [];

const generateRoutes = (
    route: RouteTree, 
    path: string = "", 
    parentLayout: TLayout | null = null
): void => {
    const { page, layout, children } = route;

    const ParentLayout = parentLayout || NoLayout;
    let LevelLayout: TLayout = NoLayout;
    
    if (layout) {
        const LazyLayout = createLazyComponent(layout);
        LevelLayout = ({ children }) => <LazyLayout>{children}</LazyLayout>;
    }

    const FinalLayout: TLayout = ({ children }) => (
        <ParentLayout>
            <LevelLayout>{children}</LevelLayout>
        </ParentLayout>
    );

    // Generate model-specific routes at root level
    // if (path === "") {
    //     ModelMetadata.getValues().forEach(metadata => {
    //         routes.push(
    //             <Route 
    //                 key={metadata.route} 
    //                 path={metadata.route} 
    //                 element={(
    //                     <Suspense fallback={<Placeholder />}>
    //                         <FinalLayout>
    //                             <metadata.component />
    //                         </FinalLayout>
    //                     </Suspense>
    //                 )}
    //             />
    //         );
    //     });
    // }

    // Generate page route if it exists
    if (page) {
        const LazyPage = createLazyComponent(page);
        const parsedPath = parseRouteParams(path);
        
        routes.push(
            <Route 
                key={parsedPath || "/"} 
                path={parsedPath || "/"} 
                element={(
                    <Suspense fallback={<Placeholder />}>
                        <FinalLayout>
                            <LazyPage />
                        </FinalLayout>
                    </Suspense>
                )}
            />
        );
    }

    // Generate child routes
    Object.entries(children).forEach(([key, childRoute]) => {
        generateRoutes(childRoute, `${path}/${key}`, FinalLayout);
    });
};

generateRoutes(routeTree[""], "");

export default routes;