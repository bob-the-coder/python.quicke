

export const createFetchJSON = (apiRoot: string) => {
    return async (url: string, options: RequestInit = {}): Promise<any> => {
        const fullUrl = `${apiRoot}${url.startsWith("/") ? url : `/${url}`}`;

        const response = await fetch(fullUrl, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    };
};

export const fetchJSON = createFetchJSON(import.meta.env.VITE_QUICKE_API_ROOT);

