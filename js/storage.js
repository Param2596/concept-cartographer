/**
 * Storage module for handling localStorage operations
 */
const Storage = (function() {
    const MAPS_KEY = 'concept-cartographer-maps';
    
    // Get list of saved maps
    function getSavedMaps() {
        const savedMapsJSON = localStorage.getItem(MAPS_KEY);
        if (!savedMapsJSON) {
            return [];
        }
        try {
            return JSON.parse(savedMapsJSON);
        } catch (e) {
            console.error('Error parsing saved maps:', e);
            return [];
        }
    }
    
    // Save a new map
    function saveMap(name, data) {
        if (!name) {
            throw new Error('Map name is required');
        }
        
        const maps = getSavedMaps();
        const timestamp = new Date().toISOString();
        
        // Check if map with this name already exists
        const existingIndex = maps.findIndex(m => m.name === name);
        if (existingIndex >= 0) {
            // Update existing map
            maps[existingIndex] = {
                name,
                timestamp,
                data
            };
        } else {
            // Add new map
            maps.push({
                name,
                timestamp,
                data
            });
        }
        
        localStorage.setItem(MAPS_KEY, JSON.stringify(maps));
        return { name, timestamp };
    }
    
    // Load a specific map by name
    function loadMap(name) {
        const maps = getSavedMaps();
        const map = maps.find(m => m.name === name);
        
        if (!map) {
            throw new Error(`Map "${name}" not found`);
        }
        
        return map.data;
    }
    
    // Delete a map by name
    function deleteMap(name) {
        const maps = getSavedMaps();
        const newMaps = maps.filter(m => m.name !== name);
        
        if (maps.length === newMaps.length) {
            throw new Error(`Map "${name}" not found`);
        }
        
        localStorage.setItem(MAPS_KEY, JSON.stringify(newMaps));
    }
    
    // Public API
    return {
        getSavedMaps,
        saveMap,
        loadMap,
        deleteMap
    };
})();