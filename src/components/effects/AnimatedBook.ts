import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class AnimatedBook {
  private group: THREE.Group;
  private book: THREE.Object3D | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private animationTime = 0;

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
        "/models/animated_book.glb",
        (gltf) => {
          this.book = gltf.scene;
          this.book.scale.setScalar(0.1);
          this.book.position.copy(position);
          this.book.position.z = 0.05;

          this.group.add(this.book);

          // Setup animation mixer
          if (gltf.animations && gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.book);

            // Play all animations
            gltf.animations.forEach((clip) => {
              const action = this.mixer!.clipAction(clip);
              action.play();
            });
          }

          resolve();
        },
        undefined,
        (error) => {
          console.error("Error loading animated book:", error);
          reject(error);
        }
      );
    });
  }

  update(deltaTime: number) {
    if (!this.book) return;

    this.animationTime += deltaTime;

    // Update animation mixer
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }

    // Gentle floating effect
    this.book.position.z = 0.05 + Math.sin(this.animationTime * 2) * 0.008;
  }

  dispose() {
    if (this.book) {
      this.group.remove(this.book);
      this.book.traverse((child) => {
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
