import { createContext, useContext, useState } from 'react';

const EntityContext = createContext();

export function EntityProvider({ children }) {
    // Global list of selected entity IDs
    const [selectedEntityIds, setSelectedEntityIds] = useState([]);

    const toggleEntity = (id) => {
        setSelectedEntityIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const isSelected = (id) => selectedEntityIds.includes(id);

    return (
        <EntityContext.Provider value={{ selectedEntityIds, toggleEntity, isSelected, setSelectedEntityIds }}>
            {children}
        </EntityContext.Provider>
    );
}

export const useEntities = () => useContext(EntityContext);
