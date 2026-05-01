import { useState } from 'react';
import TimePicker from '../components/TimePicker';
import DateTimeRangePicker from '../components/DateTimeRangePicker';
import DateTimePicker from '../components/DateTimePicker';

import EntityChip from '../components/EntitySelector/EntityChip';
import EntitySelector from '../components/EntitySelector';
import SimplifiedConstraintPicker from '../components/SimplifiedConstraintPicker';

export default function Playground() {
    const [selectedTime, setSelectedTime] = useState("08:59 AM");
    const [globalSelected, setGlobalSelected] = useState(['1', 'g1']);
    const [tableSelected, setTableSelected] = useState(['2', '3', '4', '5']);
    const [demoStates, setDemoStates] = useState({
        person1: true,
        person2: false,
        group1: true,
        group2: false
    });

    const toggleDemo = (key) => setDemoStates(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="p-12 max-w-5xl mx-auto space-y-24 pb-32">
            
            {/* Full Entity Selector Section */}
            <div className="space-y-8">
                <h1 className="text-primary font-bold text-xl tracking-widest uppercase">Full Entity Selector</h1>
                
                <div className="space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-muted font-bold text-xs uppercase tracking-widest">Standalone / Global Variant</h2>
                        <EntitySelector 
                            selectedIds={globalSelected}
                            onChange={setGlobalSelected}
                        />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-muted font-bold text-xs uppercase tracking-widest">Table / Compact Variant (maxVisible: 2)</h2>
                        <div className="max-w-md border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] uppercase tracking-tighter text-muted">
                                    <tr>
                                        <th className="px-4 py-2">Item</th>
                                        <th className="px-4 py-2">Participants</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-subtle)]">
                                    <tr>
                                        <td className="px-4 py-2 text-sm">Dinner Party</td>
                                        <td className="px-2 py-1">
                                            <EntitySelector 
                                                variant="table"
                                                maxVisible={2}
                                                selectedIds={tableSelected}
                                                onChange={setTableSelected}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Entity Chips Section */}
            <div className="space-y-8">
                <h1 className="text-primary font-bold text-xl tracking-widest uppercase">Entity Chips</h1>
                <div className="flex flex-wrap gap-6 items-center">
                    <div className="space-y-4">
                        <h2 className="text-muted font-bold text-xs uppercase tracking-widest">Individuals</h2>
                        <div className="flex gap-4">
                            <EntityChip 
                                name="Ahmed" 
                                color="#5E5AB2" 
                                isSelected={demoStates.person1} 
                                onClick={() => toggleDemo('person1')} 
                            />
                            <EntityChip 
                                name="Alizeh" 
                                color="#B23B3B" 
                                isSelected={demoStates.person2} 
                                onClick={() => toggleDemo('person2')} 
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-muted font-bold text-xs uppercase tracking-widest">Groups (Double Border)</h2>
                        <div className="flex gap-8">
                            <EntityChip 
                                name="owrplan gng" 
                                color="#5E5AB2" 
                                isSelected={demoStates.group1} 
                                isGroup={true}
                                onClick={() => toggleDemo('group1')} 
                            />
                            <EntityChip 
                                name="AML-6A" 
                                color="#B29B3B" 
                                isSelected={demoStates.group2} 
                                isGroup={true}
                                onClick={() => toggleDemo('group2')} 
                            />
                        </div>
                    </div>
                </div>
            </div>

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

            <section className="mb-20">
                <h2 className="text-xl font-bold mb-8 uppercase tracking-widest text-[#DC8379]/40">Simplified Constraint Picker</h2>
                <div className="flex justify-center">
                    <SimplifiedConstraintPicker />
                </div>
            </section>

            <div className="opacity-40 text-muted space-y-2 text-sm font-medium pt-12">
                <div>- Date Input (TODO)</div>
                <div>- Time Range Input Box (TODO)</div>
            </div>
        </div>
    );
}