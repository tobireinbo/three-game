import { Message, Handler } from "./common";
import { Entity } from "./Entity";

export class Component {
  entity: Entity | null;

  constructor() {
    this.entity = null;
  }

  get entityManager() {
    return this.entity?.entityManager;
  }

  setEntity(entity: Entity): void {
    this.entity = entity;
  }

  getComponent<T extends Component>(name: string): T | undefined {
    return this.entity?.getComponent(name);
  }

  findEntity(name: string): Entity | undefined {
    return this.entity?.findEntity(name);
  }

  fireHandlers(message: Message): void {
    this.entity?.fireHandlers(message);
  }

  registerHandler(topic: string, handler: Handler): void {
    this.entity?.registerHandler(topic, handler);
  }

  onDestroy(): void {}

  onUpdate(timeElapsed: number, lerpFactor: number): void {}

  onAddComponent(): void {}

  onAddEntity(): void {}
}
