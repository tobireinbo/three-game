import { Vector3 } from "three";
import { FBXComponent } from "../ecs/components/3d/FBXComponent";
import { Entity } from "../ecs/Entity";
import { EntityManager } from "../ecs/EntityManager";
import { BasicCharacterController } from "./Character/BasicCharacterController";
import { BirdCamera } from "./Character/BirdCamera";
import { ThreeController } from "./ThreeController";
import { CubeComponent } from "./Character/CubeComponent";
import { SpatialHash_Fast } from "../ecs/SpatialHashGrid";
import { SpatialGridController } from "../ecs/components/3d/SpatialGridController";
import { GLTFComponent } from "../ecs/components/3d/GLTFComponent";

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
    const grid = new SpatialHash_Fast(
      [
        [-1000, -1000],
        [1000, 1000],
      ],
      [100, 100]
    );
    this.entityManager = new EntityManager();

    const WORLD = new Entity();
    const three = new ThreeController(this.wrapper);
    WORLD.addComponent(three);
    this.entityManager.add(WORLD);

    const BUSH = new Entity();
    BUSH.addComponent(
      new FBXComponent({
        add: (model) => {
          three.addObject(model);
        },
        scale: 0.1,
        path: "models/",
        files: { model: "Bush_1.fbx" },
      })
    );
    this.entityManager.add(BUSH);

    const TREE = new Entity();
    TREE.addComponent(
      new FBXComponent({
        add: (model) => three.addObject(model),
        scale: 0.35,
        path: "models/",
        files: { model: "CommonTree_1.fbx" },
      })
    );
    this.entityManager.add(TREE);

    const CHARACTER = new Entity();
    CHARACTER.addComponent(
      new FBXComponent({
        add: (model) => {
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
      })
    );
    CHARACTER.addComponent(new SpatialGridController({ grid }));
    if (three?.camera) {
      CHARACTER.addComponent(new BirdCamera({ camera: three.camera }));
    }
    CHARACTER.addComponent(new BasicCharacterController());
    this.entityManager.add(CHARACTER);

    const BOX = new Entity();
    BOX.addComponent(
      new CubeComponent({ add: (cube) => three.addObject(cube) })
    );
    BOX.addComponent(new SpatialGridController({ grid }));
    this.entityManager.add(BOX, "BOX");

    this.animate();
  }

  animate() {
    requestAnimationFrame((time: number) => {
      if (this._prevAnimationFrameTime === null) {
        this._prevAnimationFrameTime = time;
      }

      const deltaTime = Math.min(
        1.0 / 60.0,
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
