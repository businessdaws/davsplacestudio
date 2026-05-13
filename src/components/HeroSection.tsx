import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'motion/react';
import { ArrowRight, Play } from 'lucide-react';
import * as THREE from 'three';

function Particles({ count = 200 }) {
  const points = useRef<THREE.Points>(null!);
  
  const particlesPosition = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        points.current.geometry.attributes.position.array[i3 + 1] += Math.sin(time + points.current.geometry.attributes.position.array[i3]) * 0.002;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.rotation.y += 0.001;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#F5C518" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Particles count={300} />
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere args={[1, 100, 100]} scale={1.5} position={[3, 0, -2]}>
          <MeshDistortMaterial
            color="#F5C518"
            attach="material"
            distort={0.4}
            speed={1.5}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Float>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </>
  );
}

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full flex items-center overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 bg-bg-primary">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Scene />
        </Canvas>
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow text-xs font-bold mb-6 tracking-wider uppercase">
            <span className="w-2 h-2 bg-accent-yellow rounded-full animate-pulse" />
            Digital Creative Solution
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] mb-8 tracking-tighter">
            TRANSFORM YOUR <br />
            <span className="text-accent-yellow">DIGITAL VISION</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-text-secondary font-medium leading-relaxed mb-12 max-w-2xl">
            Platform bisnis digital untuk kreator & brand lokal Indonesia yang ingin tampil berkelas dan futuristik.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button className="w-full sm:w-auto px-8 py-4 bg-accent-yellow text-bg-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-accent-yellow-bright transition-all group scale-105">
              Mulai Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="w-full sm:w-auto px-8 py-4 bg-bg-secondary border border-border-subtle text-text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-bg-tertiary transition-all">
              <Play className="w-5 h-5 text-accent-yellow fill-accent-yellow" />
              Lihat Portofolio
            </button>
          </div>

          {/* Stats */}
          <div className="mt-20 flex flex-wrap gap-12 border-t border-border-subtle/50 pt-10">
            <div>
              <p className="text-3xl font-display font-black text-white">50+</p>
              <p className="text-xs text-text-secondary uppercase tracking-widest font-bold">Proyek Selesai</p>
            </div>
            <div>
              <p className="text-3xl font-display font-black text-white">30+</p>
              <p className="text-xs text-text-secondary uppercase tracking-widest font-bold">Klien Puas</p>
            </div>
            <div>
              <p className="text-3xl font-display font-black text-white">4</p>
              <p className="text-xs text-text-secondary uppercase tracking-widest font-bold">Layanan Utama</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-6 h-10 border-2 border-border-subtle rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-accent-yellow rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
