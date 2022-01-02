import { PerspectiveCamera, Vector3 } from "three";
import { Component } from "../../ecs/Component";

export class BirdCamera extends Component {
  private _lookat?: Vector3;
  constructor(private _params: { camera: PerspectiveCamera }) {
    super();
  }

  onAddEntity(): void {
    this._lookat = new Vector3();
    this._params.camera.position.setY(80);
  }

  onUpdate(): void {
    const lookat = this.entity?.position;
    const offset = new Vector3(-80, 0, 0);

    if (lookat && this._lookat) {
      this._lookat?.copy(lookat);
      this._params.camera.lookAt(this._lookat);
      this._params.camera.position.setZ(lookat.z + offset.z);
      this._params.camera.position.setX(lookat.x + offset.x);
    }
  }
}
