import { renderMainApp } from "./src/api/auth";
import { TOKEN } from "./src/utils/helpers";
import { RegisterPage } from "./src/view/pages/RegisterPage";
import "./assets/tracks/Captain.mp3"
import { PlayTrack } from "./src/components/PlayTrack";

window.onload = () => {
    const token = TOKEN()
    if (token) {
        renderMainApp()
    } else {
        RegisterPage()
    }
}

/* PlayTrack({
    title: 'Captain',
    artist: 'Captain',
    duration: 100,
    file: 'assets/tracks/Captain.mp3'
}) */
console.log(window.innerWidth);