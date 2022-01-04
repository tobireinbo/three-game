import { Vector3 } from "three";
import { FBXComponent } from "../ecs/components/3d/FBXComponent";
import { Entity } from "../ecs/Entity";
import { EntityManager } from "../ecs/EntityManager";
import { BasicCharacterController } from "./Character/BasicCharacterController";
import { BirdCamera } from "./Character/BirdCamera";
import { ThreeController } from "./ThreeController";
import { SpatialHash_Fast } from "../ecs/SpatialHashGrid";
import { SpatialGridController } from "../ecs/components/3d/SpatialGridController";
import { CollisionBoxComponent } from "./Character/CollisionBoxComponent";
import { spawnAtRandom } from "../helper/spawner";

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
          spawnAtRandom(100, 300, [0.1, 0.4], model, (obj) =>
            three.addObject(obj)
          );
        },
        scale: 0.5,
        path: "models/",
        files: { model: "Plant_1.fbx" },
      })
    );
    this.entityManager.add(BUSH, "BUSH");

    const BUSH_2 = new Entity();
    BUSH_2.addComponent(
      new FBXComponent({
        add: (model) => {
          spawnAtRandom(100, 300, [0.05, 0.1], model, (obj) =>
            three.addObject(obj)
          );
        },
        scale: 0.2,
        path: "models/",
        files: { model: "Grass.fbx" },
      })
    );
    this.entityManager.add(BUSH_2, "BUSH_2");

    const BUSH_3 = new Entity();
    BUSH_3.addComponent(
      new FBXComponent({
        add: (model) => {
          spawnAtRandom(100, 300, [0.05, 0.1], model, (obj) =>
            three.addObject(obj)
          );
        },
        scale: 0.2,
        path: "models/",
        files: { model: "Plant_2.fbx" },
      })
    );
    this.entityManager.add(BUSH_3, "BUSH_3");

    const TREE = new Entity();
    TREE.addComponent(
      new FBXComponent({
        add: (model) => {
          TREE.addComponent(
            new CollisionBoxComponent({ target: model, scene: three.scene })
          );
          three.addObject(model);
        },
        scale: 0.35,
        offset: new Vector3(0, 0, -100),
        path: "models/",
        files: { model: "CommonTree_1.fbx" },
      })
    );
    TREE.addComponent(new SpatialGridController({ grid }));
    this.entityManager.add(TREE, "TREE");

    const CHARACTER = new Entity();
    CHARACTER.addComponent(
      new FBXComponent({
        add: (model) => {
          CHARACTER.addComponent(
            new CollisionBoxComponent({ target: model, scene: three.scene })
          );
          three.addObject(model);
        },
        scale: 0.2,
        path: "models/",
        files: {
          model: "michelle.fbx",
          animations: [
            { action: "idle", file: "Idle.fbx" },
            { action: "walk", file: "Walking.fbx" },
            { action: "run", file: "Run.fbx" },
            { action: "reverse", file: "Walking Backwards.fbx" },
          ],
        },
      })
    );

    /*
    const BOX = new Entity();
    BOX.addComponent(
      new CubeComponent({
        add: (cube) => {
          BOX.addComponent(
            new CollisionBoxComponent({ target: cube, scene: three.scene })
          );
          three.addObject(cube);
        },
      })
    );
    BOX.addComponent(new SpatialGridController({ grid }));
    this.entityManager.add(BOX, "BOX");
    */

    CHARACTER.addComponent(new SpatialGridController({ grid }));
    if (three?.camera) {
      CHARACTER.addComponent(new BirdCamera({ camera: three.camera }));
    }
    CHARACTER.addComponent(new BasicCharacterController());
    this.entityManager.add(CHARACTER);

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
