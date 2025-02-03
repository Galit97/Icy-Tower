import { Player } from "../models/PlayerModel";

export class PlayerView {
    public element: HTMLImageElement | null;

    constructor() {
        this.element = null;
    }

    render(player: Player, mainElement: HTMLDivElement) {
        const playerElement = document.createElement("img");
        playerElement.src = player.image;
        playerElement.style.position = "absolute";
        playerElement.style.bottom = `${player.position.y}px`;
        playerElement.style.left = `${player.position.x}vw`;
        playerElement.style.width = "5vw";
        playerElement.classList.add("player");
        mainElement.appendChild(playerElement);
        this.element = playerElement;

        playerElement.addEventListener("dblclick", () => {
            const newImage = player.image.includes("character1.png")
                ? "/images/character2.png"
                : "/images/character1.png";
            player.image = newImage;
            this.updateImage(player);
        });
    }

    updatePosition(player: Player) {
        if (this.element) {
            this.element.style.left = `${player.position.x}vw`; 
            this.element.style.bottom = `${player.position.y}px`;
        }
    }

    updateImage(player: Player) {
        if (this.element) {
            this.element.src = player.image;
        }
    }
}


