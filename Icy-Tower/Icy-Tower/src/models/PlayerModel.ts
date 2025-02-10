export class Player {
    private imageUrl: string;
    private positionX: number;
    private positionY: number;
    private velocityY: number;
    private gravity: number;
    private isJumping: boolean;

    constructor(x: number, y: number, imageUrl: string) {
        this.positionX = x;
        this.positionY = y;
        this.imageUrl = imageUrl;
        this.velocityY = 0;
        this.gravity = 0.5;
        this.isJumping = false;
    }

    get image() {
        return this.imageUrl;
    }

    set image(newImageUrl: string) {
        this.imageUrl = newImageUrl;
    }

    get position() {
        return { x: this.positionX, y: this.positionY };
    }

    set position(newPosition: { x: number; y: number }) {
        this.positionX = newPosition.x;
        this.positionY = newPosition.y;
    }

    get velocity() {
        return this.velocityY;
    }

    set velocity(newVelocity: number) {
        this.velocityY = newVelocity;
    }

    get isPlayerJumping() {
        return this.isJumping;
    }

    set isPlayerJumping(state: boolean) {
        this.isJumping = state;
    }

    get gravityForce() {
        return this.gravity;
    }
}
