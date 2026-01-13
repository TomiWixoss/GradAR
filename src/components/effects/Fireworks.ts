import * as THREE from "three";

interface Particle {
  sprite: THREE.Sprite;
  vx: number;
  vy: number;
  vz: number;
  life: number;
}

export class Fireworks {
  private group: THREE.Group;
  private particles: Particle[] = [];
  private texture: THREE.CanvasTexture;

  constructor() {
    this.group = new THREE.Group();
    this.texture = this.createTexture();
  }

  getGroup(): THREE.Group {
    return this.group;
  }

  // Texture nhỏ, sáng, mờ dần ra ngoài
  private createTexture(): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d")!;

    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.1, "rgba(255,255,255,0.8)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.3)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);

    return new THREE.CanvasTexture(canvas);
  }

  private createMaterial(color: number): THREE.SpriteMaterial {
    return new THREE.SpriteMaterial({
      map: this.texture,
      color: color,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }

  launch(startPosition: THREE.Vector3, color: number) {
    const targetZ = startPosition.z + 0.45 + Math.random() * 0.15;

    // Rocket nhỏ bay lên (theo trục Z = vuông góc với ảnh)
    const rocket = new THREE.Sprite(this.createMaterial(0xffffaa));
    rocket.scale.setScalar(0.025);
    rocket.position.copy(startPosition);
    this.group.add(rocket);

    let currentZ = startPosition.z;
    const flyUp = () => {
      currentZ += 0.015;
      rocket.position.z = currentZ;

      // Trail nhỏ
      const trail = new THREE.Sprite(this.createMaterial(0xffaa44));
      trail.scale.setScalar(0.015);
      trail.position.set(
        rocket.position.x + (Math.random() - 0.5) * 0.005,
        rocket.position.y,
        rocket.position.z - 0.01
      );
      this.group.add(trail);
      this.particles.push({
        sprite: trail,
        vx: 0,
        vy: 0,
        vz: -0.001,
        life: 0.3,
      });

      if (currentZ >= targetZ) {
        this.group.remove(rocket);
        rocket.material.dispose();
        this.explode(
          new THREE.Vector3(startPosition.x, startPosition.y, targetZ),
          color
        );
      } else {
        requestAnimationFrame(flyUp);
      }
    };
    requestAnimationFrame(flyUp);
  }

  private explode(position: THREE.Vector3, color: number) {
    // Rất nhiều hạt nhỏ li ti
    const numParticles = 150;

    for (let i = 0; i < numParticles; i++) {
      // Phân bố đều trên hình cầu
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      // Tốc độ có chút random để tự nhiên hơn
      const baseSpeed = 0.015;
      const speed = baseSpeed + Math.random() * 0.008;

      const sprite = new THREE.Sprite(this.createMaterial(color));
      // Hạt vừa phải
      sprite.scale.setScalar(0.012 + Math.random() * 0.008);
      sprite.position.copy(position);
      this.group.add(sprite);

      this.particles.push({
        sprite,
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: Math.sin(phi) * Math.sin(theta) * speed,
        vz: Math.cos(phi) * speed * 0.5,
        life: 0.8 + Math.random() * 0.6,
      });
    }

    // Thêm vài hạt sáng hơn ở giữa
    for (let i = 0; i < 20; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.008 + Math.random() * 0.005;

      const sprite = new THREE.Sprite(this.createMaterial(0xffffff));
      sprite.scale.setScalar(0.018);
      sprite.position.copy(position);
      this.group.add(sprite);

      this.particles.push({
        sprite,
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: Math.sin(phi) * Math.sin(theta) * speed,
        vz: Math.cos(phi) * speed * 0.5,
        life: 0.5 + Math.random() * 0.3,
      });
    }
  }

  launchSequence(centerPosition: THREE.Vector3) {
    const colors = [0xff3333, 0xffdd33, 0x33ff66, 0x33ddff, 0xff33ff, 0xff8833];

    // Bắn từ dưới ảnh (y âm = phía dưới)
    const launches = [
      { x: 0, y: -0.4, delay: 0 },
      { x: -0.18, y: -0.45, delay: 400 },
      { x: 0.18, y: -0.45, delay: 800 },
      { x: -0.08, y: -0.42, delay: 1200 },
      { x: 0.08, y: -0.42, delay: 1600 },
      { x: 0, y: -0.4, delay: 2000 },
    ];

    launches.forEach(({ x, y, delay }, i) => {
      setTimeout(() => {
        this.launch(
          new THREE.Vector3(
            centerPosition.x + x,
            centerPosition.y + y,
            0.01 // Bắt đầu từ mặt ảnh
          ),
          colors[i % colors.length]
        );
      }, delay);
    });
  }

  update() {
    const gravity = 0.0005;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.sprite.position.x += p.vx;
      p.sprite.position.y += p.vy;
      p.sprite.position.z += p.vz;

      // Gravity kéo xuống (theo trục Z)
      p.vz -= gravity;

      // Drag - chậm dần
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.vz *= 0.98;

      p.life -= 0.018;

      // Fade out
      const alpha = Math.max(0, p.life);
      (p.sprite.material as THREE.SpriteMaterial).opacity = alpha;

      // Thu nhỏ dần
      const currentScale = p.sprite.scale.x;
      p.sprite.scale.setScalar(currentScale * 0.995);

      if (p.life <= 0) {
        this.group.remove(p.sprite);
        p.sprite.material.dispose();
        this.particles.splice(i, 1);
      }
    }
  }

  dispose() {
    this.particles.forEach((p) => {
      this.group.remove(p.sprite);
      p.sprite.material.dispose();
    });
    this.particles = [];
    this.texture.dispose();
  }
}
