import { renderMainApp } from "./src/api/auth";
import { TOKEN } from "./src/utils/helpers";
import { RegisterPage } from "./src/view/pages/RegisterPage";
import "./assets/tracks/Captain.mp3"

window.onload = () => {
    const token = TOKEN()
    if (token) {
        renderMainApp()
    } else {
        document.body.classList.add('auth')
        RegisterPage()
    }
}