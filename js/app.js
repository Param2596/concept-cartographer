/**
 * Main application controller
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const textInput = document.getElementById('text-input');
    const processBtn = document.getElementById('process-btn');
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-btn');
    const loadBtn = document.getElementById('load-btn');
    const useAiCheckbox = document.getElementById('use-ai');
    const savedMapsSelect = document.getElementById('saved-maps');
    const mindmapSvg = document.getElementById('mindmap');
    const loading = document.getElementById('loading');
    const nodeLabel = document.getElementById('node-label');
    const updateNodeBtn = document.getElementById('update-node');
    const deleteNodeBtn = document.getElementById('delete-node');
    const addConnectionBtn = document.getElementById('add-connection');
    const connectionModal = document.getElementById('connection-modal');
    const targetNodeSelect = document.getElementById('target-node');
    const connectionTypeSelect = document.getElementById('connection-type');
    const createConnectionBtn = document.getElementById('create-connection');
    const cancelConnectionBtn = document.getElementById('cancel-connection');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomResetBtn = document.getElementById('zoom-reset');
    
    // Initialize the mind map
    MindMapRenderer.init(mindmapSvg);
    
    // Load saved maps into the dropdown
    function loadSavedMapsList() {
        const maps = Storage.getSavedMaps();
        
        // Clear options except the first one
        while (savedMapsSelect.options.length > 1) {
            savedMapsSelect.options.remove(1);
        }
        
        // Add maps to dropdown
        maps.forEach(map => {
            const option = document.createElement('option');
            option.value = map.name;
            option.text = `${map.name} (${new Date(map.timestamp).toLocaleDateString()})`;
            savedMapsSelect.appendChild(option);
        });
        
        // Enable/disable the select based on whether we have maps
        savedMapsSelect.disabled = maps.length === 0;
    }
    
    // Process text and generate mind map
    async function processText() {
        const text = textInput.value.trim();
        
        if (!text) {
            alert('Please enter some text to analyze.');
            return;
        }
        
        loading.classList.remove('hidden');
        
        try {
            let mindMapData;
            
            // Use AI or local processing based on checkbox
            if (useAiCheckbox && useAiCheckbox.checked) {
                // This would typically call an API for better NLP processing
                // For now, we'll use our local implementation
                mindMapData = await ConceptExtractor.processTextWithAI(text);
            } else {
                mindMapData = ConceptExtractor.processText(text);
            }
            
            // Render the mind map
            MindMapRenderer.render(mindMapData);
        } catch (error) {
            console.error('Error processing text:', error);
            alert('Error processing text. Please try again.');
        } finally {
            loading.classList.add('hidden');
        }
    }
    
    // Clear the mind map and input
    function clearAll() {
        textInput.value = '';
        MindMapRenderer.render({nodes: [], links: []});
        document.getElementById('node-controls').classList.add('hidden');
    }
    
    // Save the current mind map
    function saveMap() {
        const name = prompt('Enter a name for this mind map:');
        
        if (!name) return;
        
        try {
            const data = MindMapRenderer.exportData();
            Storage.saveMap(name, data);
            alert(`Mind map "${name}" saved successfully!`);
            loadSavedMapsList();
        } catch (error) {
            console.error('Error saving mind map:', error);
            alert('Error saving mind map. Please try again.');
        }
    }
    
    // Load a saved mind map
    function loadMap() {
        const selectedMap = savedMapsSelect.value;
        
        if (!selectedMap) return;
        
        try {
            const data = Storage.loadMap(selectedMap);
            MindMapRenderer.render(data);
        } catch (error) {
            console.error('Error loading mind map:', error);
            alert('Error loading mind map. Please try again.');
        }
    }
    
    // Update the selected node
    function updateNode() {
        const selectedNode = MindMapRenderer.getSelectedNode();
        
        if (!selectedNode) return;
        
        const newLabel = nodeLabel.value.trim();
        
        if (!newLabel) {
            alert('Node label cannot be empty.');
            return;
        }
        
        MindMapRenderer.updateNode(selectedNode.id, newLabel);
        document.getElementById('node-controls').classList.add('hidden');
    }
    
    // Delete the selected node
    function deleteNode() {
        const selectedNode = MindMapRenderer.getSelectedNode();
        
        if (!selectedNode) return;
        
        if (confirm(`Are you sure you want to delete "${selectedNode.label}"?`)) {
            MindMapRenderer.removeNode(selectedNode.id);
            document.getElementById('node-controls').classList.add('hidden');
        }
    }
    
    // Show the connection modal
    function showConnectionModal() {
        const selectedNode = MindMapRenderer.getSelectedNode();
        
        if (!selectedNode) return;
        
        // Get all nodes except the selected one
        const nodes = MindMapRenderer.getNodes().filter(node => node.id !== selectedNode.id);
        
        // Clear the target node dropdown
        targetNodeSelect.innerHTML = '';
        
        // Add nodes to the dropdown
        nodes.forEach(node => {
            const option = document.createElement('option');
            option.value = node.id;
            option.text = node.label;
            targetNodeSelect.appendChild(option);
        });
        
        if (nodes.length === 0) {
            alert('You need at least two nodes to create a connection.');
            return;
        }
        
        // Show the modal
        connectionModal.classList.remove('hidden');
    }
    
    // Create a new connection between nodes
    function createConnection() {
    const selectedNode = MindMapRenderer.getSelectedNode();
    const targetNodeId = targetNodeSelect.value;
    const connectionType = connectionTypeSelect.value;
    
    if (!selectedNode || !targetNodeId) return; // Add the 'return' statement here
    
    MindMapRenderer.addLink(selectedNode.id, targetNodeId, connectionType);
    connectionModal.classList.add('hidden');
    }
    
    // Event listeners
    processBtn.addEventListener('click', processText);
    clearBtn.addEventListener('click', clearAll);
    saveBtn.addEventListener('click', saveMap);
    loadBtn.addEventListener('click', loadMap);
    updateNodeBtn.addEventListener('click', updateNode);
    deleteNodeBtn.addEventListener('click', deleteNode);
    addConnectionBtn.addEventListener('click', showConnectionModal);
    createConnectionBtn.addEventListener('click', createConnection);
    cancelConnectionBtn.addEventListener('click', () => connectionModal.classList.add('hidden'));
    
    // Zoom controls
    zoomInBtn.addEventListener('click', () => MindMapRenderer.zoom(1.2));
    zoomOutBtn.addEventListener('click', () => MindMapRenderer.zoom(0.8));
    zoomResetBtn.addEventListener('click', () => MindMapRenderer.resetZoom());
    
    // Handle node selection
    mindmapSvg.addEventListener('click', (event) => {
        const nodeId = event.target.closest('.node')?.dataset.id;
        
        if (!nodeId) {
            // Clicked outside a node, hide node controls
            document.getElementById('node-controls').classList.add('hidden');
            MindMapRenderer.clearSelection();
            return;
        }
        
        // Show node controls
        const nodeData = MindMapRenderer.selectNode(nodeId);
        if (nodeData) {
            const nodeControls = document.getElementById('node-controls');
            nodeLabel.value = nodeData.label;
            nodeControls.classList.remove('hidden');
        }
    });
    
    // Allow adding new nodes with double-click
    mindmapSvg.addEventListener('dblclick', (event) => {
        // Ignore if we're clicking on an existing node
        if (event.target.closest('.node')) return;
        
        // Get SVG coordinates
        const svgRect = mindmapSvg.getBoundingClientRect();
        const x = event.clientX - svgRect.left;
        const y = event.clientY - svgRect.top;
        
        // Prompt for node name
        const label = prompt('Enter node label:');
        if (label) {
            MindMapRenderer.addNode(label, x, y);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Delete selected node with Delete key
        if (event.key === 'Delete' && MindMapRenderer.getSelectedNode()) {
            deleteNode();
        }
        
        // Escape key to cancel modals
        if (event.key === 'Escape') {
            connectionModal.classList.add('hidden');
            if (document.activeElement !== textInput) {
                document.getElementById('node-controls').classList.add('hidden');
                MindMapRenderer.clearSelection();
            }
        }
    });
    
    // Initialize
    loadSavedMapsList();
    
    // Check if URL has a shared map parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('map')) {
        try {
            const mapData = JSON.parse(atob(urlParams.get('map')));
            MindMapRenderer.render(mapData);
        } catch (error) {
            console.error('Error loading shared map:', error);
        }
    }
});