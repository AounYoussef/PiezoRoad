import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Leaf, Moon, Sun, ArrowLeft, Activity, X } from 'lucide-react';
import { SensorData } from './Simulation';

interface UIProps {
  energy: number;
  co2: number;
  isNight: boolean;
  toggleNight: () => void;
  selectedSensorData: SensorData | null;
  onCloseSensor: () => void;
}

export const UI = ({ energy, co2, isNight, toggleNight, selectedSensorData, onCloseSensor }: UIProps) => {
  return (
    <div className={`fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 md:p-12 ${isNight ? 'text-[#F8FAFC]' : 'text-[#1E293B]'}`}>
      {/* Top Section: Stats */}
      <div className="flex flex-col gap-4">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`glass p-6 rounded-2xl w-fit pointer-events-auto ${!isNight && 'bg-[#F8FAFC]/80 border-[#334155]/20 shadow-sm'}`}
        >
          <div className="flex items-center gap-3 mb-1">
            <Zap className="w-5 h-5 text-[#2563EB]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]/80">Energy Generated</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-mono font-bold glow-text">
              {energy.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-lg font-medium opacity-50">kWh</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`glass p-6 rounded-2xl w-fit pointer-events-auto ${!isNight && 'bg-[#F8FAFC]/80 border-[#334155]/20 shadow-sm'}`}
        >
          <div className="flex items-center gap-3 mb-1">
            <Leaf className="w-5 h-5 text-[#22C55E]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#22C55E]/80">CO₂ Offset</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-mono font-bold glow-text">
              {co2.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-lg font-medium opacity-50">kg</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section: Controls */}
      <div className="flex justify-end items-end">
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleNight}
          className={`glass p-4 rounded-full pointer-events-auto flex items-center justify-center ${!isNight && 'bg-[#F8FAFC]/80 border-[#334155]/20 shadow-sm'}`}
        >
          <AnimatePresence mode="wait">
            {isNight ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <Sun className="w-6 h-6 text-[#FACC15]" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <Moon className="w-6 h-6 text-[#2563EB]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Ambient Overlay for Night Mode */}
      <AnimatePresence>
        {isNight && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-indigo-950/10 mix-blend-overlay pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Sensor Info Panel */}
      <AnimatePresence>
        {selectedSensorData && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 backdrop-blur-xl p-6 rounded-2xl w-80 pointer-events-auto z-20 shadow-2xl ${isNight ? 'bg-[#334155]/80 border border-[#2563EB]/30' : 'bg-[#F8FAFC]/90 border border-[#334155]/20'}`}
          >
            <button onClick={onCloseSensor} className={`absolute top-4 right-4 transition-colors ${isNight ? 'text-[#F8FAFC]/50 hover:text-[#F8FAFC]' : 'text-[#334155]/50 hover:text-[#1E293B]'}`}>
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Activity className={`w-6 h-6 ${selectedSensorData.damage > 70 ? 'text-red-500' : selectedSensorData.damage > 30 ? 'text-[#FACC15]' : 'text-[#22C55E]'}`} />
              <h3 className="text-lg font-bold uppercase tracking-widest">Sensor #{selectedSensorData.id + 1}</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={isNight ? 'text-[#F8FAFC]/60' : 'text-[#334155]/70'}>Damage Level</span>
                  <span className={`font-mono font-bold ${selectedSensorData.damage > 70 ? 'text-red-500' : selectedSensorData.damage > 30 ? 'text-[#FACC15]' : 'text-[#22C55E]'}`}>
                    {selectedSensorData.damage}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isNight ? 'bg-[#1E293B]' : 'bg-[#334155]/20'}`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedSensorData.damage}%` }}
                    className={`h-full ${selectedSensorData.damage > 70 ? 'bg-red-500' : selectedSensorData.damage > 30 ? 'bg-[#FACC15]' : 'bg-[#22C55E]'}`}
                  />
                </div>
              </div>
              <p className={`text-xs leading-relaxed ${isNight ? 'text-[#F8FAFC]/60' : 'text-[#334155]/80'}`}>
                {selectedSensorData.damage > 70 
                  ? "Critical damage detected. Maintenance required immediately to restore optimal energy harvesting."
                  : selectedSensorData.damage > 30 
                  ? "Moderate wear and tear. Sensor is operating at reduced efficiency."
                  : "Sensor is operating optimally. Minimal wear detected."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
