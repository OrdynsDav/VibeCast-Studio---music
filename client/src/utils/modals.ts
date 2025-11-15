import { el } from "redom"
import { createUserCheckIcon, createCloseIcon } from "../components/SvgElements"

export const modalAfterRegister = (): HTMLElement => {
    const checkIcon = createUserCheckIcon()
    const closeIcon = createCloseIcon()

    document.body.classList.add('modal-after-register-body')

    document.addEventListener('click', (e) => {
        const modalElement = document.querySelector('.modal-after-register') as HTMLElement;

        if (modalElement && !modalElement.contains(e.target as Node)) {
            modalElement.remove();
            document.body.classList.remove('modal-after-register-body')
        }
    });
    return (
        el('div', {
            className: 'modal-after-register'
        }, [
            checkIcon,
            el('div', {
                className: 'modal-after-register__description'
            }, [
                el('h3', {
                    className: 'modal-after-register__title',
                    textContent: 'Вы успешно зарегистрировались!'
                }),
                el('p', {
                    className: 'modal-after-register__text',
                    textContent: 'Теперь вы можете войти в свой аккаунт'
                })
            ]),
            el('button', {
                className: 'modal-after-register__close',
                type: 'button',
                onclick: () => {
                    const modalElement = document.querySelector('.modal-after-register') as HTMLElement;
                    modalElement.remove();
                    document.body.classList.remove('modal-after-register-body')
                }
            }, [
                closeIcon
            ])
        ])
    )
}