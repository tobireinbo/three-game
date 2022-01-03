import {
  AnimationAction,
  AnimationClip,
  BoxGeometry,
  Mesh,
  MeshPhongMaterial,
  Object3D,
} from "three";
import { KeyableObject, Topics } from "../../ecs/common";
import { Component } from "../../ecs/Component";

export type CubeComponentParams = {
  //scale: number;
  //offset: Vector3;
  add: (model: Object3D) => void;
};

export class CubeComponent extends Component {
  private _model: Object3D | undefined;
  public animations: KeyableObject<{
    clip: AnimationClip;
    action: AnimationAction;
  }>;
  constructor(private _params: CubeComponentParams) {
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
    const size = Math.floor(Math.random() * 100);
    const boxGeo = new BoxGeometry(size, size, size);
    const boxMat = new MeshPhongMaterial({
      color: "#ff0000",
      depthWrite: false,
    });
    const box = new Mesh(boxGeo, boxMat);
    box.position.setY(Math.floor(size / 2));
    box.position.setZ(100);
    this.entity?.setPosition(box.position);
    box.receiveShadow = true;
    box.castShadow = true;

    this._model = box;

    this._params.add(box);
  }
}
