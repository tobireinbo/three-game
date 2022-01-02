import { Quaternion, Vector3 } from "three";
import { KeyableObject } from "./common";
import { Entity } from "./Entity";

export class EntityManager {
  private _ids: number;
  private _entitiesMap: KeyableObject<Entity>;
  private _entities: Entity[];

  constructor() {
    this._ids = 0;
    this._entitiesMap = {};
    this._entities = [];
  }

  private _generateName() {
    this._ids += 1;

    return `__name__${this._ids}`;
  }

  get(n: string) {
    return this._entitiesMap[n];
  }

  filter(cb: (entity: Entity) => boolean) {
    return this._entities.filter(cb);
  }

  add(entity: Entity, name?: string) {
    if (!name) {
      name = this._generateName();
    }

    this._entitiesMap[name] = entity;
    this._entities.push(entity);

    entity.setEntityManager(this);
    entity.setName(name);
    entity.onAddEntity();
  }

  setActive(entity: Entity, b: unknown) {
    const index = this._entities.indexOf(entity);

    if (!b) {
      if (index < 0) {
        return;
      }

      this._entities.splice(index, 1);
    } else {
      if (index >= 0) {
        return;
      }

      this._entities.push(entity);
    }
  }

  update(timeElapsed: number) {
    const lerpFactor = 1.0 - Math.pow(0.001, timeElapsed);

    const dead = [];
    const alive = [];
    for (let index = 0; index < this._entities.length; index++) {
      const entity = this._entities[index];

      entity.onUpdate(timeElapsed, lerpFactor);

      if (entity.dead) {
        dead.push(entity);
      } else {
        alive.push(entity);
      }
    }

    for (let index = 0; index < dead.length; index++) {
      const entity = dead[index];

      if (entity.name) {
        delete this._entitiesMap[entity.name];
      }

      entity.onDestroy();
    }

    this._entities = alive;
  }
}
