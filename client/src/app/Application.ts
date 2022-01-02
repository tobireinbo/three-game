import { Vector3 } from "three";
import { FBXComponent } from "../ecs/components/3d/FBXComponent";
import { Entity } from "../ecs/Entity";
import { EntityManager } from "../ecs/EntityManager";
import { BasicCharacterController } from "./Character/BasicCharacterController";
import { ThirdPersonCamera } from "./Character/ThirdPersonCamera";
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
    const three = new ThreeController(this.wrapper);
    WORLD.addComponent(three);
    if (three?.scene) {
      WORLD.addComponent(
        new FBXComponent({
          scene: three.scene,
          scale: 0.1,
          path: "models",
          files: { model: "Grass.fbx" },
          offset: new Vector3(0, 0, 0),
        })
      );
    }

    const CHARACTER = new Entity();
    this.entityManager.add(CHARACTER, "char");
    if (three?.scene) {
      CHARACTER.addComponent(
        new FBXComponent({
          scene: three.scene,
          scale: 0.2,
          path: "models/",
          files: {
            model: "michelle.fbx",
            animations: [
              { action: "dance", file: "Defeated.fbx" },
              { action: "idle", file: "Idle.fbx" },
              { action: "walk", file: "Walking.fbx" },
              { action: "run", file: "Run.fbx" },
            ],
          },
          offset: new Vector3(0, 0, 0),
        })
      );
    }
    if (three?.camera) {
      CHARACTER.addComponent(new ThirdPersonCamera({ camera: three.camera }));
    }
    CHARACTER.addComponent(new BasicCharacterController());

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
