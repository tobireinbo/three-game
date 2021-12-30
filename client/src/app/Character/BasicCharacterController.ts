import { Object3D, Quaternion, Scene, Vector3 } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { KeyableObject, Topics } from "../../ecs/common";
import { Component } from "../../ecs/Component";
import { FBXComponent } from "../../ecs/components/3d/FBXComponent";
import { Entity } from "../../ecs/Entity";

export class BasicCharacterController extends Component {
  private _stateMachine: FiniteStateMachine | undefined;
  private _input: BasicCharacterControllerInput;

  private _deccel: Vector3;
  private _accel: Vector3;
  private _velocity: Vector3;
  constructor() {
    super();

    this._input = new BasicCharacterControllerInput();

    this._deccel = new Vector3(-0.0005, -0.0001, -5.0);
    this._accel = new Vector3(1, 0.25, 200.0);
    this._velocity = new Vector3(0, 0, 0);
  }

  onAddComponent(): void {
    if (this.entity) {
      this._stateMachine = new CharacterFSM(this.entity);
    }

    this.registerHandler(Topics.animationLoaded, (loaded) => {
      if (loaded) {
        this._stateMachine?.setState("idle");
      }
    });
  }

  onUpdate(timeElapsed: number): void {
    this._stateMachine?.update(timeElapsed, this._input);

    const velocity = this._velocity;
    const frameDeccel = new Vector3(
      velocity.x * this._deccel.x,
      velocity.y * this._deccel.y,
      velocity.z * this._deccel.z
    );
    frameDeccel.multiplyScalar(timeElapsed);
    frameDeccel.z =
      Math.sign(frameDeccel.z) *
      Math.min(Math.abs(frameDeccel.z), Math.abs(velocity.z));

    velocity.add(frameDeccel);

    const controlObject = this.entity;
    if (controlObject) {
      const rotationTarget = new Quaternion();
      const axis = new Vector3();
      const newRotation = controlObject.quaternion.clone();

      const accel = this._accel.clone();

      if (this._input.keys.shift) {
        accel.multiplyScalar(2.0);
      }

      if (this._input.keys.forward) {
        velocity.z += accel.z * timeElapsed;
      }
      if (this._input.keys.backward) {
        velocity.z -= accel.z * timeElapsed;
      }
      if (this._input.keys.left) {
        axis.set(0, 1, 0);
        rotationTarget.setFromAxisAngle(
          axis,
          4.0 * Math.PI * timeElapsed * this._accel.y
        );
        newRotation.multiply(rotationTarget);
      }
      if (this._input.keys.right) {
        axis.set(0, 1, 0);
        rotationTarget.setFromAxisAngle(
          axis,
          4.0 * -Math.PI * timeElapsed * this._accel.y
        );
        newRotation.multiply(rotationTarget);
      }

      const forward = new Vector3(0, 0, 1);
      forward.applyQuaternion(controlObject.quaternion);
      forward.normalize();
      forward.multiplyScalar(velocity.z * timeElapsed);

      const sideways = new Vector3(1, 0, 0);
      sideways.applyQuaternion(controlObject.quaternion);
      sideways.normalize();
      sideways.multiplyScalar(velocity.x * timeElapsed);

      const position = controlObject.position.clone();
      position.add(forward);
      position.add(sideways);

      controlObject.quaternion.copy(newRotation);
      controlObject.position.copy(position);

      position.copy(controlObject.position);

      this.entity?.setPosition(controlObject.position);
      this.entity?.setQuaternion(controlObject.quaternion);
    }
  }
}

export class BasicCharacterControllerInput {
  public readonly keys: KeyableObject<boolean>;
  constructor() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    };

    document.addEventListener("keydown", (e) => this._onKeyDown(e), false);
    document.addEventListener("keyup", (e) => this._onKeyUp(e), false);
  }

  private _onKeyDown(event: KeyboardEvent) {
    const lowerCaseKey = event.key.toLowerCase();

    switch (lowerCaseKey) {
      case "w": // w
        this.keys.forward = true;
        break;
      case "a": // a
        this.keys.left = true;
        break;
      case "s": // s
        this.keys.backward = true;
        break;
      case "d": // d
        this.keys.right = true;
        break;
      case "space": // SPACE
        this.keys.space = true;
        break;
      case "shift": // SHIFT
        this.keys.shift = true;
        break;
    }
  }

  private _onKeyUp(event: KeyboardEvent) {
    const lowerCaseKey = event.key.toLowerCase();
    switch (lowerCaseKey) {
      case "w": // w
        this.keys.forward = false;
        break;
      case "a": // a
        this.keys.left = false;
        break;
      case "s": // s
        this.keys.backward = false;
        break;
      case "d": // d
        this.keys.right = false;
        break;
      case "space": // SPACE
        this.keys.space = false;
        break;
      case "shift": // SHIFT
        this.keys.shift = false;
        break;
    }
  }
}

export class FiniteStateMachine {
  private _states: KeyableObject<typeof State>; //obects stores names of classes
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

    //instantiate the state with name from states object
    const state = new (<any>this._states)[name](this);

    this._currentState = state;
    state.onEnter(prevState);
  }

  update(timeElapsed: number, input: BasicCharacterControllerInput) {
    if (this._currentState) {
      this._currentState.onUpdate(timeElapsed, input);
    }
  }
}

class State {
  constructor(public fsm: FiniteStateMachine) {}

  get name() {
    return "none";
  }

  onEnter(...params: Parameters<any>) {}
  onExit(...params: Parameters<any>) {}
  onUpdate(...params: Parameters<any>) {}
}

class CharacterFSM extends FiniteStateMachine {
  constructor(public entity: Entity) {
    super();

    this._init();
  }

  private _init() {
    this.addState("idle", IdleState);
    this.addState("walk", WalkState);
    this.addState("run", RunState);
  }
}

class IdleState extends State {
  constructor(public fsm: CharacterFSM) {
    super(fsm);
  }

  get name(): string {
    return "idle";
  }

  onEnter(prevState: State | null): void {
    const fbxComponent =
      this.fsm.entity.getComponent<FBXComponent>("FBXComponent");
    if (fbxComponent) {
      const idleAction = fbxComponent.animations["idle"].action;
      if (prevState) {
        const prevAction = fbxComponent.animations[prevState.name].action;
        idleAction.time = 0.0;
        idleAction.enabled = true;
        idleAction.setEffectiveTimeScale(1.0);
        idleAction.setEffectiveWeight(1.0);
        idleAction.crossFadeFrom(prevAction, 0.5, true);
      }
      idleAction.play();
    }
  }

  onUpdate(_: any, input: BasicCharacterControllerInput): void {
    if (input.keys.forward || input.keys.backward) {
      this.fsm.setState("walk");
    } else if (input.keys.space) {
      this.fsm.setState("dance");
    }
  }
}

class WalkState extends State {
  constructor(public fsm: CharacterFSM) {
    super(fsm);
  }

  get name(): string {
    return "walk";
  }

  onEnter(prevState: State | null): void {
    const fbxComponent =
      this.fsm.entity.getComponent<FBXComponent>("FBXComponent");
    if (fbxComponent) {
      const currentAction = fbxComponent.animations["walk"].action;
      if (prevState) {
        const prevAction = fbxComponent.animations[prevState.name].action;
        currentAction.enabled = true;
        if (prevState.name === "run") {
          const ratio =
            currentAction.getClip().duration / prevAction.getClip().duration;
          currentAction.time = prevAction.time * ratio;
        } else {
          currentAction.time = 0.0;
          currentAction.setEffectiveTimeScale(1.0);
          currentAction.setEffectiveWeight(1.0);
        }

        currentAction.crossFadeFrom(prevAction, 0.5, true);
      }
      currentAction.play();
    }
  }
  onUpdate(_: any, input: BasicCharacterControllerInput): void {
    if (input.keys.forward || input.keys.backward) {
      if (input.keys.shift) {
        this.fsm.setState("run");
      }
      return;
    }
    this.fsm.setState("idle");
  }
}

class RunState extends State {
  constructor(public fsm: CharacterFSM) {
    super(fsm);
  }

  get name(): string {
    return "run";
  }

  onEnter(prevState: State | null): void {
    const fbxComponent =
      this.fsm.entity.getComponent<FBXComponent>("FBXComponent");
    if (fbxComponent) {
      const currentAction = fbxComponent.animations["run"].action;
      if (prevState) {
        const prevAction = fbxComponent.animations[prevState.name].action;
        currentAction.enabled = true;
        if (prevState.name === "walk") {
          const ratio =
            currentAction.getClip().duration / prevAction.getClip().duration;
          currentAction.time = prevAction.time * ratio;
        } else {
          currentAction.time = 0.0;
          currentAction.setEffectiveTimeScale(1.0);
          currentAction.setEffectiveWeight(1.0);
        }

        currentAction.crossFadeFrom(prevAction, 0.5, true);
      }
      currentAction.play();
    }
  }

  onUpdate(_: any, input: BasicCharacterControllerInput): void {
    if (input.keys.forward || input.keys.backward) {
      if (!input.keys.shift) {
        this.fsm.setState("walk");
      }
      return;
    }
    this.fsm.setState("idle");
  }
}
