export class Step {
    private positionX: number;
    private positionY: number;
    private width: number;
    private height: number;

    constructor() {
        this.width = Math.floor(Math.random() * (40 - 10) + 10);
        this.height = 5;
        this.positionX = Math.floor(Math.random() * (60 - 8) + 8);
        this.positionY = 0;
    }

    get position() {
        return { x: this.positionX, y: this.positionY };
    }

    get dimensions() {
        return { width: this.width, height: this.height };
    }

    set position(newPosition: { x: number; y: number }) {
        this.positionX = newPosition.x;
        this.positionY = newPosition.y;
    }
}
