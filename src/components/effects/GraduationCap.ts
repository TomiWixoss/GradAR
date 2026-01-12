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
  private baseRotation = new THREE.Euler();

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
          this.cap.scale.setScalar(0.06);

          // Rotation để mũ nằm đúng hướng (mặt phẳng song song với bằng)
          this.cap.rotation.x = 0;
          this.cap.rotation.y = 0;
          this.cap.rotation.z = 0;
          this.baseRotation.copy(this.cap.rotation);

          this.cap.position.copy(position);
          this.cap.position.z = 0.05; // Nổi lên trên bằng một chút
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

  throwCap() {
    if (this.cap && !this.isThrown) {
      this.isThrown = true;
      this.throwProgress = 0;
    }
  }

  update(deltaTime: number) {
    if (!this.cap) return;

    this.animationTime += deltaTime;

    if (this.isThrown) {
      this.throwProgress += deltaTime * 1.5;

      if (this.throwProgress < 1) {
        // Bay lên (theo trục Z của neo = vuông góc với mặt bằng)
        const height = Math.sin(this.throwProgress * Math.PI) * 0.3;
        this.cap.position.z = 0.05 + height;
        // Xoay nhẹ khi bay
        this.cap.rotation.z = this.throwProgress * Math.PI * 4;
      } else if (this.throwProgress < 1.5) {
        // Rơi xuống
        const fallProgress = (this.throwProgress - 1) / 0.5;
        const height = (1 - fallProgress) * 0.1;
        this.cap.position.z = 0.05 + height;
        this.cap.rotation.z *= 0.9;
      } else {
        // Reset
        this.isThrown = false;
        this.cap.position.copy(this.initialPosition);
        this.cap.position.z = 0.05;
        this.cap.rotation.copy(this.baseRotation);
      }
    } else {
      // Idle - chỉ lơ lửng nhẹ, KHÔNG xoay
      this.cap.position.z = 0.05 + Math.sin(this.animationTime * 2) * 0.008;
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
