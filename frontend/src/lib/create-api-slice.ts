import {deleteRequest, getRequest, postRequest, putRequest} from "@/lib/fetch-requests.ts";
import {Constructor} from "@/lib/model-metadata.ts";
import BaseModel from "@/models/_base.ts";

export type PageResponse<T> = {
    items: T[];
    page: number;
    maxPage: number;
    totalCount: number;
}

function withEndSlash(url: string) {
    url = url.trim();
    if (url.endsWith('/')) return url;

    return `${url}/`;
}

export const createApiSliceForModel = <T extends BaseModel = BaseModel>(
    route: string,
    model: Constructor<T>
) => {
    const itemUrlProvider = (id: string) => `${route}/${id}/`;
    const url = {
        base: withEndSlash(route),
        item: itemUrlProvider,
        search: withEndSlash(route),
        delete: (id: string) => `${itemUrlProvider(id)}delete/`
    }
    return {
        _url: url,
        create: () => postRequest<T>({
            url: url.base,
            postProcess: data => new model(data),
        }),
        get: (id: string) => getRequest<T>({
            url: url.item(id),
            postProcess: data => new model(data)
        }),
        update: (id: string, data: Partial<T>) => putRequest<T>({
            url: url.item(id),
            data,
            postProcess: data => new model(data)
        }),
        delete: (id: string) => deleteRequest<boolean>({
            url: url.delete(id),
            postProcess: () => true
        }),
        search: (search: string, page: number, count: number) => getRequest<PageResponse<T>>({
            url: url.search,
            query: {
                search: search,
                page: page.toString(),
                count: count.toString(),
            }
        }),
    }
}