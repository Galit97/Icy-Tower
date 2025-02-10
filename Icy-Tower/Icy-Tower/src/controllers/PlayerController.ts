import { Player } from "../models/PlayerModel";
import { PlayerView } from "../views/PlayerView";
import { Step } from "../models/StepModel";

export class PlayerController {
    private model: Player;
    private view: PlayerView;

    private readonly leftLimitVW = 8;
    private readonly rightLimitVW = 88;

    private currentStep: Step | null = null;

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
        if (!this.model.isPlayerJumping) {
            this.model.isPlayerJumping = true;
            this.model.velocity = 15;
        }
    }

    update(steps: Step[], gameOverCallback: () => void) {
        let newY = this.model.position.y + this.model.velocity;
        const newVelocity = this.model.velocity - this.model.gravityForce;

        let isLanded = false;

        steps.forEach((step) => {
            if (
                newY >= step.position.y &&
                newY <= step.position.y + step.dimensions.height &&
                this.model.position.x + 5 >= step.position.x &&
                this.model.position.x <= step.position.x + step.dimensions.width &&
                this.model.velocity <= 0
            ) {
                this.model.velocity = 0;
                newY = step.position.y + step.dimensions.height;
                this.model.isPlayerJumping = false;
                this.currentStep = step;
                isLanded = true;
            }
        });

        if (!isLanded) {
            if (newY <= 0) {
                newY = 0;
                this.model.velocity = 0;
                this.model.isPlayerJumping = false;
            } else {
                this.model.velocity = newVelocity;
            }
        }

        this.model.position = { x: this.model.position.x, y: newY };
        this.view.updatePosition(this.model);

        if (this.currentStep) {
            const stepBottomY = this.currentStep.position.y + this.currentStep.dimensions.height;
            if (newY < stepBottomY && !this.model.isPlayerJumping) {
                this.model.position = { x: this.model.position.x, y: stepBottomY };
                this.model.velocity = 0;
                this.model.isPlayerJumping = false;
            }
        }

        if (newY < -10 || newY > window.innerHeight) {
            gameOverCallback();
        }
    }
}
