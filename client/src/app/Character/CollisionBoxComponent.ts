import { Box3, Box3Helper, Color, Object3D, Scene, Vector3 } from "three";
import { Topics } from "../../ecs/common";
import { Component } from "../../ecs/Component";

export class CollisionBoxComponent extends Component {
  public box?: Box3;
  public helper?: Box3Helper;
  constructor(private _params: { target: Object3D; scene?: Scene }) {
    super();
  }

  onAddComponent(): void {
    this.box = new Box3();
    this.box.setFromObject(this._params.target);
    if (this._params.scene) {
      this.helper = new Box3Helper(this.box, new Color(0x00ff00));
      this._params.scene.add(this.helper);
    }
    this.registerHandler(Topics.updatePosition, () => {
      this.box?.setFromObject(this._params.target);
    });
    this.registerHandler(Topics.updateRotation, () =>
      this.box?.setFromObject(this._params.target)
    );
  }
}
