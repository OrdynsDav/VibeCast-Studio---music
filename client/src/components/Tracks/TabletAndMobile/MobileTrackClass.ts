import { el } from "redom";
import { createHeartIcon, createMoreIcon } from "../../SvgElements";
import { fetchAddFavourite, fetchRemoveFavourite } from "../../../api/fetches";
import { getBase64, playMusic } from "../../../utils/helpers";


export default class MobileTrack {
    constructor(
        public id: number,
        public title: string,
        public artist: string,
        public duration: number,
        public album: string
    ) { }

    getTrack(): HTMLElement {
        const svgHeart = createHeartIcon();
        const svgMore = createMoreIcon();

        const likeClassName = (): string => {
            const section = document.querySelector('.tracks') as HTMLElement;
            if (section.classList.contains('is-favourites')) {
                return "tracks__like tracks__like--active";
            } else {
                return "tracks__like";
            }
        };
        return el('li', {
            className: 'tracks__item'
        }, [
            el('button', {
                className: 'tracks__btn',
                type: "button",
                onclick: () => playMusic(this.title)
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
                el('div', {
                    className: 'tracks__description'
                }, [
                    el('span', {
                        className: 'tracks__title',
                        textContent: this.title
                    }),
                    el('span', {
                        className: 'tracks__artist',
                        textContent: this.artist
                    })
                ])
            ]),
            el('div', {
                className: 'tracks__actions'
            }, [
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
                        fetchAddFavourite(this.id)
                    },
                    ariaLabel: "Добавить в избранное"
                }, [svgHeart]),
                el("button", {
                    className: ["tracks__more"],
                    type: "button",
                    onclick: () => { },
                    ariaLabel: "Показать больше"
                }, [svgMore])
            ])
        ])
    }
}