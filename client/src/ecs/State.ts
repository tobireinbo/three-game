import { KeyableObject } from "./common";

export class StateMachine {
  private _states: KeyableObject<typeof State>;
  private _currentState: State | null;
  constructor() {
    this._states = {};
    this._currentState = null;
  }

  addState(name: string, type: typeof State) {
    this._states[name] = type;
  }

  setState(name: string) {
    const prevState = this._currentState;

    if (prevState) {
      if (prevState.name === name) {
        return;
      }
      prevState.onExit();
    }

    /*
    instantiate the state with name from states object
    
    Example:
this.update(0)
    
    this._states = {
      "walk": WalkState
    }

    given name in func is "walk"
    -> const state = new WalkState(this)
    */
    const state = new (<any>this._states)[name](this);

    this._currentState = state;
    state.onEnter(prevState);
  }

  update(timeElapsed: number, ...data: Parameters<any>) {
    if (this._currentState) {
      this._currentState.onUpdate(timeElapsed, ...data);
    }
  }
}

export class State {
  constructor(public stateMachine: StateMachine) {}

  get name() {
    return "none";
  }

  onEnter(prevState: State | null) {}
  onExit() {}
  onUpdate(timeElapsed: number, ...params: Parameters<any>) {}
}
