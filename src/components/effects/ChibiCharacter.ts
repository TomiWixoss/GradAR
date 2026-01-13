import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

export class ChibiCharacter {
  private group: THREE.Group;
  private character: THREE.Object3D | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private characterHeight = 0;

  constructor() {
    this.group = new THREE.Group();
  }

  getGroup(): THREE.Group {
    return this.group;
  }

  getHeadPosition(): THREE.Vector3 | null {
    if (!this.character || this.characterHeight === 0) return null;

    // Vị trí trên đầu nhân vật
    const pos = new THREE.Vector3(0, 0, 0);
    pos.z = this.characterHeight + 1.0;
    return pos;
  }

  load(position: THREE.Vector3): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = new FBXLoader();
      loader.load(
        "/models/dancing_character.fbx",
        (fbx) => {
          this.character = fbx;
          // FBX từ Mixamo thường rất to, scale nhỏ lại
          this.character.scale.setScalar(0.005);

          // Xoay để nhân vật đứng đúng hướng trên mặt phẳng ảnh
          this.character.rotation.x = -Math.PI / 2;
          this.character.rotation.y = Math.PI;
          this.character.rotation.z = Math.PI;

          this.character.position.copy(position);
          this.character.position.z = 0.01;

          // Tính chiều cao nhân vật
          const box = new THREE.Box3().setFromObject(this.character);
          this.characterHeight = box.max.z - box.min.z;

          this.group.add(this.character);

          // Setup animation từ FBX
          if (fbx.animations && fbx.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.character);
            const action = this.mixer.clipAction(fbx.animations[0]);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.play();
          }

          resolve();
        },
        undefined,
        (error) => {
          console.error("Error loading dancing character:", error);
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
