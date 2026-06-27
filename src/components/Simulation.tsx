import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Float, ContactShadows, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface CarProps {
  position: [number, number, number];
  speed: number;
  onPass: (energy: number, z: number) => void;
  color: string;
}

const Car = ({ position, speed, onPass, color }: CarProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const [lastPulse, setLastPulse] = useState(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.z += speed * delta;
      
      // Reset position for loop
      if (meshRef.current.position.z > 50) {
        meshRef.current.position.z = -50;
      }

      // Trigger energy pulse every 5 units
      const currentPos = meshRef.current.position.z;
      const pulseIndex = Math.floor(currentPos / 5);
      if (pulseIndex !== lastPulse) {
        setLastPulse(pulseIndex);
        onPass(Math.random() * 0.15 + 0.05, currentPos);
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Car Body */}
      <mesh castShadow>
        <boxGeometry args={[1.8, 0.8, 4]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.6, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.6, 2]} />
        <meshStandardMaterial color="#222" metalness={1} roughness={0} transparent opacity={0.7} />
      </mesh>
      {/* Wheels */}
      {[[-0.9, -0.3, 1.2], [0.9, -0.3, 1.2], [-0.9, -0.3, -1.2], [0.9, -0.3, -1.2]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
      {/* Headlights */}
      <pointLight position={[0.7, 0, 2.1]} intensity={2} color="#fff" distance={10} />
      <pointLight position={[-0.7, 0, 2.1]} intensity={2} color="#fff" distance={10} />
    </group>
  );
};

const EnergyPulse = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const target = new THREE.Vector3(15, 0, position[2]); // Move towards the side (battery)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Move towards battery
      meshRef.current.position.lerp(target, delta * 2);
      
      // Scale and fade
      meshRef.current.scale.x += delta;
      meshRef.current.scale.y += delta;
      
      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        meshRef.current.material.opacity -= delta * 1.2;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <meshStandardMaterial color="#2563EB" transparent opacity={0.8} emissive="#2563EB" emissiveIntensity={4} />
    </mesh>
  );
};

export interface SensorData {
  id: number;
  damage: number;
}

const Road = ({ sensors, selectedSensor, onSelectSensor }: { sensors: SensorData[], selectedSensor: number | null, onSelectSensor: (id: number) => void }) => {
  return (
    <group>
      {/* Main Road Surface */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 200]} />
        <meshStandardMaterial color="#1E293B" roughness={0.8} />
      </mesh>
      
      {/* Road Markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <planeGeometry args={[0.2, 200]} />
        <meshStandardMaterial color="#F8FAFC" opacity={0.5} transparent />
      </mesh>
      
      {/* Smart Modules Grid (10 columns x 100 rows) */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          if (e.object.userData.id !== undefined) {
            onSelectSensor(e.object.userData.id);
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
      >
        {sensors.map((sensor, i) => {
          const isSelected = selectedSensor === sensor.id;
          const isCritical = sensor.damage > 70;
          const isWarning = sensor.damage > 30 && !isCritical;
          
          const color = isSelected ? "#2563EB" : (isCritical ? "#ef4444" : (isWarning ? "#FACC15" : "#22C55E"));
          const opacity = isSelected ? 0.8 : (isCritical ? 0.4 : (isWarning ? 0.2 : 0.05));
          const emissiveIntensity = isSelected ? 2 : (isCritical ? 1 : 0);

          // Calculate grid position (10 columns, 100 rows)
          const col = i % 10;
          const row = Math.floor(i / 10);
          const x = (col * 2) - 9;
          const z = (row * 2) - 99;

          return (
            <mesh 
              key={sensor.id} 
              userData={{ id: sensor.id }}
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[x, -0.48, z]}
            >
              <planeGeometry args={[1.9, 1.9]} />
              <meshStandardMaterial 
                color={color} 
                opacity={opacity} 
                transparent 
                emissive={color} 
                emissiveIntensity={emissiveIntensity} 
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

const BatteryUnit = () => {
  return (
    <group position={[15, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[4, 8, 4]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0, 2.1]}>
        <planeGeometry args={[3, 6]} />
        <MeshDistortMaterial color="#2563EB" speed={2} distort={0.2} />
      </mesh>
      <pointLight position={[0, 0, 3]} intensity={5} color="#2563EB" distance={15} />
    </group>
  );
};

interface SimulationProps {
  isNight: boolean;
  onEnergyGenerated: (amount: number) => void;
  sensors: SensorData[];
  selectedSensor: number | null;
  onSelectSensor: (id: number | null) => void;
}

export const Simulation = ({ isNight, onEnergyGenerated, sensors, selectedSensor, onSelectSensor }: SimulationProps) => {
  const [pulses, setPulses] = useState<{ id: number; pos: [number, number, number] }[]>([]);
  
  const handlePass = (energy: number, pos: [number, number, number]) => {
    onEnergyGenerated(energy);
    const id = Date.now() + Math.random();
    setPulses(prev => [...prev.slice(-10), { id, pos }]);
    setTimeout(() => {
      setPulses(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  const cars = useMemo(() => [
    { pos: [-4, 0, -40], speed: 15, color: '#3b82f6' },
    { pos: [4, 0, -20], speed: 12, color: '#ef4444' },
    { pos: [-4, 0, 10], speed: 18, color: '#f59e0b' },
    { pos: [4, 0, 30], speed: 14, color: '#8b5cf6' },
  ], []);

  return (
    <div className="w-full h-screen">
      <Canvas shadows onPointerMissed={() => onSelectSensor(null)}>
        <PerspectiveCamera makeDefault position={[25, 15, 25]} fov={50} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={10} maxDistance={60} />
        
        {isNight ? (
          <>
            <color attach="background" args={['#0f172a']} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight intensity={0.1} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
          </>
        ) : (
          <>
            <color attach="background" args={['#F8FAFC']} />
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[50, 50, 25]}
              intensity={1.5}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
          </>
        )}

        <Road sensors={sensors} selectedSensor={selectedSensor} onSelectSensor={onSelectSensor} />
        <BatteryUnit />
        
        {cars.map((car, i) => (
          <Car 
            key={i} 
            position={car.pos as [number, number, number]} 
            speed={car.speed} 
            color={car.color}
            onPass={(energy, z) => handlePass(energy, [car.pos[0], -0.4, z])} 
          />
        ))}

        {pulses.map(pulse => (
          <EnergyPulse key={pulse.id} position={pulse.pos} />
        ))}

        <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={100} blur={2} far={10} />
      </Canvas>
    </div>
  );
};
