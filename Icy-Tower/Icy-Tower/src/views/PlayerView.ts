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

        // Double click/tap for both desktop and mobile
        let lastTap = 0;
        
        playerElement.addEventListener("dblclick", () => {
            this.switchCharacter(player);
        });

        // Double tap for mobile
        playerElement.addEventListener("touchend", (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                // Double tap detected
                e.preventDefault();
                this.switchCharacter(player);
            }
            lastTap = currentTime;
        });
    }

    updatePosition(player: Player) {
        if (this.element) {
            this.element.style.left = `${player.position.x}vw`; 
            this.element.style.bottom = `${player.position.y}px`;
        }
    }

    triggerSpin() {
        if (this.element) {
            // Add spin animation class
            this.element.style.animation = 'none';
            // Trigger reflow to restart animation
            void this.element.offsetWidth;
            this.element.style.animation = 'spin 0.5s ease-in-out';
        }
    }

    triggerFallAndSpin(callback: () => void) {
        if (this.element) {
            // Start continuous spinning (3 full rotations = 1080 degrees)
            this.element.style.animation = 'spinFall 2s ease-in forwards';
            // Animate falling to the bottom (0px from bottom = floor)
            this.element.style.transition = 'bottom 2s ease-in';
            // Force reflow to ensure transition works
            void this.element.offsetHeight;
            // Fall to the floor (bottom: 0px)
            this.element.style.bottom = '0px';
            
            // Call callback after animation completes
            setTimeout(() => {
                callback();
            }, 2000);
        }
    }

    switchCharacter(player: Player) {
        let newImage: string;
        if (player.image.includes("character3.png")) {
            newImage = "/images/character4.png";
        } else if (player.image.includes("character4.png")) {
            newImage = "/images/character5.png";
        } else if (player.image.includes("character5.png")) {
            newImage = "/images/character6.png";
        } else if (player.image.includes("character6.png")) {
            newImage = "/images/character7.png";
        } else if (player.image.includes("character7.png")) {
            newImage = "/images/character8.png";
        } else if (player.image.includes("character8.png")) {
            newImage = "/images/character3.png";
        } else {
            // Default to character3 (for character1, character2, or any other)
            newImage = "/images/character3.png";
        }
        player.image = newImage;
        this.updateImage(player);
    }

    updateImage(player: Player) {
        if (this.element) {
            this.element.src = player.image;
        }
    }
}


