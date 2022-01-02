import { PerspectiveCamera, Vector3 } from "three";
import { Component } from "../../ecs/Component";

type ThirdPersonCameraParams = {
  camera: PerspectiveCamera;
};

export class ThirdPersonCamera extends Component {
  private _currentPosition?: Vector3;
  private _currentLookAt?: Vector3;
  constructor(private _params: ThirdPersonCameraParams) {
    super();
  }

  onAddEntity(): void {
    this._currentPosition = new Vector3();
    this._currentLookAt = new Vector3();
  }

  onUpdate(timeElapsed: number, slerpFactor: number): void {
    const idealOffset = this._calcIdeal(new Vector3(-15, 20, -30));
    const idealLookat = this._calcIdeal(new Vector3(0, 10, 50));

    this._currentPosition?.lerp(idealOffset, slerpFactor);
    this._currentLookAt?.lerp(idealLookat, slerpFactor);

    if (this._currentPosition) {
      this._params.camera.position.copy(this._currentPosition);
    }
    if (this._currentLookAt) {
      this._params.camera.lookAt(this._currentLookAt);
    }
  }

  private _calcIdeal(initVec: Vector3): Vector3 {
    const ideal = initVec;
    if (this.entity?.quaternion) {
      ideal.applyQuaternion(this.entity.quaternion);
    }
    if (this.entity?.position) {
      ideal.add(this.entity?.position);
    }

    return ideal;
  }
}
