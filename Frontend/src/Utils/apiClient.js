import { urlDB } from "../urlDB";

export function getAuthHeaders(extraHeaders = {}) {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`,
        ...extraHeaders,
    };
}

async function parseErrorMessage(response, fallback) {
    try {
        const data = await response.json();
        if (typeof data?.detail === "string") return data.detail;
        if (Array.isArray(data?.detail)) {
            return data.detail
                .map((item) => item?.msg || item?.message || JSON.stringify(item))
                .join(", ");
        }
        if (typeof data?.message === "string") return data.message;
    } catch {
        try {
            const text = await response.text();
            if (text) return text;
        } catch {
            // ignore
        }
    }
    return fallback;
}

export async function requestJson(endpoint, options = {}) {
    const {
        method = "GET",
        body,
        headers = {},
        fallbackError = "Se produjo un error en la solicitud",
    } = options;

    const url = await urlDB(endpoint);
    const requestHeaders = { ...getAuthHeaders(), ...headers };
    const requestOptions = { method, headers: requestHeaders };

    if (body !== undefined) {
        if (body instanceof FormData) {
            requestOptions.body = body;
            delete requestHeaders["Content-Type"];
        } else {
            requestHeaders["Content-Type"] = "application/json";
            requestOptions.body = JSON.stringify(body);
        }
    }

    const response = await fetch(url, requestOptions);
    if (!response.ok) {
        throw new Error(await parseErrorMessage(response, fallbackError));
    }

    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return response.json();
    }

    return response.text();
}
