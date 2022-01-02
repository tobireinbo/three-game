import { Vector3 } from "three";
import { FBXComponent } from "../ecs/components/3d/FBXComponent";
import { Entity } from "../ecs/Entity";
import { EntityManager } from "../ecs/EntityManager";
import { BasicCharacterController } from "./Character/BasicCharacterController";
import { BirdCamera } from "./Character/BirdCamera";
import { ThirdPersonCamera } from "./Character/ThirdPersonCamera";
import { ThreeController } from "./ThreeController";
import { AmmoPhysics } from "three/examples/jsm/physics/AmmoPhysics.js";
import { CubeComponent } from "./Character/CubeComponent";

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
    //@ts-ignore
    AmmoPhysics().then((physics) => {
      console.log("physics", physics);

      //disable physics, since character controller is not coupled to physics
      physics = undefined;

      this.entityManager = new EntityManager();

      const WORLD = new Entity();
      const three = new ThreeController(this.wrapper, physics);
      WORLD.addComponent(three);
      this.entityManager.add(WORLD, "world");

      const CHARACTER = new Entity();
      if (three?.scene) {
        CHARACTER.addComponent(
          new FBXComponent({
            add: (model) => {
              console.log(model);
              three.addObject(model);
            },
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
        CHARACTER.addComponent(new BirdCamera({ camera: three.camera }));
      }
      CHARACTER.addComponent(new BasicCharacterController());
      this.entityManager.add(CHARACTER, "char");

      this.animate();
    });
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
