import { AnimationAction, AnimationClip, Object3D, Vector3 } from "three";
import { Component } from "../../Component";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { KeyableObject, Topics } from "../../common";

export type GLTFComponentParams = {
  path: string;
  files: { model: string };
  scale: number;
  offset: Vector3;
  add: (model: Object3D) => void;
};

export class GLTFComponent extends Component {
  private _model: Object3D | undefined;
  public animations: KeyableObject<{
    clip: AnimationClip;
    action: AnimationAction;
  }>;
  constructor(private _params: GLTFComponentParams) {
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
    const loader = new GLTFLoader();
    loader.setPath(this._params.path);
    loader.load(this._params.files.model, (gltf) => {
      const obj = gltf.scene;
      obj.scale.setScalar(this._params.scale);
      obj.traverse((c) => (c.castShadow = true));

      this._model = obj;
      this._params.add(this._model);
    });
  }
}
