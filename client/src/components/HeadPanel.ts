import { el } from "redom";
import { createRightArrowIcon, createSearchIcon } from "./SvgElements";
import { getStorageItem } from "../utils/helpers";
import { handleInputNormal, handleInputFavourites } from "./Tracks/AddTracksToContainer";

// Добавьте проп для выбора типа (или определите по контексту)
export const HeadPanel = (isFavourites: boolean = false): HTMLElement => {
    const searchIcon = createSearchIcon();
    const rightArrowIcon = createRightArrowIcon();
    const userName = getStorageItem('username') || 'Guest';

    return el('section', {
        className: 'head-panel'
    }, [
        el('h2', {
            class: 'visually-hidden',
            textContent: 'Верхняя панель с строкой поиска и кнопкой профиля пользователя'
        }),
        el('form', {
            className: 'head-panel__search'
        }, [
            el('label', {
                className: 'head-panel__search-label',
                htmlFor: 'search-input'
            }, [
                searchIcon,
                el('input', {
                    className: 'head-panel__search-input',
                    type: 'text',
                    placeholder: 'Что будем искать?',
                    id: 'search-input',
                    oninput: isFavourites ? handleInputFavourites : handleInputNormal  // <<< Выбираем обработчик
                })
            ])
        ]),
        el('button', {
            className: 'head-panel__user',
            type: 'button'
        }, [
            el('div', {
                className: 'head-panel__user-info'
            }, [
                el('div', {
                    className: 'head-panel__user-avatar'
                }, [
                    el('span', {
                        className: 'head-panel__user-char',
                        textContent: userName[0].toUpperCase()
                    })
                ]),
                el('p', {
                    className: 'head-panel__user-name',
                    textContent: userName
                })
            ]),
            rightArrowIcon
        ])
    ]);
};