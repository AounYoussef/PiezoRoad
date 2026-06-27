import React, { useState, useCallback, useEffect } from 'react';
import { Simulation, SensorData } from './components/Simulation';
import { UI } from './components/UI';

export default function App() {
  const [energy, setEnergy] = useState(0);
  const [isNight, setIsNight] = useState(true);
  
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<number | null>(null);

  useEffect(() => {
    // Initialize sensors with random damage percentages (10x100 grid = 1000 sensors)
    setSensors(Array.from({ length: 1000 }).map((_, i) => ({
      id: i,
      damage: Math.floor(Math.random() * 100)
    })));
  }, []);

  const handleEnergyGenerated = useCallback((amount: number) => {
    setEnergy(prev => prev + amount);
  }, []);

  const co2Offset = energy * 0.4;
  const selectedSensorData = selectedSensor !== null ? sensors.find(s => s.id === selectedSensor) || null : null;

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#1E293B]">
      <Simulation 
        isNight={isNight} 
        onEnergyGenerated={handleEnergyGenerated} 
        sensors={sensors}
        selectedSensor={selectedSensor}
        onSelectSensor={setSelectedSensor}
      />
      <UI 
        energy={energy} 
        co2={co2Offset} 
        isNight={isNight} 
        toggleNight={() => setIsNight(!isNight)} 
        selectedSensorData={selectedSensorData}
        onCloseSensor={() => setSelectedSensor(null)}
      />
    </main>
  );
}
