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
        // Only allow the game-over logic to run if there are at least 5 steps
        if (steps.length < 5) return;

        isPaused = true;

        // Freeze all steps by stopping their movement
        steps.forEach((step) => {
            step.position = { x: step.position.x, y: step.position.y }; // Stop movement
        });

        const gameOverScreen = document.createElement("div");
        gameOverScreen.id = "game-over";
        gameOverScreen.style.position = "absolute";
        gameOverScreen.style.top = "50%";
        gameOverScreen.style.left = "50%";
        gameOverScreen.style.transform = "translate(-50%, -50%)";
        gameOverScreen.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        gameOverScreen.style.color = "white";
        gameOverScreen.style.padding = "20px";
        gameOverScreen.style.textAlign = "center";
        gameOverScreen.style.borderRadius = "10px";

        gameOverScreen.innerHTML = `
            <h1>Game Over</h1>
            <button id="play-again">Play Again</button>
        `;

        document.body.appendChild(gameOverScreen);

        const playAgainButton = document.getElementById("play-again") as HTMLButtonElement;
        playAgainButton.addEventListener("click", () => {
            location.reload();
        });
    }

    function gameLoop() {
        if (!isPaused) {
            playerController.update(steps, gameOver);

            steps.forEach((step, index) => {
                step.position = { x: step.position.x, y: step.position.y + 0.5 };

                if (step.position.y > 520) {
                    mainElement.removeChild(stepViews[index].element!);
                    steps.splice(index, 1);
                    stepViews.splice(index, 1);
                    stepControllers.splice(index, 1);
                }
            });
        }

        requestAnimationFrame(gameLoop);
    }

    pauseButton.addEventListener("click", () => {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? "▷" : "❚❚";
    });

    restartButton.addEventListener("click", () => {
        location.reload();
    });

    setInterval(createStep, 2000);
    gameLoop();
});
