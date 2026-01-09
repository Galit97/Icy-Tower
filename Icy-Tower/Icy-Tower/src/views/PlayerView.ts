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
        
        // Prevent mobile from treating image as a link
        playerElement.draggable = false;
        playerElement.setAttribute("draggable", "false");
        playerElement.style.userSelect = "none";
        playerElement.style.webkitUserSelect = "none";
        (playerElement.style as any).webkitTouchCallout = "none";
        playerElement.style.pointerEvents = "auto";
        
        mainElement.appendChild(playerElement);
        this.element = playerElement;

        // Double click/tap for both desktop and mobile
        let lastTap = 0;
        
        playerElement.addEventListener("dblclick", (e) => {
            e.preventDefault();
            this.switchCharacter(player);
        });

        // Double tap for mobile
        playerElement.addEventListener("touchstart", (e) => {
            e.preventDefault();
        });
        
        playerElement.addEventListener("touchend", (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent triggering screen double-tap
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                // Double tap detected on character - switch character
                this.switchCharacter(player);
            }
            lastTap = currentTime;
        });
        
        // Prevent context menu on long press
        playerElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            return false;
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
            // Check if mobile device
            const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
            // Character floor at 70px from bottom on mobile (20px higher)
            const floorBottom = isMobile ? '70px' : '0px';
            
            // Start continuous spinning (3 full rotations = 1080 degrees)
            this.element.style.animation = 'spinFall 2s ease-in forwards';
            // Animate falling to the bottom (floor position)
            this.element.style.transition = 'bottom 2s ease-in';
            // Force reflow to ensure transition works
            void this.element.offsetHeight;
            // Fall to the floor
            this.element.style.bottom = floorBottom;
            
            // Call callback after animation completes
            setTimeout(() => {
                callback();
            }, 2000);
        }
    }

    switchCharacter(player: Player) {
        const getImagePath = (filename: string) => {
            // Use base URL for proper path resolution in deployment
            const base = import.meta.env.BASE_URL || '/';
            return `${base}images/${filename}`.replace('//', '/');
        };
        
        let newImage: string;
        if (player.image.includes("character3.png")) {
            newImage = getImagePath("character4.png");
        } else if (player.image.includes("character4.png")) {
            newImage = getImagePath("character5.png");
        } else if (player.image.includes("character5.png")) {
            newImage = getImagePath("character6.png");
        } else if (player.image.includes("character6.png")) {
            newImage = getImagePath("character7.png");
        } else if (player.image.includes("character7.png")) {
            newImage = getImagePath("character8.png");
        } else if (player.image.includes("character8.png")) {
            newImage = getImagePath("character3.png");
        } else {
            // Default to character3 (for character1, character2, or any other)
            newImage = getImagePath("character3.png");
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


