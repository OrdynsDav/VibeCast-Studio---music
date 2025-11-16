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
    const token = sessionStorage.getItem("token")
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

const playMusic = async (file: string) => {
    try {
        const base64String = await getBase64(`/assets/tracks/${file}.mp3`);

        const audio = new Audio(base64String);
        audio.play();

        audio.addEventListener('error', (e) => {
            console.error('Ошибка воспроизведения:', e);
        });
        audio.addEventListener('play', () => {
            console.log('Песня играет!');
        });
    } catch (error) {
        console.error('Ошибка загрузки трека:', error);
    }
};

const clearAllModals = () => {
    // Удаляем все модалки
    document.querySelectorAll('.modal').forEach(modal => {
        modal.remove();
    });

    // Убираем классы с body
    document.body.classList.remove(
        'play-track',
        'modal-after-register-body',
        'modal-error-play-track-body',
        'play'
    );
};


export {
    areTracksArraysEqual,
    TOKEN,
    getStorageItem,
    setStorageItem,
    removeStrorageItem,
    setCache,
    getBase64,
<<<<<<< Updated upstream
    playMusic
=======
    formatSeconds,
    parseApiDuration,
    clearAllModals
>>>>>>> Stashed changes
}