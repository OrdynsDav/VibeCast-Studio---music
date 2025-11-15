import { el } from "redom"
import { createMusicNoteIcon } from "./SvgElements"
import { TracksPage } from "../view/pages/TracksPage"
import { MAIN_CONTAINER } from "../utils/constants"

export const NavigationMenu = (): HTMLElement => {
    const musicNoteIcon1 = createMusicNoteIcon()
    const musicNoteIcon2 = createMusicNoteIcon()

    function changeClassName(event: Event) {
        const target = event.target as HTMLElement;

        if (target && target.className === 'nav__link') {
            const btn = target;
            const isActive = btn.classList.contains('nav__link--active');

            document.querySelectorAll('.nav__link').forEach((link) => {
                (link as HTMLElement).classList.remove('nav__link--active');
            });

            if (!isActive) {
                btn.classList.add('nav__link--active');
            }
        }
    }

    return (
        el('nav', {
            class: 'nav__menu'
        }, [
            el('button', {
                className: ['nav__link'],
                type: 'button',
                onclick: (event: Event) => {
                    if (!MAIN_CONTAINER) {
                        throw new Error("Контейнер не найден");
                    }
                    if (!MAIN_CONTAINER.querySelector('.head-panel')) {
                        throw new Error('Панель не найдена')
                    }
                    MAIN_CONTAINER.querySelector('.head-panel')?.nextElementSibling?.remove()
                    TracksPage({ isFavourites: true })
                    changeClassName(event)
                },
            }, [
                musicNoteIcon1,
                el('span', {
                    class: 'nav__link-text',
                    textContent: 'Избранное'
                })
            ]),
            el('button', {
                className: ['nav__link nav__link--active'],
                type: 'button',
                onclick: (event: Event) => {
                    if (!MAIN_CONTAINER) {
                        throw new Error("Контейнер не найден");
                    }
                    if (!MAIN_CONTAINER.querySelector('.head-panel')) {
                        throw new Error('Панель не найдена')
                    }
                    MAIN_CONTAINER.querySelector('.head-panel')?.nextElementSibling?.remove()
                    TracksPage({ isFavourites: false })
                    changeClassName(event)
                }
            }, [
                musicNoteIcon2,
                el('span', {
                    class: 'nav__link-text',
                    textContent: 'Аудиокомпозиции'
                })
            ])
        ])
    )
}