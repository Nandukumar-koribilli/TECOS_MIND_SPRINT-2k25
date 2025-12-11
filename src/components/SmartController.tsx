import React, { useState } from 'react';
import HardwareDashboard from './HardwareDashboard';
import SoilMoistureSensor from './SoilMoistureSensor';
import WaterPumpControl from './WaterPumpControl';
import LCDDisplay from './LCDDisplay';
import BlynkControls from './BlynkControls';

export const SmartController: React.FC = () => {
    const [soilMoistureData, setSoilMoistureData] = useState<any>(null);


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Smart Controller</h1>

            {/* Blynk Cloud Controls */}
            <BlynkControls />

            {/* IoT Hardware Dashboard */}
            <HardwareDashboard />

            {/* Hardware Components Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Soil Moisture Sensor */}
                <SoilMoistureSensor
                    onDataUpdate={setSoilMoistureData}
                />

                {/* Water Pump Control */}
                <WaterPumpControl
                    soilMoisture={soilMoistureData?.value}
                />
            </div>

            {/* LCD Display */}
            <LCDDisplay />
        </div>
    );
};
