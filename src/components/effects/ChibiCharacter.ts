import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class ChibiCharacter {
  private group: THREE.Group;
  private character: THREE.Object3D | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private jumpAction: THREE.AnimationAction | null = null;

  constructor() {
    this.group = new THREE.Group();
  }

  getGroup(): THREE.Group {
    return this.group;
  }

  load(position: THREE.Vector3): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        "/models/chibi_character.glb",
        (gltf) => {
          this.character = gltf.scene;
          this.character.scale.setScalar(0.05);

          // Xoay để nhân vật đứng trên mặt phẳng ảnh
          this.character.rotation.x = -Math.PI / 2;

          this.character.position.copy(position);
          this.character.position.z = 0.01;

          this.group.add(this.character);

          // Setup animation
          if (gltf.animations && gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.character);

            // Tìm animation "Jump 01"
            const jumpClip = gltf.animations.find(
              (clip) => clip.name === "Jump 01"
            );

            if (jumpClip) {
              this.jumpAction = this.mixer.clipAction(jumpClip);
              this.jumpAction.setLoop(THREE.LoopRepeat, Infinity);
              this.jumpAction.play();
            } else {
              // Nếu không tìm thấy, play animation đầu tiên
              const action = this.mixer.clipAction(gltf.animations[0]);
              action.setLoop(THREE.LoopRepeat, Infinity);
              action.play();
            }
          }

          resolve();
        },
        undefined,
        (error) => {
          console.error("Error loading chibi character:", error);
          reject(error);
        }
      );
    });
  }

  update(deltaTime: number) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  dispose() {
    if (this.character) {
      this.group.remove(this.character);
      this.character.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
  }
}
