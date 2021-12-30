import { Vector3, Quaternion } from "three";
import { KeyableObject, Handler, Message, Topics } from "./common";
import { Component } from "./Component";
import { EntityManager } from "./EntityManager";

export class Entity {
  private _name: string | null;
  private _components: KeyableObject | null;
  private _position: Vector3;
  private _rotation: Quaternion;

  /*
  example:
  {
    "topic": [
      () => console.log("hello world"),
      () => console.log("event fired")
    ]
  }

  handlers can be targetted by a given topic and only be fired by components in the same entity
  */
  private _handlers: KeyableObject<Handler[]> | null;
  entityManager: EntityManager | null;
  dead: boolean;

  constructor() {
    this._name = null;
    this._components = {};
    this._position = new Vector3();
    this._rotation = new Quaternion();
    this._handlers = {};
    this.entityManager = null;
    this.dead = false;
  }

  registerHandler(topic: string, handler: Handler): void {
    if (this._handlers) {
      if (!(topic in this._handlers)) {
        this._handlers[topic] = [];
      }

      this._handlers[topic].push(handler);
    }
  }

  setEntityManager(em: EntityManager): void {
    this.entityManager = em;
  }

  setName(name: string): void {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  setActive(b: unknown): void {
    if (this.entityManager) this.entityManager.setActive(this, b);
  }

  setDead(): void {
    this.dead = true;
  }

  addComponent(component: Component): void {
    if (this._components) {
      component.setEntity(this);
      this._components[component.constructor.name] = component;
      component.onAddComponent();
    }
  }

  onAddEntity(): void {
    for (let key in this._components) {
      this._components[key].onAddEntity();
    }
  }

  getComponent<T extends Component>(name: string): T | undefined {
    if (this._components) {
      return this._components[name];
    } else {
      return undefined;
    }
  }

  findEntity(name: string): Entity | undefined {
    return this.entityManager?.get(name);
  }

  fireHandlers(message: Message): void {
    if (this._handlers) {
      if (!(message.topic in this._handlers)) {
        return;
      }

      for (let currentHandler of this._handlers[message.topic]) {
        currentHandler(message.value);
      }
    }
  }

  setPosition(position: Vector3) {
    this._position.copy(position);
    this.fireHandlers({ topic: Topics.updatePosition, value: this._position });
  }

  setQuaternion(rotation: Quaternion) {
    this._rotation.copy(rotation);
    this.fireHandlers({
      topic: Topics.updateRotation,
      value: this._rotation,
    });
  }

  get position() {
    return this._position;
  }

  get quaternion() {
    return this._rotation;
  }

  onUpdate(timeElapsed: number) {
    for (let key in this._components) {
      this._components[key].onUpdate(timeElapsed);
    }
  }

  onDestroy(): void {
    for (let key in this._components) {
      this._components[key].onDestroy();
    }
    this._components = null;
    this.entityManager = null;
    this._handlers = null;
  }
}
