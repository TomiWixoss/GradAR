import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import { Fireworks, CongratulationText } from "./effects";

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // === EFFECTS ===
    const centerPosition = new THREE.Vector3(0, 0, 0);

    // 1. Text chúc mừng
    const congratText = new CongratulationText();
    congratText.create("Chúc mừng Tân Cử nhân!");
    anchor.group.add(congratText.getGroup());

    // 2. Pháo hoa (three-nebula)
    const fireworks = new Fireworks();
    anchor.group.add(fireworks.getGroup());

    // Track target detection
    let hasLaunchedEffects = false;

    anchor.onTargetFound = () => {
      console.log("Target found!");
      if (!hasLaunchedEffects) {
        hasLaunchedEffects = true;
        fireworks.launchSequence(centerPosition);
      }
    };

    // Animation
    const animate = () => {
      congratText.update(0.016);
      fireworks.update();
      renderer.render(scene, camera);
    };

    const start = async () => {
      await mindar.start();
      renderer.setAnimationLoop(animate);
    };
    start();

    return () => {
      renderer.setAnimationLoop(null);
      congratText.dispose();
      fireworks.dispose();
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
