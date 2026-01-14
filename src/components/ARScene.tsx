import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import { CongratulationText, ChibiCharacter } from "./effects";

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
      // Giảm rung, mượt hơn
      filterMinCF: 0.001, // Tăng lên để ổn định hơn
      filterBeta: 0.01, // Tăng lên để phản hồi nhanh hơn khi di chuyển
      warmupTolerance: 5, // Cho phép nhiều frame warmup hơn
      missTolerance: 5, // Giữ tracking lâu hơn khi mất target tạm thời
      uiLoading: "no",
      uiScanning: "no",
      uiError: "no",
      maxTrack: 1,
    });
    mindarRef.current = mindar;

    const { renderer, scene, camera } = mindar;

    // Renderer settings - không quá sáng
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(window.devicePixelRatio);

    const anchor = mindar.addAnchor(0);

    // Lighting vừa phải
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // Thêm directional light để nhân vật sáng hơn
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(0, 1, 2);
    scene.add(directionalLight);

    // === EFFECTS ===
    const centerPosition = new THREE.Vector3(0, 0, 0);

    // Audio celebration
    const audio = new Audio(`${import.meta.env.BASE_URL}audio/celebration.mp3`);
    audio.loop = true;
    audio.volume = 0.5;

    // 1. Text chúc mừng
    const congratText = new CongratulationText();
    congratText.create();
    anchor.group.add(congratText.getGroup());

    // 2. Nhân vật 3D nhảy nhót
    const chibiCharacter = new ChibiCharacter();
    chibiCharacter.load(centerPosition);
    anchor.group.add(chibiCharacter.getGroup());

    anchor.onTargetFound = () => {
      console.log("Target found!");
      // Phát nhạc khi thấy target
      audio.play().catch(() => {});
    };

    anchor.onTargetLost = () => {
      // Tạm dừng nhạc khi mất target
      audio.pause();
    };

    // Animation
    let bannerInitialized = false;

    const animate = () => {
      // Cập nhật vị trí banner theo đầu nhân vật
      if (!bannerInitialized) {
        const headPos = chibiCharacter.getHeadPosition();
        if (headPos) {
          congratText.setPosition(headPos);
          bannerInitialized = true;
        }
      }

      congratText.update(0.016);
      chibiCharacter.update(0.016);
      renderer.render(scene, camera);
    };

    const start = async () => {
      await mindar.start();
      renderer.setAnimationLoop(animate);
    };
    start();

    return () => {
      renderer.setAnimationLoop(null);
      audio.pause();
      audio.src = "";
      congratText.dispose();
      chibiCharacter.dispose();
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
