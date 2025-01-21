export default class Step {
    private positionX: number;
    private positionY: number;
    private width: number;
    private height: number;
    private element: HTMLDivElement | null;

    constructor() {
        this.width = Math.floor(Math.random() * (40 - 10) + 10);
        this.height = 5;
        this.positionX = Math.floor(Math.random() * (60 - 8) + 8);
        this.positionY = 0;
        this.element = null;
    }

    get getPositionX() {
        return this.positionX;
    }

    get getPositionY() {
        return this.positionY;
    }

    get getWidth() {
        return this.width;
    }

    get getHeight() {
        return this.height;
    }

    renderStep(mainElement: HTMLDivElement) {
        const step = document.createElement('div');
        step.classList.add('stepDesign');
        step.style.width = `${this.width}vw`;
        step.style.position = 'absolute';
        step.style.height = `${this.height}vh`;
        step.style.top = `${this.positionY}vh`;
        step.style.left = `${this.positionX}vw`;
        step.style.setProperty('--initial-positionY', `${this.positionY}vh`);
        const animationDuration = 10;
        step.style.animationDuration = `${animationDuration}s`;
        step.style.animationPlayState = 'running';
        mainElement.appendChild(step);
        this.element = step;
    }

    public stopAnimation() {
        if (this.element) {
            this.element.style.animationPlayState = 'paused'; 
        }
    }

    public resumeAnimation() {
        if (this.element) {
            this.element.style.animationPlayState = 'running';
        }
    }
}