import {
  AmbientLight,
  BoxGeometry,
  HemisphereLight,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PointLight,
  Scene,
  sRGBEncoding,
  Vector2,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Component } from "../ecs/Component";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import RenderPixelatedPass from "./PixelPass";

export class ThreeController extends Component {
  renderer: WebGLRenderer | undefined;
  camera: PerspectiveCamera | undefined;
  scene: Scene | undefined;
  ground: Mesh | undefined;
  controls: OrbitControls | undefined;
  composer: EffectComposer | undefined;

  physics?: any;
  objects: any[];

  wrapperElement: HTMLElement;

  constructor(mountToElement: HTMLElement, physics?: any) {
    super();

    this.physics = physics;
    this.wrapperElement = mountToElement;
    this.objects = [];
  }

  onAddEntity(): void {
    this._initThree();
  }

  private _initThree() {
    console.log("init");

    console.log(this.physics);

    //RENDERER
    this.renderer = new WebGLRenderer({ antialias: false });
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.id = "three";

    this.wrapperElement.appendChild(this.renderer.domElement);

    //CAMERA
    const fov = 90;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 10000.0;

    this.camera = new PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(50, 50, 50);

    //this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    //SCENE
    this.scene = new Scene();

    //LIGHTS
    const light = new PointLight(0x8088b3, 1);
    light.position.set(0, 100, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 10000.0;

    const ambientLight = new AmbientLight(0xffffff, 0.2);

    const hemiLight = new HemisphereLight(0xffffff, 0x444444, 0.8);
    hemiLight.position.set(0, 20, 0);

    this.scene.add(ambientLight);
    this.scene.add(hemiLight);
    this.scene.add(light);

    //GROUND
    this.ground = new Mesh(
      new BoxGeometry(1000, 1, 1000),
      new MeshPhongMaterial({ color: "#ff9100", depthWrite: false })
    );
    //this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
    this.physics?.addMesh(this.ground);

    //BOXES
    /*const boxGeo = new BoxGeometry(50, 50, 50);
    const boxMat = new MeshPhongMaterial({
      color: "#ff0000",
      depthWrite: false,
    });
    for (let i = 0; i < 5; i++) {
      const box = new Mesh(boxGeo, boxMat);
      box.receiveShadow = true;
      box.castShadow = true;
      box.position.set(Math.floor(Math.random() * 100), 25, i * 50 * 2);
      this.addObject(box);
    }*/

    //EFFECT
    this.composer = new EffectComposer(this.renderer);
    let renderResolution = new Vector2(
      window.innerWidth,
      window.innerHeight
    ).divideScalar(2.0);

    this.composer.addPass(
      new RenderPixelatedPass(renderResolution, this.scene, this.camera)
    );

    window.addEventListener("resize", this._onResize);
  }

  private _onResize() {
    this.composer?.setSize(window.innerWidth, window.innerHeight);
  }

  addObject(object: Object3D) {
    this.scene?.add(object);
    this.physics?.addMesh(object, 1);
  }

  onUpdate(timeElapsed: number): void {
    if (this.renderer && this.scene && this.camera) {
      this.controls?.update();
      this.composer?.render();
      //this.renderer?.render(this.scene, this.camera);
    }
  }
}
