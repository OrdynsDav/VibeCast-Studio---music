import { el, setChildren } from "redom";
<<<<<<< Updated upstream
import { TrackPlayProps } from "../utils/interfaces";
import { createHeartIcon, createPauseIcon, createPlayIcon, createRepeatIcon, createShuffleIcon, createSkipLeftIcon, createSkipRightIcon } from "./SvgElements";

export const PlayTrack = ({ title, artist }: TrackPlayProps) => {
    const heartIcon = createHeartIcon()
    const shuffleIcon = createShuffleIcon()
    const skipLeftIcon = createSkipLeftIcon()
    const skipRightIcon = createSkipRightIcon()
    const playIcon = createPlayIcon()
    const pauseIcon = createPauseIcon()
    const repeatIcon = createRepeatIcon()

    document.body.append(
        el('div', {
            className: 'track-play'
        }, [
            el('div', {
                className: 'track-play__info'
            }, [
                el('img', {
                    className: 'track-play__img',
                    /* src: `/assets/images/${title}.png`, */
                    width: 60,
                    height: 60,
                }),
                el('div', {
                    className: 'track-play__description'
                }, [
                    el('div', {
                        className: 'track-play__title-wrap'
                    }, [
                        el('h3', {
                            className: 'track-play__title',
                            textContent: title
                        }),
                        heartIcon,
                    ]),
                    el('p', {
                        className: 'track-play__text',
                        textContent: artist
                    })
                ])
=======
import { TrackPlayProps } from "../../src/utils/interfaces";
import { createHeartIcon, createPauseIcon, createPlayIcon, createRepeatIcon, createShuffleIcon, createSkipLeftIcon, createSkipRightIcon, createSpeakerLowIcon } from "./SvgElements";
import { fetchAddFavourite, fetchRemoveFavourite } from "../../src/api/fetches";
import { formatSeconds, parseApiDuration } from "../utils/helpers";
import { modalErrorPlayTrack } from "../utils/modals";
import { MAIN_CONTAINER } from "../utils/constants";

let currentTrack: { destroy: () => void; audio: HTMLAudioElement } | null = null;
let playerCount = 0;

export const PlayTrack = ({ id, title, artist, imgPath, duration, audioFile }: TrackPlayProps) => {
    const heartIcon = createHeartIcon();
    const shuffleIcon = createShuffleIcon();
    const skipLeftIcon = createSkipLeftIcon();
    const skipRightIcon = createSkipRightIcon();
    const playIcon = createPlayIcon();
    const pauseIcon = createPauseIcon();
    const repeatIcon = createRepeatIcon();
    const speakerLowIcon = createSpeakerLowIcon();

    // Аудио и данные
    const audio = new Audio(audioFile);
    const totalSeconds = parseApiDuration(duration);

    // DOM-элементы прогресса
    const timeStartEl = el('span', { className: 'track-play__time', textContent: '0:00' });
    const timeEndEl = el('span', { className: 'track-play__time', textContent: formatSeconds(totalSeconds) });
    const progressFill = el('div', { className: 'track-play__progress-fill' });
    const progressBar = el('div', { className: 'track-play__progress' }, [progressFill]);

    // Кнопка Play/Pause
    const playPauseBtn = el('button', { className: 'track-play__btn track-play__btn--play', type: 'button' }, [playIcon]);

    // Управление: интервал и драг
    let interval: number | null = null;
    let isDragging = false;

    const updateProgress = () => {
        const currentTime = audio.currentTime;
        const remaining = totalSeconds - currentTime;
        const percent = (currentTime / totalSeconds) * 100;

        progressFill.style.width = `${Math.min(percent, 100)}%`;
        timeStartEl.textContent = formatSeconds(currentTime);
        timeEndEl.textContent = formatSeconds(remaining);
    };

    // Перемотка: начало
    const startDrag = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        isDragging = true;
        updateProgressBar(e);
        document.addEventListener('mousemove', updateProgressBar);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchmove', updateProgressBar);
        document.addEventListener('touchend', endDrag);
    };


    // Обновление при drag
    const updateProgressBar = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;

        const rect = progressBar.getBoundingClientRect();
        let clientX: number;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }

        const percent = Math.max(0, Math.min((clientX - rect.left) / rect.width, 1));
        const newTime = percent * totalSeconds;

        audio.currentTime = newTime;
        updateProgress();
    };


    // Обработка touchmove с preventDefault
    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        updateProgressBar(e);
    };

    // Окончание перемотки
    const endDrag = () => {
        isDragging = false;
        document.removeEventListener('mousemove', updateProgressBar);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', endDrag);
    };

    // Контроль воспроизведения
    playPauseBtn.onclick = () => {
        if (audio.paused) {
            audio.play().catch((err) => {
                /* document.body.append(modalErrorPlayTrack(err.message)) */
                if (MAIN_CONTAINER) {
                    MAIN_CONTAINER.append(modalErrorPlayTrack(err.message));
                }

                if (currentTrack && currentTrack.audio === audio) {
                    currentTrack.destroy();
                }
            }
            );
            setChildren(playPauseBtn, [pauseIcon]);
            playPauseBtn.classList.add('track-play__btn--active');

            if (interval) clearInterval(interval);
            interval = window.setInterval(updateProgress, 100);
        } else {
            audio.pause();
            setChildren(playPauseBtn, [playIcon]);
            playPauseBtn.classList.remove('track-play__btn--active');

            if (interval) clearInterval(interval);
            interval = null;
        }
    };

    // При окончании трека
    audio.addEventListener('ended', () => {
        if (interval) clearInterval(interval);
        interval = null;

        progressFill.style.width = '100%';
        timeStartEl.textContent = formatSeconds(totalSeconds);
        timeEndEl.textContent = '0:00';

        setChildren(playPauseBtn, [playIcon]);
        playPauseBtn.classList.remove('track-play__btn--active');
    });

    // Перемотка: клик и удержание
    progressBar.addEventListener('mousedown', startDrag);
    progressBar.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrag(e);
    });

    const initPlayback = () => {
        audio.play().catch(err => {
            /* document.body.append(modalErrorPlayTrack(err.message)) */
            if (MAIN_CONTAINER) {
                MAIN_CONTAINER.append(modalErrorPlayTrack(err.message));
            }
            if (currentTrack && currentTrack.audio === audio) {
                currentTrack.destroy();
            }
        });

        setChildren(playPauseBtn, [pauseIcon]);
        playPauseBtn.classList.add('track-play__btn--active');

        if (interval) clearInterval(interval);
        interval = window.setInterval(updateProgress, 100);
    };

    const player = el('div', { className: 'track-play' }, [
        el('div', { className: 'track-play__info' }, [
            el('img', {
                className: 'track-play__img',
                src: imgPath,
                alt: 'Картинка трека',
                width: 60,
                height: 60,
                onerror: (e: Event) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/assets/images/track-placeholder.png';
                    img.onerror = null;
                }
            }),
            el('div', { className: 'track-play__description' }, [
                el('div', { className: 'track-play__title-wrap' }, [
                    el('h3', { className: 'track-play__title', textContent: title }),
                    el('button', {
                        className: 'track-play__btn track-play__btn--like',
                        type: 'button',
                        onclick: (e: Event) => {
                            const target = e.target as HTMLElement;
                            const isRemoved = !target.classList.toggle('track-play__btn--like-active');
                            if (isRemoved) {
                                fetchRemoveFavourite(id);
                            } else {
                                fetchAddFavourite(id);
                            }
                        },
                        ariaLabel: 'Добавить в избранное'
                    }, [heartIcon])
                ]),
                el('p', { className: 'track-play__text', textContent: artist })
            ])
        ]),
        el('div', { className: 'track-play__settings' }, [
            el('div', { className: 'track-play__actions' }, [
                el('button', { className: 'track-play__btn track-play__btn--shuffle', type: 'button' }, [shuffleIcon]),
                el('button', { className: 'track-play__btn track-play__btn--skip-left', type: 'button' }, [skipLeftIcon]),
                playPauseBtn,
                el('button', { className: 'track-play__btn track-play__btn--skip-right', type: 'button' }, [skipRightIcon]),
                el('button', { className: 'track-play__btn track-play__btn--repeat', type: 'button' }, [repeatIcon])
>>>>>>> Stashed changes
            ]),
            el('div', {
                className: 'track-play__settings'
            }, [
                el('div', {
                    className: 'track-play__actions'
                }, [
                    el('button', {
                        className: ['track-play__btn track-play__btn--shuffle'],
                        type: 'button',
                    }, [
                        shuffleIcon
                    ]),
                    el('button', {
                        className: ['track-play__btn track-play__btn--skip-left'],
                        type: 'button',
                    }, [
                        skipLeftIcon
                    ]),
                    el('button', {
                        className: ['track-play__btn track-play__btn--play'],
                        type: 'button',
                        onclick: () => {
                            const btn = document.querySelector('.track-play__btn--play')
                            if (!btn) {
                                return
                            }
                            btn.classList.toggle('track-play__btn--active')

                            if (btn.classList.contains('track-play__btn--active')) {
                                setChildren(btn, [pauseIcon])
                            } else {
                                setChildren(btn, [playIcon])
                            }
                        }
                    }, [
                        playIcon
                    ]),
                    
                    el('button', {
                        className: ['track-play__btn track-play__btn--skip-right'],
                        type: 'button',
                    }, [
                        skipRightIcon
                    ]),
                    el('button', {
                        className: ['track-play__btn track-play__btn--repeat'],
                        type: 'button',
                    }, [
                        repeatIcon
                    ]),
                ])
            ]),
            el('div', {
                className: 'track-play__volume'
            }, [
            ])
        ])
<<<<<<< Updated upstream
    )
}
=======
    ]);

    document.body.appendChild(player);

    requestAnimationFrame(() => {
        player.classList.add('track-play--show');
    });

    if (currentTrack) {
        currentTrack.destroy();
        currentTrack = null;
    }

    playerCount++;
    if (playerCount === 1) {
        document.body.classList.add('play');
    }

    currentTrack = {
        destroy: () => {
            if (interval) clearInterval(interval);
            audio.pause();

            player.classList.remove('track-play--show');

            playerCount = Math.max(0, playerCount - 1);

            if (playerCount === 0) {
                document.body.classList.remove('play');
            }

            setTimeout(() => {
                if (player.isConnected) player.remove();
            }, 300);
        },
        audio
    };

    initPlayback();

    return currentTrack;
};
>>>>>>> Stashed changes
