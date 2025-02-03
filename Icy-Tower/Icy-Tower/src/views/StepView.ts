import { Step } from "../models/StepModel";


export class StepView {
    public element: HTMLDivElement | null;

    constructor() {
        this.element = null;
    }

    render(step: Step, mainElement: HTMLDivElement) {
        const stepElement = document.createElement("div");
        stepElement.classList.add("stepDesign");
        stepElement.style.width = `${step.dimensions.width}vw`;
        stepElement.style.height = `${step.dimensions.height}vh`;
        stepElement.style.top = `${step.position.y}vh`;
        stepElement.style.left = `${step.position.x}vw`;
        stepElement.style.position = "absolute";
        stepElement.style.backgroundColor = "#333";

        mainElement.appendChild(stepElement);
        this.element = stepElement;
    }

    updatePosition(step: Step) {
        if (this.element) {
            this.element.style.top = `${step.position.y}vh`;
            this.element.style.left = `${step.position.x}vw`;
        }
    }
}
