import { Player } from "../models/PlayerModel";
import { PlayerView } from "../views/PlayerView";
import { Step } from "../models/StepModel";

export class PlayerController {
    private model: Player;
    private view: PlayerView;

    private readonly leftLimitVW = 8;
    private readonly rightLimitVW = 88;

    private currentStep: Step | null = null;
    private wasOnStep: boolean = false;
    private isGameOver: boolean = false;

    constructor(model: Player, view: PlayerView) {
        this.model = model;
        this.view = view;
    }

    initialize(mainElement: HTMLDivElement) {
        this.view.render(this.model, mainElement);
        document.addEventListener("keydown", (e) => this.handleKeydown(e));
        this.setupTouchControls(mainElement);
    }

    private setupTouchControls(mainElement: HTMLDivElement) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        mainElement.addEventListener("touchstart", (e) => {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
            e.preventDefault();
        }, { passive: false });

        mainElement.addEventListener("touchend", (e) => {
            const touch = e.changedTouches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            const touchEndTime = Date.now();
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const deltaTime = touchEndTime - touchStartTime;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // If it's a quick tap (not a swipe)
            if (deltaTime < 300 && distance < 50) {
                // Quick tap = jump
                this.jump();
            } else if (Math.abs(deltaX) > Math.abs(deltaY) && distance > 30) {
                // Horizontal swipe
                if (deltaX > 0) {
                    this.moveRight();
                } else {
                    this.moveLeft();
                }
            }
            e.preventDefault();
        }, { passive: false });
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
        } else {
            // Hit right border - spin animation
            this.view.triggerSpin();
        }
    }

    moveLeft() {
        const newPositionX = this.model.position.x - 5;
        if (newPositionX >= this.leftLimitVW) {
            this.model.position = { x: newPositionX, y: this.model.position.y };
            this.view.updatePosition(this.model);
        } else {
            // Hit left border - spin animation
            this.view.triggerSpin();
        }
    }

    jump() {
        if (!this.model.isPlayerJumping) {
            this.model.isPlayerJumping = true;
            // Smaller jump on mobile
            const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
            this.model.velocity = isMobile ? 10 : 15;
        }
    }

    update(steps: Step[], gameOverCallback: () => void, stepCount: number) {
        // If game is over, don't update physics
        if (this.isGameOver) {
            return;
        }

        let newY = this.model.position.y + this.model.velocity;
        const newVelocity = this.model.velocity - this.model.gravityForce;

        let isLanded = false;

        // Helper function to convert step top position (top in vh) to player coordinate (bottom in px)
        const stepTopToPlayerBottom = (step: Step): number => {
            const stepTopFromTopVh = step.position.y;
            const stepTopFromTopPx = (stepTopFromTopVh / 100) * window.innerHeight;
            // Convert from top-based to bottom-based: step top from top = player bottom position (landing on top)
            return window.innerHeight - stepTopFromTopPx;
        };

        // Check if player is still on current step
        if (this.currentStep) {
            const stepTopY = stepTopToPlayerBottom(this.currentStep);
            const isOnStep = this.model.position.x + 5 >= this.currentStep.position.x &&
                           this.model.position.x <= this.currentStep.position.x + this.currentStep.dimensions.width;
            
            if (isOnStep && newY <= stepTopY && !this.model.isPlayerJumping) {
                // Player is on the step, keep them on top
                newY = stepTopY;
                this.model.velocity = 0;
                this.model.isPlayerJumping = false;
                isLanded = true;
                this.wasOnStep = true;
            } else if (!isOnStep || newY > stepTopY) {
                // Player left the step or jumped above
                // Keep wasOnStep true to track that they fell from a brick
                if (!this.model.isPlayerJumping) {
                    this.wasOnStep = true;
                }
                this.currentStep = null;
            }
        }

        // Check for landing on any step (only when falling)
        if (!isLanded && this.model.velocity <= 0) {
            steps.forEach((step) => {
                const stepTopY = stepTopToPlayerBottom(step);
                const wasAboveStep = this.model.position.y > stepTopY;
                const wouldLandOnStep = newY <= stepTopY;
                
                // Check if player is horizontally aligned with step
                const isHorizontallyAligned = this.model.position.x + 5 >= step.position.x &&
                                            this.model.position.x <= step.position.x + step.dimensions.width;
                
                if (wasAboveStep && wouldLandOnStep && isHorizontallyAligned) {
                    this.model.velocity = 0;
                    newY = stepTopY;
                    this.model.isPlayerJumping = false;
                    this.currentStep = step;
                    isLanded = true;
                    this.wasOnStep = true;
                }
            });
        }

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

        // Check if mobile device
        const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
        
        // On mobile: game over if player falls without landing on bricks (regardless of brick count)
        if (isMobile) {
            // Calculate visible game area (accounting for mobile controls and floor)
            const visibleGameHeight = window.innerHeight - 120; // 120px for controls/floor area
            const floorY = visibleGameHeight;
            
            // Game over if player falls below the visible game area (hits the floor)
            if (newY > floorY) {
                this.triggerGameOver(gameOverCallback);
                return;
            }
            
            if (!isLanded && this.model.velocity < -5 && this.currentStep === null && newY > 100) {
                // Player is falling fast, not on any step, and below the top area
                // Check if there's a step nearby that could catch them
                let hasStepNearby = false;
                const playerTopFromBottom = newY;
                const playerTopFromTop = window.innerHeight - playerTopFromBottom;
                
                steps.forEach((step) => {
                    const stepTopFromTopVh = step.position.y;
                    const stepTopFromTopPx = (stepTopFromTopVh / 100) * window.innerHeight;
                    // Check if step is below player and within reasonable distance
                    if (stepTopFromTopPx > playerTopFromTop && stepTopFromTopPx < playerTopFromTop + 300) {
                        const isHorizontallyAligned = this.model.position.x + 5 >= step.position.x &&
                                                    this.model.position.x <= step.position.x + step.dimensions.width;
                        if (isHorizontallyAligned) {
                            hasStepNearby = true;
                        }
                    }
                });
                
                if (!hasStepNearby) {
                    // Player fell without landing on bricks - game over on mobile
                    this.triggerGameOver(gameOverCallback);
                    return;
                }
            }
        }
        
        // Desktop: Only trigger game over if there are 6 bricks on screen AND player falls from bricks
        if (!isMobile && stepCount >= 6) {
            // Game over if player falls off screen (below the bottom) - only if was on a brick
            if (newY > window.innerHeight && this.wasOnStep) {
                this.triggerGameOver(gameOverCallback);
                return;
            }
            
            // Game over if player falls off bricks (was on a step but fell and no step to catch)
            if (!isLanded && this.model.velocity < -5 && this.currentStep === null && this.wasOnStep && newY > 100) {
                // Player is falling fast, not on any step, was previously on a step, and below the top area
                // Check if there's a step nearby that could catch them
                let hasStepNearby = false;
                const playerTopFromBottom = newY;
                const playerTopFromTop = window.innerHeight - playerTopFromBottom;
                
                steps.forEach((step) => {
                    const stepTopFromTopVh = step.position.y;
                    const stepTopFromTopPx = (stepTopFromTopVh / 100) * window.innerHeight;
                    // Check if step is below player and within reasonable distance
                    if (stepTopFromTopPx > playerTopFromTop && stepTopFromTopPx < playerTopFromTop + 300) {
                        const isHorizontallyAligned = this.model.position.x + 5 >= step.position.x &&
                                                    this.model.position.x <= step.position.x + step.dimensions.width;
                        if (isHorizontallyAligned) {
                            hasStepNearby = true;
                        }
                    }
                });
                
                if (!hasStepNearby) {
                    // Player fell off bricks with no step to catch them
                    this.triggerGameOver(gameOverCallback);
                }
            }
        }
        
        // Reset wasOnStep if player successfully lands
        if (isLanded) {
            this.wasOnStep = true;
        }
    }

    triggerGameOver(gameOverCallback: () => void) {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        // Stop player physics
        this.model.velocity = 0;
        // Trigger fall and spin animation, then show game over screen
        this.view.triggerFallAndSpin(() => {
            gameOverCallback();
        });
    }
}
