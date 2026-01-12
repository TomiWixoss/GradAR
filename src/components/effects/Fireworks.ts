import * as THREE from "three";

interface Particle {
  sprite: THREE.Sprite;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

export class Fireworks {
  private group: THREE.Group;
  private particles: Particle[] = [];
  private texture: THREE.CanvasTexture;
  private materials: Map<number, THREE.SpriteMaterial> = new Map();

  constructor() {
    this.group = new THREE.Group();
    this.texture = this.createTexture();
  }

  getGroup(): THREE.Group {
    return this.group;
  }

  private createTexture(): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.4, "#ffffff");
    gradient.addColorStop(1, "transparent");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  private getMaterial(color: number): THREE.SpriteMaterial {
    if (!this.materials.has(color)) {
      this.materials.set(
        color,
        new THREE.SpriteMaterial({
          map: this.texture,
          color: color,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
    }
    return this.materials.get(color)!.clone();
  }

  launch(startPosition: THREE.Vector3, color: number) {
    const targetY = startPosition.y + 0.35 + Math.random() * 0.1;

    // Rocket bay lên
    const rocket = new THREE.Sprite(this.getMaterial(0xffff00));
    rocket.scale.setScalar(0.02);
    rocket.position.copy(startPosition);
    this.group.add(rocket);

    let currentY = startPosition.y;
    const flyUp = () => {
      currentY += 0.012;
      rocket.position.y = currentY;

      if (currentY >= targetY) {
        this.group.remove(rocket);
        this.explode(
          new THREE.Vector3(startPosition.x, targetY, startPosition.z),
          color
        );
      } else {
        requestAnimationFrame(flyUp);
      }
    };
    requestAnimationFrame(flyUp);
  }

  private explode(position: THREE.Vector3, color: number) {
    const numParticles = 25; // Giảm số particles

    for (let i = 0; i < numParticles; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.006 + Math.random() * 0.004;

      const sprite = new THREE.Sprite(
        this.getMaterial(i < 3 ? 0xffffff : color)
      );
      sprite.scale.setScalar(i < 3 ? 0.015 : 0.01);
      sprite.position.copy(position);
      this.group.add(sprite);

      this.particles.push({
        sprite,
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: Math.sin(phi) * Math.sin(theta) * speed,
        vz: Math.cos(phi) * speed,
        life: 1,
        maxLife: 1,
      });
    }
  }

  launchSequence(centerPosition: THREE.Vector3) {
    const colors = [0xff0000, 0xffd700, 0x00ff00, 0x00ffff, 0xff00ff];

    [0, 700, 1400, 2100, 2800].forEach((delay, i) => {
      setTimeout(() => {
        const x = (i % 2 === 0 ? 1 : -1) * (i * 0.05);
        this.launch(
          new THREE.Vector3(
            centerPosition.x + x,
            centerPosition.y - 0.3,
            centerPosition.z
          ),
          colors[i]
        );
      }, delay);
    });
  }

  update() {
    const gravity = 0.0002;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.sprite.position.x += p.vx;
      p.sprite.position.y += p.vy;
      p.sprite.position.z += p.vz;
      p.vy -= gravity;

      p.life -= 0.015;
      (p.sprite.material as THREE.SpriteMaterial).opacity = Math.max(0, p.life);
      p.sprite.scale.multiplyScalar(0.99);

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
    this.materials.forEach((m) => m.dispose());
  }
}
