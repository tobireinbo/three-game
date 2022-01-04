import { PerspectiveCamera, Vector3 } from "three";
import { Component } from "../../ecs/Component";

export class BirdCamera extends Component {
  private _lookat?: Vector3;
  constructor(private _params: { camera: PerspectiveCamera }) {
    super();
  }

  onAddEntity(): void {
    this._lookat = new Vector3();
  }

  onUpdate(): void {
    const lookat = this.entity?.position;
    const offset = new Vector3(-60, 60, 0);

    if (lookat && this._lookat) {
      this._lookat?.copy(lookat);
      this._params.camera.lookAt(this._lookat);
      this._params.camera.position.set(
        lookat.x + offset.x,
        lookat.y + offset.y,
        lookat.z + offset.z
      );
    }
  }
}
