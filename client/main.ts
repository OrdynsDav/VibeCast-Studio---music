import { renderMainApp } from "./src/api/auth";
import { clearAllModals, TOKEN } from "./src/utils/helpers";
import { RegisterPage } from "./src/view/pages/RegisterPage";
import "./assets/tracks/Captain.mp3"

window.onload = () => {
    clearAllModals()
    const token = TOKEN()
    if (token) {
        renderMainApp()
    } else {
        document.body.classList.add('auth')
        RegisterPage()
    }
}