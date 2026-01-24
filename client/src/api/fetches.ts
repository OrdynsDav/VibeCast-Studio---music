import { TOKEN } from "../utils/helpers";
import { LoginProps, ResponseTrackProps } from "../utils/interfaces";

const BASE_URL = "https://vibecast-studio-music.onrender.com/api";

async function validateResponse(response: Response): Promise<Response> {
    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response
}

export const fetchTracks = async (): Promise<ResponseTrackProps> => {
    return (
        await fetch(`${BASE_URL}/tracks`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })
            .then(validateResponse)
            .then((res) => res.json())
    )
}

export const fetchGetFavourites = async (): Promise<ResponseTrackProps> => {
    return (
        await fetch(`${BASE_URL}/favorites`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN()}`,
            }
        })
            .then(validateResponse)
            .then((res) => res.json())
    )
}

export const fetchAddFavourite = async (trackId: number): Promise<void> => {
    return await fetch(`${BASE_URL}/favorites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN()}`,
        },
        body: JSON.stringify({ trackId })
    }
    )
        .then(validateResponse)
        .then(() => undefined);
}

export const fetchRemoveFavourite = async (trackId: number): Promise<void> => {
    await fetch(`${BASE_URL}/favorites`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN()}`,
            },
            body: JSON.stringify({ trackId })
        }
    )
}

export const fetchRegister = (username: string, password: string): Promise<void> => {
    return fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        })
    })
        .then(validateResponse)
        .then(() => undefined)
}

export const fetchLogin = (username: string, password: string): Promise<LoginProps> => {
    return fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        })
    })
        .then(validateResponse)
        .then((res) => res.json())
}