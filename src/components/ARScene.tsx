import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import { CongratulationText, ChibiCharacter } from "./effects";
import { motion, AnimatePresence } from "framer-motion";

interface ARSceneProps {
  targetSrc: string;
}

export default function ARScene({ targetSrc }: ARSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mindarRef = useRef<MindARThree | null>(null);
  const [targetFound, setTargetFound] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    chibiCharacter.load(centerPosition).then(() => {
      setIsLoading(false);
    });
    anchor.group.add(chibiCharacter.getGroup());

    anchor.onTargetFound = () => {
      console.log("Target found!");
      setTargetFound(true);
      // Phát nhạc khi thấy target
      audio.play().catch(() => {});
    };

    anchor.onTargetLost = () => {
      setTargetFound(false);
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
    <>
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
      <AnimatePresence>
        {!targetFound && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0
            }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ 
              opacity: { duration: 0.3 },
              y: { duration: 0.3 }
            }}
            onClick={() => setExpanded(!expanded)}
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              x: "-50%",
              borderRadius: "24px",
              fontSize: "12px",
              zIndex: 1000,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <motion.div
              className="gradient-border-tooltip"
              animate={{
                padding: expanded ? "12px 20px" : "8px 24px",
                width: expanded ? "300px" : "180px",
              }}
              transition={{ 
                width: { duration: 0.3, ease: "easeInOut" },
                padding: { duration: 0.3, ease: "easeInOut" }
              }}
            >
              {/* Content */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <span style={{ fontWeight: "500" }}>
                    {expanded ? "Hướng dẫn quét AR" : "Quét tấm bằng"}
                  </span>
                  {/* Status dot */}
                  <div
                    style={{
                      position: "absolute",
                      right: "16px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: isLoading ? "#ef5350" : "#66bb6a",
                      boxShadow: isLoading ? "0 0 6px #ef5350" : "0 0 6px #66bb6a",
                    }}
                  />
                </div>
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ 
                        height: { duration: 0.3, ease: "easeInOut", delay: 0.3 },
                        opacity: { duration: 0.2, delay: 0.5 }
                      }}
                      style={{ 
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ 
                        marginTop: "12px", 
                        paddingTop: "12px", 
                        borderTop: "2px solid rgba(255,255,255,0.5)",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        color: "rgba(255, 255, 255, 0.85)"
                      }}>
                        <p style={{ margin: "0 0 8px 0" }}>
                          • Hướng camera vào tấm bằng tốt nghiệp
                        </p>
                        <p style={{ margin: "0 0 8px 0" }}>
                          • Giữ camera ổn định và đủ ánh sáng
                        </p>
                        <p style={{ margin: "0" }}>
                          • Hiệu ứng AR sẽ xuất hiện tự động
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
