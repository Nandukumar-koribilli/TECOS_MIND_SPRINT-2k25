import React, { useState, useEffect } from 'react';
import { RotateCcw, Type, Zap } from 'lucide-react';

interface LCDData {
    line1: string;
    line2: string;
    backlight: boolean;
    contrast: number;
    cursor: boolean;
    blink: boolean;
}

interface LCDDisplayProps {
    onDisplayUpdate?: (data: LCDData) => void;
    initialData?: Partial<LCDData>;
}

const LCDDisplay: React.FC<LCDDisplayProps> = ({
    onDisplayUpdate,
    initialData
}) => {
    const [lcdData, setLcdData] = useState<LCDData>({
        line1: 'Smart Farm System',
        line2: 'Ready...',
        backlight: true,
        contrast: 50,
        cursor: false,
        blink: false,
        ...initialData
    });

    const [customMessage, setCustomMessage] = useState({
        line1: '',
        line2: ''
    });

    const [displayMode, setDisplayMode] = useState<'normal' | 'scrolling' | 'blinking'>('normal');
    const [isConnected, setIsConnected] = useState(true);

    // Simulate LCD updates
    useEffect(() => {
        onDisplayUpdate?.(lcdData);
    }, [lcdData, onDisplayUpdate]);

    // Simulate connection status
    useEffect(() => {
        const interval = setInterval(() => {
            setIsConnected(Math.random() > 0.1); // 90% uptime simulation
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const updateDisplay = (line1: string, line2: string) => {
        setLcdData(prev => ({
            ...prev,
            line1: line1.substring(0, 16), // 16x2 LCD limit
            line2: line2.substring(0, 16)
        }));
    };

    const sendCustomMessage = () => {
        if (customMessage.line1.trim() || customMessage.line2.trim()) {
            updateDisplay(
                customMessage.line1.trim() || lcdData.line1,
                customMessage.line2.trim() || lcdData.line2
            );
            setCustomMessage({ line1: '', line2: '' });
        }
    };

    const clearDisplay = () => {
        updateDisplay('', '');
    };

    const resetDisplay = () => {
        updateDisplay('Smart Farm System', 'Ready...');
    };

    const toggleBacklight = () => {
        setLcdData(prev => ({ ...prev, backlight: !prev.backlight }));
    };

    const updateContrast = (value: number) => {
        setLcdData(prev => ({ ...prev, contrast: value }));
    };

    const toggleCursor = () => {
        setLcdData(prev => ({ ...prev, cursor: !prev.cursor }));
    };

    const toggleBlink = () => {
        setLcdData(prev => ({ ...prev, blink: !prev.blink }));
    };

    const getDisplayOpacity = () => {
        if (!lcdData.backlight) return 0.3;
        return Math.max(0.1, lcdData.contrast / 100);
    };

    const getDisplayStyle = () => {
        const baseStyle = {
            opacity: getDisplayOpacity(),
            filter: lcdData.backlight ? 'brightness(1)' : 'brightness(0.3)'
        };

        switch (displayMode) {
            case 'scrolling':
                return {
                    ...baseStyle,
                    animation: 'scroll 10s linear infinite'
                };
            case 'blinking':
                return {
                    ...baseStyle,
                    animation: 'blink 1s infinite'
                };
            default:
                return baseStyle;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">16x2 LCD Display (I2C)</h3>
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            </div>

            {/* LCD Display Simulation */}
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
                <div className="bg-black rounded border-2 border-gray-600 p-4 font-mono text-green-400 relative overflow-hidden">
                    <div
                        className="text-lg leading-6"
                        style={getDisplayStyle()}
                    >
                        <div className="whitespace-pre">
                            {lcdData.line1.padEnd(16, ' ')}
                        </div>
                        <div className="whitespace-pre">
                            {lcdData.line2.padEnd(16, ' ')}
                            {lcdData.cursor && <span className="animate-pulse">_</span>}
                        </div>
                    </div>

                    {/* Grid overlay to show 16x2 structure */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="grid grid-cols-16 gap-0 h-full opacity-10">
                            {Array.from({ length: 32 }).map((_, i) => (
                                <div key={i} className="border border-green-400"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Display Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Basic Controls */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Display Controls</h4>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleBacklight}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${lcdData.backlight
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-600 text-white'
                                }`}
                        >
                            <Zap className="w-4 h-4 mr-1" />
                            Backlight {lcdData.backlight ? 'ON' : 'OFF'}
                        </button>
                        <button
                            onClick={toggleCursor}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${lcdData.cursor
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-600 text-white'
                                }`}
                        >
                            Cursor {lcdData.cursor ? 'ON' : 'OFF'}
                        </button>
                        <button
                            onClick={toggleBlink}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${lcdData.blink
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-600 text-white'
                                }`}
                        >
                            Blink {lcdData.blink ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contrast: {lcdData.contrast}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={lcdData.contrast}
                            onChange={(e) => updateContrast(parseInt(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={clearDisplay}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                        >
                            Clear
                        </button>
                        <button
                            onClick={resetDisplay}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Display Modes */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Display Modes</h4>

                    <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="displayMode"
                                value="normal"
                                checked={displayMode === 'normal'}
                                onChange={(e) => setDisplayMode(e.target.value as any)}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-700">Normal</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="displayMode"
                                value="scrolling"
                                checked={displayMode === 'scrolling'}
                                onChange={(e) => setDisplayMode(e.target.value as any)}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-700">Scrolling Text</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="displayMode"
                                value="blinking"
                                checked={displayMode === 'blinking'}
                                onChange={(e) => setDisplayMode(e.target.value as any)}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-700">Blinking Text</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Custom Message Input */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-800 mb-4">Send Custom Message</h4>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Line 1 (max 16 chars)
                        </label>
                        <input
                            type="text"
                            maxLength={16}
                            value={customMessage.line1}
                            onChange={(e) => setCustomMessage(prev => ({ ...prev, line1: e.target.value }))}
                            placeholder="Enter message for line 1"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Line 2 (max 16 chars)
                        </label>
                        <input
                            type="text"
                            maxLength={16}
                            value={customMessage.line2}
                            onChange={(e) => setCustomMessage(prev => ({ ...prev, line2: e.target.value }))}
                            placeholder="Enter message for line 2"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={sendCustomMessage}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        <Type className="w-4 h-4 mr-1" />
                        Send Message
                    </button>
                </div>
            </div>

            {/* Quick Messages */}
            <div>
                <h4 className="font-medium text-gray-800 mb-4">Quick Messages</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                        { line1: 'Soil: 45%', line2: 'Pump: OFF' },
                        { line1: 'Watering...', line2: 'Please wait' },
                        { line1: 'Error!', line2: 'Check sensor' },
                        { line1: 'Maintenance', line2: 'Mode active' },
                        { line1: 'System OK', line2: 'All normal' },
                        { line1: 'Low Battery', line2: 'Charge soon' },
                        { line1: 'WiFi: Good', line2: 'Signal: 85%' },
                        { line1: 'Auto Mode', line2: 'Enabled' }
                    ].map((msg, index) => (
                        <button
                            key={index}
                            onClick={() => updateDisplay(msg.line1, msg.line2)}
                            className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                            {msg.line1}
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
        </div>
    );
};

export default LCDDisplay;
