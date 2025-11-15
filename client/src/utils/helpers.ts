import { TrackProps } from "./interfaces";

function areTracksArraysEqual(a: TrackProps[], b: TrackProps[]): boolean {
    if (a.length !== b.length) return false;

    return a.every((track, index) => {
        const other = b[index];
        return (
            track.id === other.id &&
            track.title === other.title &&
            track.artist === other.artist &&
            track.album === other.album &&
            track.duration === other.duration &&
            track.size_mb === other.size_mb &&
            track.encoded_audio === other.encoded_audio
        );
    });
}

const getStorageItem = (item: string): string | null => localStorage.getItem(item);
const setStorageItem = (name: string, item: string): void => localStorage.setItem(name, item);
const removeStrorageItem = (name: string): void => localStorage.removeItem(name);
const TOKEN = (): string | null => {
    const token = getStorageItem("token")
    return token
}

const setCache = (name: string, item: string | TrackProps[]): void => {
    const valueToStore = Array.isArray(item) ? JSON.stringify(item) : item;
    localStorage.setItem(name, valueToStore);
}

async function getBase64(filePath: string): Promise<string> {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Файл не найден или не загружен.');

        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
        const base64String = btoa(binaryString);

        return `data:audio/mpeg;base64,${base64String}`;
    } catch (error) {
        console.error('Ошибка загрузки или кодирования:', error);
        throw error;
    }
}

// Форматирует секунды в MM:SS (например, 1:30)
function formatSeconds(seconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Переводит API-формат 2.43 → 2 минуты 43 секунды → 163 секунды
function parseApiDuration(apiValue: number): number {
    const minutes = Math.floor(apiValue);
    const seconds = Math.round((apiValue - minutes) * 100); // 0.43 → 43
    return minutes * 60 + seconds;
}

export {
    areTracksArraysEqual,
    TOKEN,
    getStorageItem,
    setStorageItem,
    removeStrorageItem,
    setCache,
    getBase64,
    formatSeconds,
    parseApiDuration
}