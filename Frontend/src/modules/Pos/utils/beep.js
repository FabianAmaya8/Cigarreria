import scanSound from "../../../assets/scaner.mp3";
import errorSound from "../../../assets/error.mp3";

class BeepPlayer {
    enabled = true;

    sounds = {
        scan: new Audio(scanSound),
        error: new Audio(errorSound),
    };

    play(type = "scan") {
        if (!this.enabled) return;
        const sound = this.sounds[type];
        if (!sound) return;

        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

export const beep = new BeepPlayer();
