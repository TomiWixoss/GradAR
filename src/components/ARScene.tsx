import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";

interface ARSceneProps {
  targetSrc: string;
}

export default function ARScene({ targetSrc }: ARSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mindarRef = useRef<MindARThree | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const mindar = new MindARThree({
      container: containerRef.current,
      imageTargetSrc: targetSrc,
      filterMinCF: 0.0001,
      filterBeta: 0.001,
      warmupTolerance: 3,
      missTolerance: 10,
      uiLoading: "no",
      uiScanning: "no",
      uiError: "no",
    });
    mindarRef.current = mindar;

    const { renderer, scene, camera } = mindar;
    const anchor = mindar.addAnchor(0);

    // Lighting
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(light);

    // Text plane - "Chúc mừng Tân Cử nhân"
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = "#8B0000";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Chúc mừng Tân Cử nhân", 256, 75);

    const textTexture = new THREE.CanvasTexture(canvas);
    const textGeometry = new THREE.PlaneGeometry(1, 0.25);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 0.5, 0);
    anchor.group.add(textMesh);

    // Placeholder cube (thay bằng 3D model sau)
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, 0.1);
    anchor.group.add(cube);

    // Animation loop
    const animate = () => {
      cube.rotation.y += 0.02;
      renderer.render(scene, camera);
    };

    const start = async () => {
      await mindar.start();
      renderer.setAnimationLoop(animate);
    };
    start();

    return () => {
      renderer.setAnimationLoop(null);
      if (mindarRef.current) {
        try {
          mindarRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [targetSrc]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden",
      }}
    />
  );
}
