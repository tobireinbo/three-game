import { KeyableObject } from "./common";

export class State<T> {
  private _value: T;
  constructor(initValue: T, public onUpdate?: (timeElapsed: number) => void) {
    this._value = initValue;
  }

  setState(value: T) {
    this._value = value;
  }

  get value() {
    return this._value;
  }
}

export class StateManager {
  private _states: KeyableObject<State<any>>;

  constructor() {
    this._states = {};
  }

  setState(key: string, value: any) {
    if (!this._states[key]) {
      this._states[key] = new State(value);
    } else {
      this._states[key].setState(value);
    }
  }

  getState(key: string) {
    return this._states[key].value;
  }

  update(timeElapsed: number) {
    for (const key in this._states) {
      const currentState = this._states[key];
      if (currentState.onUpdate) {
        currentState.onUpdate(timeElapsed);
      }
    }
  }
}
