import { Object3D, Vector3 } from "three";
import { getRandomArbitrary } from "./math";

export function spawnAtRandom(
  amount: number,
  radius: number,
  scaleRange: [number, number],
  object: Object3D,
  spawner: (object: Object3D) => void
): void {
  for (let i = 0; i < amount; i++) {
    const clone = object.clone();
    clone.position.set(
      getRandomArbitrary(-radius, radius),
      0,
      getRandomArbitrary(-radius, radius)
    );
    clone.rotateY(Math.PI / getRandomArbitrary(1.0, 4.0));
    clone.scale.setScalar(getRandomArbitrary(scaleRange[0], scaleRange[1]));
    spawner(clone);
  }
}
