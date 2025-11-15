import { mount } from "redom";
import { HEADER_CONTAINER, MAIN_CONTAINER } from "../../utils/constants";
import { NavigationMenu } from "../../components/NavigationMenu";
import { HeadPanel } from "../../components/HeadPanel";

export const MainFrame = () => {
    if (!MAIN_CONTAINER || !HEADER_CONTAINER) {
        throw new Error("Контейнер не найден");
    }

    if (document.querySelector('.nav__menu') || document.querySelector('.head-panel')) {
        return
    }

    mount(HEADER_CONTAINER, NavigationMenu())
    mount(MAIN_CONTAINER, HeadPanel());
}