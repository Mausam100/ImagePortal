import React, { useRef, Suspense, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { shaderMaterial, useTexture } from "@react-three/drei";
import { Leva, useControls } from "leva";
import * as THREE from "three";
import { animate } from "motion";
import { useMotionValue } from "motion/react";
import vertexShader from "../shaders/imageReveal/vertex.glsl";
import fragmentShader from "../shaders/imageReveal/fragment.glsl";

// Array of image URLs
const IMAGES = [
  "./1st.jpg",
  "./2nd.jpg",
  "./3rd.jpg",
  
  
];

const ImageRevealMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(),
    uTime: 0,
    uProgress: 0,
    uImageRes: new THREE.Vector2(1.0, 1.0),
    uRes: new THREE.Vector2(1.0, 1.0),
    
  },
  vertexShader,
  fragmentShader,
  (self) => {
    self.transparent = true;
  }
);

extend({ ImageRevealMaterial });

const Scene = ({ revealProgress, currentImage, symbol }) => {
  const Imageref = useRef();

  // Load texture and update shader uniform
  const texture = useTexture(currentImage, (loadedTexture) => {
    if (Imageref.current) {
      Imageref.current.uTexture = loadedTexture;
    }
  });

  // Update uniforms during animation frames
  useFrame(({ clock }) => {
    if (Imageref.current) {
      Imageref.current.uTime = clock.elapsedTime;
      Imageref.current.uProgress = revealProgress.get();
      Imageref.current.uSymbolIndex = symbol; // Pass symbol index to shader
    }
  });

  return (
    <mesh>
      <planeGeometry args={[0.4, 0.6]} />
      <imageRevealMaterial ref={Imageref} />
    </mesh>
  );
};

const Home = () => {
  const [isRevealed, setIsRevealed] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const revealProgress = useMotionValue(1);

 

  const handleReveal = () => {
    if (isRevealed) {
      animate(revealProgress, 0, {
        duration: 1.5,
        ease: "easeInOut",
      });

      setTimeout(() => {
        const nextIndex = (currentImageIndex + 1) % IMAGES.length;
        setCurrentImageIndex(nextIndex);

        animate(revealProgress, 1, {
          duration: 1.5,
          ease: "easeInOut",
        });
      }, 1200);
    }

    setIsRevealed(!isRevealed);
  };

  return (
    <main className="relative h-full w-full">
      
      <Canvas className="bg-[#bdbdbd]" camera={{ fov: 10 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 0, 5]} />
        <Suspense fallback={null}>
          <Scene
            revealProgress={revealProgress}
            currentImage={IMAGES[currentImageIndex]}
            
          />
        </Suspense>
      </Canvas>
      <div className="flex items-center absolute z-50 bottom-7 left-1/2 -translate-x-1/2">
        <button
          onClick={handleReveal}
          className="px-4 py-2 bg-neutral-800 text-white text-sm rounded-md"
        >
          Next
        </button>
      </div>
    </main>
  );
};

export default Home;
