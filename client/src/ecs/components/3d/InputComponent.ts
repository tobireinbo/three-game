import { Topics } from "../../common";
import { Component } from "../../Component";

export class InputComponent extends Component {
  constructor() {
    super();
  }

  onAddEntity(): void {
    console.log(this.entity);
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
  }

  private _onKeyDown = (event: KeyboardEvent) => {
    this.fireHandlers({ topic: Topics.keyDown, value: event.key });
  };

  private _onKeyUp = (event: KeyboardEvent) => {
    this.fireHandlers({ topic: Topics.keyUp, value: event.key });
  };
}
