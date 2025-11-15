import { el, mount } from "redom";
import { TracksTable } from "../../components/Tracks/Desktop/TracksTable";
import { AddTracksToContainer } from "../../components/Tracks/AddTracksToContainer";
import { HEADER_CONTAINER, MAIN_CONTAINER, VIEWPORT_WIDTH } from "../../utils/constants";
import { TracksPageProps } from "../../utils/interfaces";
import { TracksList } from "../../components/Tracks/TabletAndMobile/TracksList";

export const TracksPage = ({ isFavourites }: TracksPageProps) => {
    const tracksTable = TracksTable();
    const tracksList = TracksList()

    const section = el("section", {
        className: [isFavourites ? 'tracks is-favourites' : 'tracks'],
        ariaLabelledby: "tracks-title",
    }, [
        el("h2", {
            class: 'tracks__heading',
            id: 'tracks-title',
            textContent: isFavourites ? 'Избранные треки' : 'Аудифайлы и треки',
        })
    ])

    if (!MAIN_CONTAINER || !HEADER_CONTAINER) {
        throw new Error("Контейнер не найден");
    }
    mount(MAIN_CONTAINER, section)
    if (VIEWPORT_WIDTH > 1100) {
        mount(section, tracksTable);
    } else {
        mount(section, tracksList)
    }

    AddTracksToContainer({ isFavourites });
};
