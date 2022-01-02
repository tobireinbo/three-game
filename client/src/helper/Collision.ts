import { Mesh } from "three";

export default class Collision {
  static detectCollisionCubes(object1: Mesh, object2: Mesh): boolean {
    object1.geometry.computeBoundingBox(); //not needed if its already calculated
    object2.geometry.computeBoundingBox();
    object1.updateMatrixWorld();
    object2.updateMatrixWorld();

    if (object1.geometry.boundingBox && object2.geometry.boundingBox) {
      let box1 = object1.geometry.boundingBox.clone();
      box1.applyMatrix4(object1.matrixWorld);
      let box2 = object2.geometry.boundingBox.clone();
      box2.applyMatrix4(object2.matrixWorld);

      return box1.intersectsBox(box2);
    }

    return false;
  }
}
