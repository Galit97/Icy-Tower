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
        let path = `${base}images/${filename}`.replace('//', '/');
        // Ensure absolute path for mobile
        if (!path.startsWith('/') && !path.startsWith('http')) {
            path = '/' + path;
        }
        return path;
    };
    // Set initial player position - 200px above controllers on mobile, 0 on desktop
    const isMobileDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const initialY = isMobileDevice ? 260 : 0; // 200px above controllers (at bottom: 20px) = 220px from bottom
    const player = new Player(10, initialY, getImagePath("character3.png"));
    const playerView = new PlayerView();
    const playerController = new PlayerController(player, playerView);

    playerController.initialize(mainElement);
    
    // Set up callback to track when player lands on steps
    playerController.setOnStepLandedCallback((step: Step) => {
        if (!landedSteps.has(step)) {
            landedSteps.add(step);
            // Update step counter
            const stepCount = document.getElementById("step-count");
            if (stepCount) {
                stepCount.textContent = landedSteps.size.toString();
            }
        }
    });

    // Add touch handler for developer icon on mobile
    const developerIcon = document.getElementById("developer-icon");
    if (developerIcon) {
        let touchTimeout: number | null = null;
        let touchStartTime = 0;
        let touchStartY = 0;
        
        // Use a more direct approach - toggle on tap
        developerIcon.addEventListener("touchstart", (e) => {
            e.stopPropagation();
            const touch = e.touches[0];
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        }, { passive: true });
        
        developerIcon.addEventListener("touchend", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const touch = e.changedTouches[0];
            const touchEndY = touch.clientY;
            const touchDuration = Date.now() - touchStartTime;
            const touchDistance = Math.abs(touchEndY - touchStartY);
            
            // Only trigger on quick tap (not long press or swipe)
            if (touchDuration < 300 && touchDistance < 10) {
                // Toggle the tooltip
                const isVisible = developerIcon.classList.contains("touched");
                if (isVisible) {
                    developerIcon.classList.remove("touched");
                    if (touchTimeout) clearTimeout(touchTimeout);
                } else {
                    developerIcon.classList.add("touched");
                    if (touchTimeout) clearTimeout(touchTimeout);
                    touchTimeout = window.setTimeout(() => {
                        developerIcon.classList.remove("touched");
                    }, 5000); // Show for 5 seconds
                }
            }
        }, { passive: false });
        
        // Also handle click for better compatibility
        developerIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const isVisible = developerIcon.classList.contains("touched");
            if (isVisible) {
                developerIcon.classList.remove("touched");
                if (touchTimeout) clearTimeout(touchTimeout);
            } else {
                developerIcon.classList.add("touched");
                if (touchTimeout) clearTimeout(touchTimeout);
                touchTimeout = window.setTimeout(() => {
                    developerIcon.classList.remove("touched");
                }, 5000);
            }
        });
    }

    // Add border indicators for mobile
    const leftBorder = document.createElement("div");
    leftBorder.classList.add("border-indicator", "left");
    mainElement.appendChild(leftBorder);

    const rightBorder = document.createElement("div");
    rightBorder.classList.add("border-indicator", "right");
    mainElement.appendChild(rightBorder);

    // Setup mobile touch controls: left/right sides for movement, double-tap for jump
    const isMobileTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    if (isMobileTouch) {
        let lastTap = 0;
        let isMoving = false;
        
        // Initialize audio context on first touch (required for mobile)
        let audioInitialized = false;
        const initAudio = async () => {
            if (!audioInitialized) {
                audioInitialized = true;
                try {
                    const { soundManager } = await import('./utils/SoundManager');
                    // Trigger audio context initialization
                    await soundManager.playJumpSound();
                } catch (e) {
                    // Ignore - will be handled on next play
                }
            }
        };
        
        // Left/right movement based on touch position
        mainElement.addEventListener("touchstart", (e) => {
            // Don't interfere with developer icon touches
            const target = e.target as HTMLElement;
            if (target && (target.id === "developer-icon" || target.closest("#developer-icon"))) {
                return; // Let the icon handle its own touch
            }
            
            e.preventDefault();
            initAudio(); // Initialize audio on first touch
            if (e.touches.length === 1) {
                const screenWidth = window.innerWidth;
                const touchX = e.touches[0].clientX;
                
                // Left half of screen = move left, right half = move right
                if (touchX < screenWidth / 2) {
                    playerController.moveLeft();
                    isMoving = true;
                } else {
                    playerController.moveRight();
                    isMoving = true;
                }
            }
        });
        
        mainElement.addEventListener("touchmove", (e) => {
            e.preventDefault();
            // Continue movement while dragging
            if (e.touches.length === 1 && isMoving) {
                const screenWidth = window.innerWidth;
                const touchX = e.touches[0].clientX;
                
                if (touchX < screenWidth / 2) {
                    playerController.moveLeft();
                } else {
                    playerController.moveRight();
                }
            }
        });
        
        mainElement.addEventListener("touchend", (e) => {
            e.preventDefault();
            isMoving = false;
            
            // Double-tap detection for jump
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                // Double tap detected - jump
                playerController.jump();
            }
            lastTap = currentTime;
        });
    }

    const steps: Step[] = [];
    const stepViews: StepView[] = [];
    const stepControllers: StepController[] = [];
    const landedSteps = new Set<Step>(); // Track which steps have been landed on

    let isPaused = false;
    let isGameOver = false;
    let stepInterval: number | null = null;
    let currentStepInterval = 0; // Track current interval for dynamic adjustment

    function createStep() {
        if (isPaused) return;

        const stepModel = new Step();
        const stepView = new StepView();
        const stepController = new StepController(stepModel, stepView);

        stepController.initialize(mainElement);
        steps.push(stepModel);
        stepViews.push(stepView);
        stepControllers.push(stepController);
        
        // Don't update counter here - only when player lands on steps
        
        // Add class for smaller bricks on mobile when more than 6
        const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
        if (isMobile && steps.length > 6 && stepView.element) {
            stepView.element.classList.add("many-bricks");
        }
        
        // Increase interval as game progresses (every 5 steps, increase by 150ms on mobile, 100ms on desktop)
        if (steps.length % 5 === 0 && steps.length > 0) {
            const increaseAmount = isMobile ? 150 : 100;
            const maxInterval = isMobile ? 5000 : 4000;
            currentStepInterval = Math.min(currentStepInterval + increaseAmount, maxInterval);
            
            // Restart interval with new timing
            if (stepInterval) {
                clearInterval(stepInterval);
            }
            stepInterval = setInterval(createStep, currentStepInterval);
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
                // Steps move faster on mobile
                const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
                const moveSpeed = isMobile ? 0.180 : 0.120; // Faster on mobile
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
            const baseInterval = isMobile ? 2500 : 1200; // Larger gap on mobile
            currentStepInterval = baseInterval;
            stepInterval = setInterval(createStep, currentStepInterval);
        }
    });

    restartButton.addEventListener("click", () => {
        // Reset step counter and landed steps
        landedSteps.clear();
        const stepCount = document.getElementById("step-count");
        if (stepCount) {
            stepCount.textContent = "0";
        }
        location.reload();
    });

            const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
            const baseInterval = isMobile ? 2500 : 2000; // Larger gap on mobile
            currentStepInterval = baseInterval;
            stepInterval = setInterval(createStep, currentStepInterval);
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
