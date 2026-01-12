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
      // Camera chất lượng cao nhất
      maxTrack: 1,
      videoSettings: {
        width: { ideal: 2560, min: 1920 },
        height: { ideal: 1440, min: 1080 },
        facingMode: "environment",
      },
    });
    mindarRef.current = mindar;

    const { renderer, scene, camera } = mindar;

    // Renderer settings - không quá sáng
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(window.devicePixelRatio);

    const anchor = mindar.addAnchor(0);

    // Lighting vừa phải
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    // === EFFECTS ===
    const centerPosition = new THREE.Vector3(0, 0, 0);

    // 1. Text chúc mừng
    const congratText = new CongratulationText();
    congratText.create();
    anchor.group.add(congratText.getGroup());

    // 2. Pháo hoa
    const fireworks = new Fireworks();
    anchor.group.add(fireworks.getGroup());

    // Raycaster để detect touch trên banner
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onTap = (event: TouchEvent | MouseEvent) => {
      event.preventDefault();

      const rect = containerRef.current!.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ("touches" in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(
        congratText.getGroup().children,
        true
      );

      if (intersects.length > 0) {
        // Chạm vào banner -> bắn pháo hoa
        fireworks.launchSequence(centerPosition);
      }
    };

    containerRef.current.addEventListener("touchstart", onTap);
    containerRef.current.addEventListener("click", onTap);

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
      containerRef.current?.removeEventListener("touchstart", onTap);
      containerRef.current?.removeEventListener("click", onTap);
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
