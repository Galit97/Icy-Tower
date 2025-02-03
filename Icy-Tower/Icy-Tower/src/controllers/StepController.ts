
import { Step } from "../models/StepModel";
import { StepView } from "../views/StepView";

export class StepController {
  private model: Step;
  private view: StepView;

  constructor(model: Step, view: StepView) {
    this.model = model;
    this.view = view;
  }

  initialize(mainElement: HTMLDivElement) {
    this.view.render(this.model, mainElement);
  }
}
