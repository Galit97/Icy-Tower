import "./style.css";
import { Player } from "./models/PlayerModel";
import { PlayerView } from "./views/PlayerView";
import { PlayerController } from "./controllers/PlayerController";
import { Step } from "./models/StepModel";
import { StepView } from "./views/StepView";
import { StepController } from "./controllers/StepController";

// Error handling wrapper
try {
    document.addEventListener("DOMContentLoaded", () => {
        try {
            const mainElement = document.querySelector("#game-container") as HTMLDivElement;
            const pauseButton = document.getElementById("pause") as HTMLButtonElement;
            const restartButton = document.getElementById("restart") as HTMLButtonElement;

            if (!mainElement) {
                console.error("Error: #game-container element not found.");
                document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Game container not found</div>';
                return;
            }

            if (!pauseButton || !restartButton) {
                console.error("Error: Control buttons not found.");
            }

    const getImagePath = (filename: string) => {
        const base = import.meta.env.BASE_URL || '/';
        return `${base}images/${filename}`.replace('//', '/');
    };
    const player = new Player(10, 0, getImagePath("character3.png"));
    const playerView = new PlayerView();
    const playerController = new PlayerController(player, playerView);

    playerController.initialize(mainElement);

    // Add border indicators for mobile
    const leftBorder = document.createElement("div");
    leftBorder.classList.add("border-indicator", "left");
    mainElement.appendChild(leftBorder);

    const rightBorder = document.createElement("div");
    rightBorder.classList.add("border-indicator", "right");
    mainElement.appendChild(rightBorder);

    // Setup mobile control buttons
    const mobileLeft = document.getElementById("mobile-left") as HTMLButtonElement;
    const mobileRight = document.getElementById("mobile-right") as HTMLButtonElement;
    const mobileJump = document.getElementById("mobile-jump") as HTMLButtonElement;

    if (mobileLeft && mobileRight && mobileJump) {
        mobileLeft.addEventListener("touchstart", (e) => {
            e.preventDefault();
            playerController.moveLeft();
        });
        mobileLeft.addEventListener("touchend", (e) => {
            e.preventDefault();
        });

        mobileRight.addEventListener("touchstart", (e) => {
            e.preventDefault();
            playerController.moveRight();
        });
        mobileRight.addEventListener("touchend", (e) => {
            e.preventDefault();
        });

        mobileJump.addEventListener("touchstart", (e) => {
            e.preventDefault();
            playerController.jump();
        });
        mobileJump.addEventListener("touchend", (e) => {
            e.preventDefault();
        });
    }

    const steps: Step[] = [];
    const stepViews: StepView[] = [];
    const stepControllers: StepController[] = [];

    let isPaused = false;
    let isGameOver = false;
    let stepInterval: number | null = null;

    function createStep() {
        if (isPaused) return;

        const stepModel = new Step();
        const stepView = new StepView();
        const stepController = new StepController(stepModel, stepView);

        stepController.initialize(mainElement);
        steps.push(stepModel);
        stepViews.push(stepView);
        stepControllers.push(stepController);
        
        // Add class for smaller bricks on mobile when more than 6
        const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
        if (isMobile && steps.length > 6 && stepView.element) {
            stepView.element.classList.add("many-bricks");
        }
    }

    function gameOver() {
        isPaused = true;
        isGameOver = true;
        if (stepInterval) clearInterval(stepInterval);

        const overlay = document.createElement("div");
        overlay.id = "overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        overlay.style.zIndex = "999";

        document.body.appendChild(overlay);

        const gameOverScreen = document.createElement("div");
        gameOverScreen.id = "game-over";
        gameOverScreen.style.position = "fixed";
        gameOverScreen.style.top = "50%";
        gameOverScreen.style.left = "50%";
        gameOverScreen.style.transform = "translate(-50%, -50%)";
        gameOverScreen.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        gameOverScreen.style.color = "white";
        gameOverScreen.style.padding = "20px";
        gameOverScreen.style.textAlign = "center";
        gameOverScreen.style.borderRadius = "10px";
        gameOverScreen.style.zIndex = "1000";

        gameOverScreen.innerHTML = `
            <h1>Game Over</h1>
            <button id="play-again">Play Again</button>
        `;

        document.body.appendChild(gameOverScreen);

        const playAgainButton = document.getElementById("play-again") as HTMLButtonElement;
        playAgainButton.addEventListener("click", () => {
            document.body.removeChild(overlay);
            document.body.removeChild(gameOverScreen);
            location.reload();
        });
    }

    function gameLoop() {
        if (!isPaused && !isGameOver) {
            playerController.update(steps, () => {
                gameOver();
            }, steps.length);

            for (let index = steps.length - 1; index >= 0; index--) {
                const step = steps[index];
                // Smaller gap between bricks on mobile
                const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
                const moveSpeed = isMobile ? 0.100 : 0.120;
                step.position = { x: step.position.x, y: step.position.y + moveSpeed };
                stepViews[index].updatePosition(step);
                
                // Update class for bricks when count changes
                const stepElement = stepViews[index].element;
                if (isMobile && stepElement) {
                    if (steps.length > 6) {
                        stepElement.classList.add("many-bricks");
                    } else {
                        stepElement.classList.remove("many-bricks");
                    }
                }

                // Keep player synchronized with step as it moves down
                if (playerController['currentStep'] === step) {
                    // Convert step top position (top in vh) to player position (bottom in px)
                    const stepTopFromTopVh = step.position.y;
                    const stepTopFromTopPx = (stepTopFromTopVh / 100) * window.innerHeight;
                    const playerBottomY = window.innerHeight - stepTopFromTopPx;
                    player.position = { x: player.position.x, y: playerBottomY };
                    playerView.updatePosition(player);
                }

                if (step.position.y > 520) {
                    mainElement.removeChild(stepViews[index].element!);
                    steps.splice(index, 1);
                    stepViews.splice(index, 1);
                    stepControllers.splice(index, 1);
                }
            }
        }

        requestAnimationFrame(gameLoop);
    }

    pauseButton.addEventListener("click", () => {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? "▷" : "❚❚";

        if (isPaused) {
            if (stepInterval) clearInterval(stepInterval);
        } else {
            const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
            const interval = isMobile ? 1700 : 2000; // Smaller gap on mobile
            stepInterval = setInterval(createStep, interval);
        }
    });

    restartButton.addEventListener("click", () => {
        location.reload();
    });

            const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
            const initialInterval = isMobile ? 1700 : 2000; // Smaller gap on mobile
            stepInterval = setInterval(createStep, initialInterval);
            gameLoop();
        } catch (error) {
            console.error("Error initializing game:", error);
            document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: Arial;">Error loading game: ${error}</div>`;
        }
    });
} catch (error) {
    console.error("Fatal error:", error);
    document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: Arial;">Fatal error: ${error}</div>`;
}
