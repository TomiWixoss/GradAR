import * as THREE from "three";

export class CongratulationText {
  private group: THREE.Group;
  private bannerMesh: THREE.Mesh | null = null;
  private animationTime = 0;

  constructor() {
    this.group = new THREE.Group();
  }

  getGroup(): THREE.Group {
    return this.group;
  }

  create() {
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.onload = () => {
      this.createBanner(logoImg);
    };
    logoImg.src = "/logotvu.png";
  }

  private createBanner(logoImg: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 180;
    const ctx = canvas.getContext("2d")!;

    // Background đỏ đậm
    ctx.fillStyle = "#5A0000";
    ctx.fillRect(0, 0, 700, 180);

    // Viền vàng
    ctx.strokeStyle = "#C9A227";
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 684, 164);

    // Logo bên trái
    const logoSize = 65;
    const logoX = 25;
    const logoY = (180 - logoSize) / 2;
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

    // Text area
    const textCenterX = 400;

    // Tên trường
    ctx.textAlign = "center";
    ctx.fillStyle = "#C9A227";
    ctx.font = "600 18px 'Times New Roman', serif";
    ctx.fillText("TRƯỜNG ĐẠI HỌC TRÀ VINH", textCenterX, 42);

    // Đường kẻ
    ctx.strokeStyle = "#C9A227";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, 55);
    ctx.lineTo(650, 55);
    ctx.stroke();

    // Chúc mừng tốt nghiệp
    ctx.fillStyle = "#F0D060";
    ctx.font = "bold 32px 'Times New Roman', serif";
    ctx.fillText("CHÚC MỪNG TỐT NGHIỆP", textCenterX, 100);

    // Đường kẻ dưới
    ctx.beginPath();
    ctx.moveTo(150, 115);
    ctx.lineTo(650, 115);
    ctx.stroke();

    // Lời chúc
    ctx.fillStyle = "#E0D0B0";
    ctx.font = "italic 16px 'Times New Roman', serif";
    ctx.fillText(
      "Chúc bạn thành công trên hành trình phía trước",
      textCenterX,
      150
    );

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const geometry = new THREE.PlaneGeometry(0.95, 0.24);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.bannerMesh = new THREE.Mesh(geometry, material);
    this.bannerMesh.position.set(0, 0.45, 0.05);
    this.group.add(this.bannerMesh);
  }

  update(deltaTime: number) {
    this.animationTime += deltaTime;

    if (this.bannerMesh) {
      this.bannerMesh.position.y =
        0.45 + Math.sin(this.animationTime * 1.5) * 0.006;
    }
  }

  dispose() {
    if (this.bannerMesh) {
      this.group.remove(this.bannerMesh);
      this.bannerMesh.geometry.dispose();
      (this.bannerMesh.material as THREE.MeshBasicMaterial).dispose();
    }
  }
}
