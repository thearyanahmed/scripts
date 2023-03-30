export type Result<T, E> = Ok<T> | Err<E>;
export type Headers = Record<string, string>;

interface Ok<T> {
    type: "ok";
    value: T;
}

interface Err<E> {
    type: "err";
    error: E;
}

export type ErrorMessage = {
    error: string;
    message: string;
};

function Err<E>(data: E): Err<E> {
    return { type: "err", error: data };
}

function Ok<T>(data: T): Ok<T> {
    return { type: "ok", value: data };
}

function getAbsUrl(path: string) {
    const baseUrl = 'localhost:3000' // process.env.NEXT_PUBLIC_BASE_URL

    return baseUrl + "/" + path
}

async function makeRequest<T>(method: string, url: string, formdata: any, headers: Headers | null): Promise<Result<T, ErrorMessage>> {
    const absUrl = getAbsUrl(url)

    let requestHeaders: Headers = {
        "Content-Type": "application/json",
    }

    if (headers !== null) {
        for (const key in headers) {
            requestHeaders[key] = headers[key]
        }
    }

    let config: Record<string, any> = {
        method: method,
        headers: requestHeaders,
    }

    if (formdata) {
        config.body = JSON.stringify(formdata);
    }

    const res = await fetch(absUrl, config);

    return await apiResponse(res)
}

export async function post<T>(url: string, formdata: any, headers: Headers | null): Promise<Result<T, ErrorMessage>> {
    return makeRequest('POST', url, formdata, headers)
}

export async function get<T>(url: string, formdata: any, headers: Headers | null): Promise<Result<T, ErrorMessage>> {
    return makeRequest('get', url, formdata, headers)
}

async function apiResponse<T>(res: Response): Promise<Result<T, ErrorMessage>> {
    const success = res.ok
    const data = await res.json()

    if (success) {
        return Ok(data)
    }
    return Err(data)
}

export function handleResult<T, E>(r: Result<T, E>, onSuccess: Function, onError: Function): any {
    switch (r.type) {
        case "ok":
            return onSuccess(r.value)
        case "err":
            return onError(r.error)
    }
}