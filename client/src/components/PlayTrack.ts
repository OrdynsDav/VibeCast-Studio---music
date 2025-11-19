import { el, setChildren } from "redom";
import { TrackPlayProps } from "../utils/interfaces";
import {
    createHeartIcon,
    createPauseIcon,
    createPlayIcon,
    createRepeatIcon,
    createShuffleIcon,
    createSkipLeftIcon,
    createSkipRightIcon,
    createSpeakerLowIcon,
    createRepeatOneIcon
} from "./SvgElements";
import { fetchAddFavourite, fetchRemoveFavourite } from "../api/fetches";
import { formatSeconds, parseApiDuration } from "../utils/helpers";
import { modalErrorPlayTrack } from "../utils/modals";

// --- Глобальное состояние плеера ---
let playerInstance: {
    element: HTMLElement;
    audio: HTMLAudioElement;
    destroy: () => void;
    updateTrack: (props: TrackPlayProps) => void;
} | null = null;

let repeatMode: 0 | 1 | 2 = 0;
let isShuffle = false;
let currentTrackProps: TrackPlayProps | null = null;
let interval: number | null = null;

// --- Громкость ---
let isMuted = false;
let savedVolume = 1; // По умолчанию — 100%

// --- Иконки ---
const heartIcon = createHeartIcon();
const shuffleIcon = createShuffleIcon();
const skipLeftIcon = createSkipLeftIcon();
const skipRightIcon = createSkipRightIcon();
const repeatIcon = createRepeatIcon();
const repeatOneIcon = createRepeatOneIcon();
const speakerLowIcon = createSpeakerLowIcon();
const playIcon = createPlayIcon();
const pauseIcon = createPauseIcon();

// --- UI элементы ---
const timeStartEl = el("span", { className: "track-play__time", textContent: "0:00" });
const timeEndEl = el("span", { className: "track-play__time", textContent: "0:00" });
const progressFill = el("div", { className: "track-play__progress-fill" });
const progressBar = el("div", { className: "track-play__progress" }, [progressFill]);

// --- Шкала громкости ---
const volumeFill = el("div", { className: "track-play__progress-fill" });
const volumeHandle = el("div", { className: "track-play__volume-handle" }); // Кружок 12x12
const volumeBar = el("div", { className: "track-play__progress track-play__volume-bar" }, [
    volumeFill,
    volumeHandle
]);

const playPauseBtn = el("button", { className: "track-play__btn track-play__btn--play", type: "button" }, [playIcon]);
const shuffleBtn = el("button", { className: "track-play__btn track-play__btn--shuffle", type: "button" }, [shuffleIcon]);
const skipLeftBtn = el("button", { className: "track-play__btn track-play__btn--skip-left", type: "button" }, [skipLeftIcon]);
const skipRightBtn = el("button", { className: "track-play__btn track-play__btn--skip-right", type: "button" }, [skipRightIcon]);
const repeatBtn = el("button", { className: "track-play__btn track-play__btn--repeat", type: "button" }, [repeatIcon]);
const speakerLowBtn = el("button", { className: "track-play__btn track-play__btn--speaker-low", type: "button" }, [speakerLowIcon]);

const trackImg = el("img", {
    className: "track-play__img",
    src: "",
    alt: "Картинка трека",
    width: 60,
    height: 60,
});

const trackTitle = el("h3", { className: "track-play__title" });
const trackArtist = el("p", { className: "track-play__text" });

const likeBtn = el("button", {
    className: "track-play__btn track-play__btn--like",
    type: "button",
    ariaLabel: "Добавить в избранное",
}, [heartIcon]);

// --- Обновление прогресса ---
const updateProgress = () => {
    if (!currentTrackProps) return;
    const { audio } = playerInstance!;
    const currentTime = audio.currentTime;
    const totalSeconds = parseApiDuration(currentTrackProps.duration);
    const remaining = totalSeconds - currentTime;
    const percent = (currentTime / totalSeconds) * 100;
    progressFill.style.width = `${Math.min(percent, 100)}%`;
    timeStartEl.textContent = formatSeconds(currentTime);
    timeEndEl.textContent = formatSeconds(remaining);
};

// --- Перетаскивание прогресса ---
let isDragging = false;

const startDrag = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    isDragging = true;
    updateProgressBar(e);
    document.addEventListener("mousemove", updateProgressBar);
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchmove", updateProgressBar);
    document.addEventListener("touchend", endDrag);
};

const updateProgressBar = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !currentTrackProps) return;
    const rect = progressBar.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const percent = Math.max(0, Math.min((clientX - rect.left) / rect.width, 1));
    const totalSeconds = parseApiDuration(currentTrackProps.duration);
    playerInstance!.audio.currentTime = percent * totalSeconds;
    updateProgress();
};

const endDrag = () => {
    isDragging = false;
    document.removeEventListener("mousemove", updateProgressBar);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchmove", updateProgressBar);
    document.removeEventListener("touchend", endDrag);
};

progressBar.addEventListener("mousedown", startDrag);
progressBar.addEventListener("touchstart", startDrag, { passive: false });

// --- Перетаскивание громкости ---
let isDraggingVolume = false;

const startDragVolume = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    isDraggingVolume = true;
    updateVolumeBar(e);
    document.addEventListener("mousemove", updateVolumeBar);
    document.addEventListener("mouseup", endDragVolume);
    document.addEventListener("touchmove", updateVolumeBar);
    document.addEventListener("touchend", endDragVolume);
};

const updateVolumeBar = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingVolume) return;
    const rect = volumeBar.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const percent = Math.max(0, Math.min((clientX - rect.left) / rect.width, 1));

    if (isMuted) {
        isMuted = false;
        playerInstance!.audio.volume = savedVolume;
        setChildren(speakerLowBtn, [speakerLowIcon]);
    }

    playerInstance!.audio.volume = percent;
    savedVolume = percent;
    updateVolumeUI();
};

const endDragVolume = () => {
    isDraggingVolume = false;
    document.removeEventListener("mousemove", updateVolumeBar);
    document.removeEventListener("mouseup", endDragVolume);
    document.removeEventListener("touchmove", updateVolumeBar);
    document.removeEventListener("touchend", endDragVolume);
};

volumeBar.addEventListener("mousedown", startDragVolume);
volumeBar.addEventListener("touchstart", startDragVolume, { passive: false });

// Клик по кружку тоже запускает перетаскивание
volumeHandle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    startDragVolume(e);
});

volumeHandle.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDragVolume(e);
});

// --- Обновление UI громкости ---
const updateVolumeUI = () => {
    const volume = isMuted ? 0 : playerInstance?.audio.volume || savedVolume;
    volumeFill.style.width = `${volume * 100}%`;
    volumeHandle.style.left = `calc(${volume * 100}% - 6px)`; // 6px = половина 12px
};

// --- Управление воспроизведением ---
const playTrack = () => {
    if (!playerInstance) return;
    playerInstance.audio
        .play()
        .catch((err) => {
            document.body.append(modalErrorPlayTrack(err.message));
            playerInstance?.destroy();
            pauseTrack();
        });
    setChildren(playPauseBtn, [pauseIcon]);
    playPauseBtn.classList.add("track-play__btn--active");
    if (interval) clearInterval(interval);
    interval = window.setInterval(updateProgress, 100);
    updateVolumeUI();
};

const pauseTrack = () => {
    if (!playerInstance) return;
    playerInstance.audio.pause();
    setChildren(playPauseBtn, [playIcon]);
    playPauseBtn.classList.remove("track-play__btn--active");
    if (interval) clearInterval(interval);
    interval = null;
};

// --- Переключение треков ---
const getNextIndex = () => {
    if (!currentTrackProps || !currentTrackProps.trackList) return 0;
    if (isShuffle) {
        return Math.floor(Math.random() * currentTrackProps.trackList.length);
    } else {
        return (currentTrackProps.currentIndex + 1) % currentTrackProps.trackList.length;
    }
};

const getPrevIndex = () => {
    if (!currentTrackProps || !currentTrackProps.trackList) return 0;
    if (isShuffle) {
        return Math.floor(Math.random() * currentTrackProps.trackList.length);
    } else {
        return (currentTrackProps.currentIndex - 1 + currentTrackProps.trackList.length) % currentTrackProps.trackList.length;
    }
};

const playNextTrack = () => {
    if (!currentTrackProps || !currentTrackProps.trackList) return;
    const { trackList } = currentTrackProps;

    if (repeatMode === 2 && currentTrackProps.currentIndex === trackList.length - 1) {
        updateTrack(trackList[0]);
        return;
    }

    const nextIndex = getNextIndex();
    updateTrack(trackList[nextIndex]);
};

const playPrevTrack = () => {
    if (!currentTrackProps) return;
    if (playerInstance!.audio.currentTime > 2) {
        playerInstance!.audio.currentTime = 0;
        updateProgress();
    } else {
        const prevIndex = getPrevIndex();
        updateTrack(currentTrackProps.trackList![prevIndex]);
    }
};

// --- Обновление трека ---
const updateTrack = (props: TrackPlayProps) => {
    if (!playerInstance) return;

    const { audio } = playerInstance;

    audio.pause();
    if (interval) clearInterval(interval);

    currentTrackProps = { ...props };
    const totalSeconds = parseApiDuration(props.duration);

    audio.src = props.audioFile;
    audio.volume = isMuted ? 0 : savedVolume;
    audio.load();

    trackImg.src = props.imgPath;
    trackTitle.textContent = props.title;
    trackArtist.textContent = props.artist;
    timeEndEl.textContent = formatSeconds(totalSeconds);
    progressFill.style.width = "0%";
    timeStartEl.textContent = "0:00";

    likeBtn.classList.toggle("track-play__btn--like-active", props.isFavourite ?? false);

    playTrack();
};

// --- Создание плеера ---
const createPlayer = () => {
    const audio = new Audio();
    audio.volume = savedVolume;

    const player = el("div", { className: "track-play" }, [
        el("div", { className: "track-play__info" }, [
            trackImg,
            el("div", { className: "track-play__description" }, [
                el("div", { className: "track-play__title-wrap" }, [trackTitle, likeBtn]),
                trackArtist,
            ]),
        ]),
        el("div", { className: "track-play__settings" }, [
            el("div", { className: "track-play__actions" }, [shuffleBtn, skipLeftBtn, playPauseBtn, skipRightBtn, repeatBtn]),
            el("div", { className: "track-play__progress-bar" }, [timeStartEl, progressBar, timeEndEl]),
        ]),
        el("div", { className: "track-play__volume" }, [
            speakerLowBtn,
            volumeBar
        ]),
    ]);

    // --- События кнопок ---
    playPauseBtn.onclick = () => {
        if (audio.paused) playTrack();
        else pauseTrack();
    };

    skipLeftBtn.onclick = playPrevTrack;
    skipRightBtn.onclick = playNextTrack;

    shuffleBtn.onclick = () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle("track-play__btn--active", isShuffle);
        if (isShuffle) {
            repeatMode = 0;
            repeatBtn.classList.remove("track-play__btn--active");
            setChildren(repeatBtn, [repeatIcon]);
        }
    };

    repeatBtn.onclick = () => {
        if (repeatMode === 0) {
            repeatMode = 2;
            setChildren(repeatBtn, [repeatIcon]);
            repeatBtn.classList.add("track-play__btn--active");
        } else if (repeatMode === 2) {
            repeatMode = 1;
            setChildren(repeatBtn, [repeatOneIcon]);
            repeatBtn.classList.add("track-play__btn--active");
        } else {
            repeatMode = 0;
            setChildren(repeatBtn, [repeatIcon]);
            repeatBtn.classList.remove("track-play__btn--active");
        }

        if (repeatMode !== 0) {
            isShuffle = false;
            shuffleBtn.classList.remove("track-play__btn--active");
        }
    };

    speakerLowBtn.onclick = () => {
        if (!playerInstance) return;
        if (isMuted) {
            playerInstance.audio.volume = savedVolume;
            isMuted = false;
            setChildren(speakerLowBtn, [speakerLowIcon]);
        } else {
            savedVolume = playerInstance.audio.volume;
            playerInstance.audio.volume = 0;
            isMuted = true;
        }
        updateVolumeUI();
    };

    likeBtn.onclick = () => {
        if (!currentTrackProps) return;
        const isRemoved = !likeBtn.classList.toggle("track-play__btn--like-active");
        if (isRemoved) {
            fetchRemoveFavourite(currentTrackProps.id);
        } else {
            fetchAddFavourite(currentTrackProps.id);
        }
    };

    trackImg.onerror = function (this: HTMLImageElement) {
        this.src = "/assets/images/track-placeholder.png";
        this.onerror = null;
    };

    audio.addEventListener("ended", () => {
        if (repeatMode === 1) {
            audio.currentTime = 0;
            audio.play().catch(err => console.error("Auto-play failed:", err));
            updateProgress();
        } else if (repeatMode === 2) {
            const nextIndex = getNextIndex();
            updateTrack(currentTrackProps!.trackList![nextIndex]);
        } else {
            const nextIndex = getNextIndex();
            if (currentTrackProps!.currentIndex !== currentTrackProps!.trackList!.length - 1) {
                updateTrack(currentTrackProps!.trackList![nextIndex]);
            } else {
                pauseTrack();
            }
        }
    });

    return {
        element: player,
        audio,
        destroy: () => {
            audio.pause();
            if (interval) clearInterval(interval);
            player.classList.remove("track-play--show");
            setTimeout(() => {
                if (player.isConnected) player.remove();
            }, 300);
            document.body.classList.remove("play");
            playerInstance = null;
        },
        updateTrack,
    };
};

// --- Основная функция PlayTrack ---
export const PlayTrack = (props: TrackPlayProps) => {
    if (!playerInstance) {
        playerInstance = createPlayer();
        document.body.appendChild(playerInstance.element);

        requestAnimationFrame(() => {
            playerInstance!.element.classList.add("track-play--show");
        });

        document.body.classList.add("play");
    }

    playerInstance.updateTrack(props);
};