import * as THREE from "three";

export class CongratulationText {
  private group: THREE.Group;
  private textMesh: THREE.Mesh | null = null;
  private animationTime = 0;

  constructor() {
    this.group = new THREE.Group();
  }

  getGroup(): THREE.Group {
    return this.group;
  }

  create(text: string = "Chúc mừng Tân Cử nhân!") {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1024, 0);
    gradient.addColorStop(0, "#8B0000");
    gradient.addColorStop(0.5, "#FF0000");
    gradient.addColorStop(1, "#8B0000");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 256);

    // Border
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 1004, 236);

    // Text shadow
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    // Main text
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 64px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 512, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const geometry = new THREE.PlaneGeometry(1.2, 0.3);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.textMesh = new THREE.Mesh(geometry, material);
    this.textMesh.position.set(0, 0.55, 0.05);
    this.group.add(this.textMesh);
  }

  update(deltaTime: number) {
    if (!this.textMesh) return;

    this.animationTime += deltaTime;

    // Floating animation
    this.textMesh.position.y = 0.55 + Math.sin(this.animationTime * 2) * 0.02;

    // Subtle scale pulse
    const scale = 1 + Math.sin(this.animationTime * 3) * 0.03;
    this.textMesh.scale.setScalar(scale);
  }

  dispose() {
    if (this.textMesh) {
      this.group.remove(this.textMesh);
      this.textMesh.geometry.dispose();
      (this.textMesh.material as THREE.MeshBasicMaterial).dispose();
    }
  }
}
