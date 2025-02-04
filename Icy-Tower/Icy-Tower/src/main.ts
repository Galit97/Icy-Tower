import "./style.css";
import { Player } from "./models/PlayerModel";
import { PlayerView } from "./views/PlayerView";
import { PlayerController } from "./controllers/PlayerController";
import { Step } from "./models/StepModel";
import { StepView } from "./views/StepView";
import { StepController } from "./controllers/StepController";

document.addEventListener("DOMContentLoaded", () => {
    const mainElement = document.querySelector("#game-container") as HTMLDivElement;
    const pauseButton = document.getElementById("pause") as HTMLButtonElement;
    const restartButton = document.getElementById("restart") as HTMLButtonElement;

    if (!mainElement) {
        console.error("Error: #game-container element not found.");
        return;
    }

    const player = new Player(10, 0, "/images/character1.png");
    const playerView = new PlayerView();
    const playerController = new PlayerController(player, playerView);

    playerController.initialize(mainElement);

    const steps: Step[] = [];
    const stepViews: StepView[] = [];
    const stepControllers: StepController[] = [];

    let isPaused = false;
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
    }

    function gameOver() {
        isPaused = true;
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
        if (!isPaused) {
            playerController.update(steps, () => {
                if (steps.length >= 5) {
                    gameOver();
                }
            });

            for (let index = steps.length - 1; index >= 0; index--) {
                const step = steps[index];
                step.position = { x: step.position.x, y: step.position.y + 0.120 };
                stepViews[index].updatePosition(step);

                if (playerController['currentStep'] === step) {
                    player.position = { x: player.position.x, y: step.position.y + step.dimensions.height };
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
            stepInterval = setInterval(createStep, 2000);
        }
    });

    restartButton.addEventListener("click", () => {
        location.reload();
    });

    stepInterval = setInterval(createStep, 2000);
    gameLoop();
});
