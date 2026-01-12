declare module "mind-ar/dist/mindar-image-three.prod.js" {
  import * as THREE from "three";

  interface MindARThreeOptions {
    container: HTMLElement;
    imageTargetSrc: string;
    maxTrack?: number;
    filterMinCF?: number;
    filterBeta?: number;
    warmupTolerance?: number;
    missTolerance?: number;
    uiLoading?: string;
    uiScanning?: string;
    uiError?: string;
  }

  interface Anchor {
    group: THREE.Group;
    onTargetFound?: () => void;
    onTargetLost?: () => void;
  }

  export class MindARThree {
    constructor(options: MindARThreeOptions);
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    addAnchor(targetIndex: number): Anchor;
    start(): Promise<void>;
    stop(): void;
  }
}
