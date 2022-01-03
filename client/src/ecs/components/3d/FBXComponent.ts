import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  LoadingManager,
  Object3D,
  Scene,
  Vector3,
} from "three";
import { Component } from "../../Component";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { KeyableObject, Topics } from "../../common";

export type FBXComponentParams = {
  path: string;
  files: { model: string; animations?: { action: string; file: string }[] };
  scale: number;
  add: (model: Object3D) => void;
};

export class FBXComponent extends Component {
  public mixer: AnimationMixer | undefined;
  private _loadingManager: LoadingManager | undefined;
  private _model: Object3D | undefined;
  public animations: KeyableObject<{
    clip: AnimationClip;
    action: AnimationAction;
  }>;
  constructor(private _params: FBXComponentParams) {
    super();
    this.animations = {};
  }

  onAddEntity(): void {
    this._loadModel();

    this.registerHandler(Topics.updatePosition, (pos) => {
      this._model?.position.copy(pos);
    });

    this.registerHandler(Topics.updateRotation, (rot) => {
      this._model?.quaternion.copy(rot);
    });
  }

  private _loadModel() {
    const loader = new FBXLoader();
    loader.setPath(this._params.path);
    loader.load(this._params.files.model, (fbx) => {
      fbx.scale.setScalar(this._params.scale);
      fbx.traverse((c) => (c.castShadow = true));

      this._model = fbx;
      this._params.add(this._model);

      if (this._params.files.animations) {
        this.mixer = new AnimationMixer(this._model);
        this._loadingManager = new LoadingManager();
        this._loadingManager.onLoad = () => {
          this.fireHandlers({ topic: Topics.animationLoaded, value: true });
        };

        const animationLoader = new FBXLoader(this._loadingManager);
        animationLoader.setPath(this._params.path);
        this._params.files.animations.forEach((animation) => {
          animationLoader.load(animation.file, (a) => {
            const clip = a.animations[0];
            const action = this.mixer?.clipAction(clip);

            if (clip && action) {
              this.animations[animation.action] = {
                clip,
                action,
              };
            }
          });
        });
      }
    });
  }

  onUpdate(timeElapsed: number): void {
    this.mixer?.update(timeElapsed);
  }
}
