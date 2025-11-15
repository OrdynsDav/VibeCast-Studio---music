import { el, setChildren } from "redom";
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
    )
}