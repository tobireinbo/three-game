import { Box3, Object3D, Quaternion, Scene, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Topics } from "../../common";
import { Component } from "../../Component";

export type GLTFComponentParams = {
  path: string;
  file: string;
  scale: number;
  scene: Scene;
  offset: Vector3;
};

export class GLTFComponent extends Component {
  private _params: GLTFComponentParams;
  private _object: Object3D | undefined;

  constructor(params: GLTFComponentParams) {
    super();
    this._params = params;
  }

  onAddComponent(): void {
    this._loadModel();
    this.registerHandler(Topics.updatePosition, (value: Vector3) =>
      this._object?.position.copy(value)
    );
    this.registerHandler(Topics.updateRotation, (value: Quaternion) =>
      this._object?.quaternion.copy(value)
    );
  }

  get object() {
    return this._object;
  }

  private _loadModel() {
    const loader = new GLTFLoader();
    loader.setPath(this._params.path);
    loader.load(this._params.file, (gltf) => {
      this._object = gltf.scene;
      this._object.traverse(function (object: any) {
        if (object.isMesh) object.castShadow = true;
      });
      //this._object.scale.setScalar(this._params.scale);
      this._centerObject();
      //this._object.position.add(this._params.offset);
      this._params.scene.add(this._object);
      console.log("gltf obj", this._object);
      //this.entity?.position && this.entity.position.copy(this._object.position);

      this.fireHandlers({ topic: Topics.modelLoaded, value: this._object });
    });
  }

  private _centerObject() {
    const object = this._object;
    if (object) {
      const box = new Box3().setFromObject(object);

      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z);

      console.log(maxAxis);

      object.scale.multiplyScalar(1.0 / maxAxis);

      object.position.copy(center).multiplyScalar(-1);
      object.position.y -= size.y * 0.5;

      console.log(object.position);

      //object.position.set(-center.x, size.y / 2 - center.y, -center.z);
    }
  }
}
