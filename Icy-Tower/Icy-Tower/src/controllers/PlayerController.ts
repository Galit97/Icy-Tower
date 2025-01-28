import { Player } from "../models/PlayerModel";
import { PlayerView } from "../views/PlayerView";
import { Step } from "../models/StepModel";

export class PlayerController {
    private model: Player;
    private view: PlayerView;

    private readonly leftLimitVW = 8; 
    private readonly rightLimitVW = 88; 

    private currentStep: Step | null = null; // Track the step the player is currently on

    constructor(model: Player, view: PlayerView) {
        this.model = model;
        this.view = view;
    }

    initialize(mainElement: HTMLDivElement) {
        this.view.render(this.model, mainElement);

        document.addEventListener("keydown", (e) => this.handleKeydown(e));
    }

    handleKeydown(event: KeyboardEvent) {
        switch (event.key) {
            case "ArrowRight":
                this.moveRight();
                break;
            case "ArrowLeft":
                this.moveLeft();
                break;
            case " ":
                this.jump();
                break;
        }
    }

    moveRight() {
        const newPositionX = this.model.position.x + 5;

        if (newPositionX <= this.rightLimitVW) {
            this.model.position = { x: newPositionX, y: this.model.position.y };
            this.view.updatePosition(this.model);
        }
    }

    moveLeft() {
        const newPositionX = this.model.position.x - 5;

        if (newPositionX >= this.leftLimitVW) {
            this.model.position = { x: newPositionX, y: this.model.position.y };
            this.view.updatePosition(this.model);
        }
    }

    jump() {
        // Allow jumping again after landing
        if (!this.model.isPlayerJumping) {
            this.model.isPlayerJumping = true;
            this.model.velocity = 15; // Upward velocity for the jump
            this.currentStep = null; // Detach from the step
        }
    }

    update(steps: Step[], gameOverCallback: () => void) {
        if (this.currentStep) {
            // Keep the player on the current step as it moves
            this.model.position = {
                x: this.model.position.x,
                y: this.currentStep.position.y + this.currentStep.dimensions.height,
            };

            this.view.updatePosition(this.model);

            // Detach from the step if it moves out of bounds
            if (this.currentStep.position.y > 520) {
                this.currentStep = null;
                this.model.isPlayerJumping = true; // Start falling
            }

            return;
        }

        if (this.model.isPlayerJumping) {
            const newY = this.model.position.y + this.model.velocity;
            const newVelocity = this.model.velocity - this.model.gravityForce;

            let isLanded = false;

            steps.forEach((step) => {
                if (
                    newY <= step.position.y + step.dimensions.height &&
                    newY >= step.position.y &&
                    this.model.position.x + 5 >= step.position.x &&
                    this.model.position.x <= step.position.x + step.dimensions.width
                ) {
                    this.model.velocity = 0; // Stop falling
                    this.model.position = { x: this.model.position.x, y: step.position.y + step.dimensions.height };
                    this.model.isPlayerJumping = false; // Reset jump state
                    this.currentStep = step; // Attach to the step
                    isLanded = true;
                }
            });

            if (!isLanded) {
                // If the player falls off
                if (newY < -10) {
                    gameOverCallback();
                } else {
                    this.model.position = { x: this.model.position.x, y: newY };
                    this.model.velocity = newVelocity;
                }
            }

            this.view.updatePosition(this.model);
        }
    }
}
