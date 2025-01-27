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

  function gameLoop() {
    if (!isPaused) {
        playerController.update(steps);

        steps.forEach((step, index) => {
            step.position = { x: step.position.x, y: step.position.y + 0.5 };

            if (step.position.y > 280) {
                mainElement.removeChild(stepViews[index].element!);
                steps.splice(index, 1);
                stepViews.splice(index, 1);
                stepControllers.splice(index, 1);
            }
        });
    } else {
        stepViews.forEach((stepView) => {
            if (stepView.element) {
                stepView.element.style.animationPlayState = "paused";
            }
        });
    }

    requestAnimationFrame(gameLoop);
}


pauseButton.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? "▷" : "❚❚"; 

  if (isPaused) {

      stepViews.forEach((stepView) => {
          if (stepView.element) {
              stepView.element.style.animationPlayState = "paused";
          }
      });
  } else {
      stepViews.forEach((stepView) => {
          if (stepView.element) {
              stepView.element.style.animationPlayState = "running";
          }
      });
  }
});
  restartButton.addEventListener("click", () => {
      location.reload();
  });

  setInterval(createStep, 2000);
  gameLoop();
});