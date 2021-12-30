export type KeyableObject<T = any> = {
  [key: string]: T;
};

//Event Message Type
export type Message = {
  topic: string;
  value: any;
};

export type Handler = (value: any) => void;

export enum Topics {
  modelLoaded = "model.loaded",
  animationLoaded = "animation.loaded",
  updatePosition = "update.position",
  updateRotation = "update.rotation",
  keyUp = "key.up",
  keyDown = "key.down",
}
