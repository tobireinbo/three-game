import { Vector3 } from "three";
import { FBXComponent } from "../ecs/components/3d/FBXComponent";
import { Entity } from "../ecs/Entity";
import { EntityManager } from "../ecs/EntityManager";
import { BasicCharacterController } from "./Character/BasicCharacterController";
import { ThreeController } from "./ThreeController";

export class Application {
  wrapper: HTMLElement;
  entityManager: EntityManager | undefined;

  private _prevAnimationFrameTime: number | null;

  constructor(mountToElement: HTMLElement) {
    this.wrapper = mountToElement;
    this._prevAnimationFrameTime = null;

    this.init();
  }

  init() {
    this.entityManager = new EntityManager();

    const WORLD = new Entity();
    this.entityManager.add(WORLD, "world");
    WORLD.addComponent(new ThreeController(this.wrapper));

    const Character = new Entity();
    this.entityManager.add(Character, "char");
    const three = WORLD.getComponent<ThreeController>("ThreeController");
    if (three?.scene) {
      Character.addComponent(
        new FBXComponent({
          scene: three.scene,
          scale: 1,
          path: "models/",
          files: {
            model: "michelle.fbx",
            animations: [
              { action: "dance", file: "Defeated.fbx" },
              { action: "idle", file: "Idle.fbx" },
              { action: "walk", file: "Walking.fbx" },
              { action: "run", file: "Slow Run.fbx" },
            ],
          },
          offset: new Vector3(0, 0, 0),
        })
      );
    }
    Character.addComponent(new BasicCharacterController());

    this.animate();
  }

  animate() {
    requestAnimationFrame((time: number) => {
      if (this._prevAnimationFrameTime === null) {
        this._prevAnimationFrameTime = time;
      }

      const deltaTime = Math.min(
        1.0 / 30.0,
        time - this._prevAnimationFrameTime * 0.001
      );
      this.entityManager?.update(deltaTime);

      this._prevAnimationFrameTime = time;

      setTimeout(() => {
        this.animate();
      }, 10);
    });
  }
}
