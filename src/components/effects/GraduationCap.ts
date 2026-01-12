import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class GraduationCap {
  private group: THREE.Group;
  private cap: THREE.Object3D | null = null;
  private animationTime = 0;
  private isThrown = false;
  private throwProgress = 0;
  private initialY = 0;
  private initialPosition = new THREE.Vector3();

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
        "/models/graduation_cap_with_textures.glb",
        (gltf) => {
          this.cap = gltf.scene;
          this.cap.scale.setScalar(0.06); // Nhỏ hơn
          this.cap.position.copy(position);
          this.cap.position.y = position.y - 0.1;
          this.initialY = this.cap.position.y;
          this.initialPosition.copy(this.cap.position);
          this.group.add(this.cap);
          resolve();
        },
        undefined,
        (error) => {
          console.error("Error loading graduation cap:", error);
          reject(error);
        }
      );
    });
  }

  // Ném mũ lên trời
  throwCap() {
    if (this.cap) {
      this.isThrown = true;
      this.throwProgress = 0;
    }
  }

  update(deltaTime: number) {
    if (!this.cap) return;

    this.animationTime += deltaTime;

    if (this.isThrown) {
      this.throwProgress += deltaTime * 1.2;

      if (this.throwProgress < 1) {
        // Bay lên
        const height = Math.sin(this.throwProgress * Math.PI) * 0.4;
        this.cap.position.y = this.initialY + height;
        this.cap.rotation.z += deltaTime * 10;
        this.cap.rotation.x += deltaTime * 5;
      } else if (this.throwProgress < 1.8) {
        // Rơi xuống về vị trí ban đầu
        const fallProgress = (this.throwProgress - 1) / 0.8;
        const height = (1 - fallProgress) * 0.15;
        this.cap.position.y = this.initialY + height;
        this.cap.position.x =
          this.initialPosition.x + (1 - fallProgress) * 0.05;
        this.cap.rotation.z *= 0.95;
        this.cap.rotation.x *= 0.95;
      } else {
        // Đã rơi xong, reset
        this.isThrown = false;
        this.cap.position.copy(this.initialPosition);
        this.cap.position.y = this.initialY;
        this.cap.rotation.set(0, 0, 0);
      }
    } else {
      // Idle - lơ lửng nhẹ và xoay
      this.cap.position.y =
        this.initialY + Math.sin(this.animationTime * 2) * 0.01;
      this.cap.rotation.y += deltaTime * 0.8;
    }
  }

  dispose() {
    if (this.cap) {
      this.group.remove(this.cap);
      this.cap.traverse((child) => {
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
  }
}
