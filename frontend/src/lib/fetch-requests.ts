type FetchVerb = "get" | "post" | "put" | "delete";

async function fetchRequest<T>(url: string, options: RequestInit) {
    const response = await fetch(url, options);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An error occurred");
    }

    return await response.json() as T;
}

type RequestParams<T, P = T> = {
    url: string;
    data?: any;
    query?: Record<string, string>;
    postProcess?: (data: T) => P | Promise<P>;
};

async function request<T, P>(verb: FetchVerb, params: RequestParams<T, P>) {
    const { url, data, query, postProcess } = params;

    const urlWithParams = query
        ? `${url}?${new URLSearchParams(query).toString()}`
        : url;

    const options: RequestInit = {
        method: verb.toUpperCase(),
        headers: {
            "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
    };

    try {
        const rawData = await fetchRequest<T>(urlWithParams, options);
        return (postProcess ? await postProcess(rawData) : rawData) as P;
    } catch (error) {
        console.error(`Error in ${verb.toUpperCase()} request:`, error);
        throw error;
    }
}

function getRequest<T, P = T>(params: RequestParams<T, P>) {
    return request<T, P>("get", params);
}

function postRequest<T, P = T>(params: RequestParams<T, P>) {
    return request<T, P>("post", params);
}

function putRequest<T, P = T>(params: RequestParams<T, P>) {
    return request<T, P>("put", params);
}

function deleteRequest<T, P = T>(params: RequestParams<T, P>) {
    return request<T, P>("delete", params);
}

export { getRequest, postRequest, putRequest, deleteRequest };
