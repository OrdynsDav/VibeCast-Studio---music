import { el } from "redom";
import { createHeartIcon, createMoreIcon } from "../../SvgElements";
import { fetchAddFavourite, fetchRemoveFavourite } from "../../../api/fetches";
import { PlayTrack } from "../../PlayTrack";

export default class DesktopTrack {
    constructor(
        public id: number,
        public title: string,
        public artist: string,
        public duration: number,
        public album: string
    ) { }

    getTrack(position: number): HTMLElement {
        const svgHeart = createHeartIcon();
        const svgMore = createMoreIcon();

        const album = (): string => {
            switch (this.album) {
                case 'none':
                    return 'Неизвестно';
                case 'single':
                    return 'Сингл';
                default:
                    return this.album;
            }
        };

        const likeClassName = (): string => {
            const section = document.querySelector('.tracks') as HTMLElement;
            if (section.classList.contains('is-favourites')) {
                return "tracks__like tracks__like--active";
            } else {
                return "tracks__like";
            }
        };
        return el("tr",
            [
                el("td", {
                    className: "tracks__td tracks__td--count",
                    textContent: (position + 1).toString()
                }),
                el("td", {
                    className: "tracks__td tracks__td--info"
                }, [
                    el('button', {
                        className: 'tracks__btn',
                        type: "button",
                        onclick: () => PlayTrack({
                            id: this.id,
                            title: this.title,
                            artist: this.artist,
                            imgPath: `/assets/images/${this.album !== 'single' && this.album !== 'none' ? `albums/${this.album}` : `singles/${this.title}`}.webp`, 
                            duration: this.duration, 
                            audioFile: `/assets/tracks/${this.title}.mp3`
                        })
                    }, [
                        el("img", {
                            className: "tracks__img",
                            src: `/assets/images/${this.album !== 'single' && this.album !== 'none' ? `albums/${this.album}` : `singles/${this.title}`}.webp`,
                            alt: "Картинка трека",
                            loading: "lazy",
                            onerror: (event: Event) => {
                                const img = event.target as HTMLImageElement;
                                img.src = "/assets/images/track-placeholder.png";
                                img.classList.add("tracks__img--placeholder");
                                img.onerror = null;
                            }
                        }),
                        el("div", {
                            className: "tracks__description"
                        }, [
                            el("span", {
                                className: "tracks__title",
                                textContent: this.title
                            }),
                            el("span", {
                                className: "tracks__artist",
                                textContent: this.artist
                            })
                        ])
                    ])
                ]),
                el("td", {
                    className: "tracks__td tracks__td--album",
                }, [
                    el('span', {
                        textContent: album()
                    })
                ]),
                el("td", {
                    className: "tracks__td tracks__td--date"
                }, [
                    el("span", {
                        textContent: "6 дней назад"
                    }),
                    el("button", {
                        className: [likeClassName()],
                        type: "button",
                        onclick: (event: Event) => {
                            const target = event.target as HTMLElement;
                            const isRemoved = !target.classList.toggle("tracks__like--active");
                            if (isRemoved) {
                                fetchRemoveFavourite(this.id);
                                return;
                            }
                            fetchAddFavourite(this.id);
                        },
                        ariaLabel: "Добавить в избранное"
                    }, [svgHeart])
                ]),
                el("td", {
                    className: "tracks__td tracks__td--time"
                }, [
                    el("span", {
                        textContent: this.duration
                    }),
                    el("button", {
                        className: "tracks__more",
                        type: "button",
                        onclick: () => { },
                        ariaLabel: "Показать больше"
                    }, [svgMore])
                ])
            ]);
    }
}