import { useState } from 'react';
import TimePicker from '../components/TimePicker';
import DateTimeRangePicker from '../components/DateTimeRangePicker';
import DateTimePicker from '../components/DateTimePicker';

export default function Playground() {
    const [selectedTime, setSelectedTime] = useState("08:59 AM");

    return (
        <div className="p-12 max-w-5xl mx-auto space-y-24 pb-32">
            
            {/* DateTime Picker (Single) Section */}
            <div className="space-y-8">
                <h1 className="text-primary font-bold text-xl tracking-widest uppercase">Date-Time Picker (Single)</h1>
                <div className="space-y-4">
                    <DateTimePicker />
                </div>
            </div>

            {/* DateTime Range Picker Section */}
            <div className="space-y-8">
                <h1 className="text-primary font-bold text-xl tracking-widest uppercase">Date-Time Range Picker</h1>
                <div className="space-y-4">
                    <DateTimeRangePicker />
                </div>
            </div>

            {/* Time Picker Section */}
            <div className="space-y-8">
                <h1 className="text-primary font-bold text-xl tracking-widest uppercase">Time Picker</h1>
                
                <div className="space-y-4">
                    <h2 className="text-muted font-bold text-sm tracking-widest uppercase">Select Time</h2>
                    <TimePicker 
                        initialTime="08:59 AM" 
                        onChange={(newTime) => setSelectedTime(newTime)} 
                    />
                    <div className="pt-8 text-muted/60 text-sm font-medium">
                        Current Value: <span className="text-primary/80">{selectedTime}</span>
                    </div>
                </div>
            </div>

            <div className="opacity-40 text-muted space-y-2 text-sm font-medium pt-12">
                <div>- Date Input (TODO)</div>
                <div>- Time Range Input Box (TODO)</div>
            </div>
        </div>
    );
}