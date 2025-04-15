/**
 * MindMap Renderer - Handles visualization of concept maps using D3
 */
const MindMapRenderer = (function() {
    // Private variables
    let svg;
    let container;
    let nodes = [];
    let links = [];
    let simulation;
    let selectedNodeId = null;
    let zoomBehavior; // Renamed from 'zoom' to 'zoomBehavior'
    
    // Color scheme for different relationship types
    const COLOR_SCHEME = {
        'causes': '#E74C3C',        // Red
        'part-of': '#3498DB',       // Blue
        'example': '#2ECC71',       // Green
        'prerequisite': '#F39C12',  // Orange
        'depends-on': '#9B59B6',    // Purple
        'leads-to': '#E67E22',      // Dark Orange
        'type-of': '#16A085',       // Teal
        'requires': '#F1C40F',      // Yellow
        'related': '#95A5A6',       // Grey
        'default': '#7F8C8D'        // Dark Grey
    };
    
    // Node styles
    let NODE_RADIUS = 60; // Changed from const to let to allow dynamic sizing
    const NODE_STROKE_WIDTH = 3;
    const NODE_DEFAULT_COLOR = '#34495E';
    const NODE_SELECTED_COLOR = '#E74C3C';
    
    // Initialize the SVG and force simulation
    function init(svgElement) {
        svg = d3.select(svgElement);
        
        // Clear any existing content
        svg.selectAll('*').remove();
        
        // Create container for zooming
        container = svg.append('g')
            .attr('class', 'container');
            
        // Add defs for arrow markers
        const defs = svg.append('defs');
        
        // Create arrow markers for each relationship type
        Object.entries(COLOR_SCHEME).forEach(([type, color]) => {
            defs.append('marker')
                .attr('id', `arrow-${type}`)
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', NODE_RADIUS + 10)
                .attr('refY', 0)
                .attr('markerWidth', 6)
                .attr('markerHeight', 6)
                .attr('orient', 'auto')
                .append('path')
                .attr('fill', color)
                .attr('d', 'M0,-5L10,0L0,5');
        });
        
        // Add drop shadow filter for nodes
        const filter = defs.append('filter')
            .attr('id', 'drop-shadow')
            .attr('height', '130%');
            
        filter.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 3)
            .attr('result', 'blur');
            
        filter.append('feOffset')
            .attr('in', 'blur')
            .attr('dx', 2)
            .attr('dy', 2)
            .attr('result', 'offsetBlur');
            
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode')
            .attr('in', 'offsetBlur');
        feMerge.append('feMergeNode')
            .attr('in', 'SourceGraphic');
        
        // Setup zoom behavior
        zoomBehavior = d3.zoom()
            .scaleExtent([0.2, 3])
            .on('zoom', (event) => {
                container.attr('transform', event.transform);
            });
            
        svg.call(zoomBehavior);
        
        // Create force simulation
        simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(NODE_RADIUS * 2.5))
            .force('charge', d3.forceManyBody().strength(-500))
            .force('center', d3.forceCenter(
                svgElement.clientWidth / 2, 
                svgElement.clientHeight / 2
            ))
            .force('collision', d3.forceCollide().radius(NODE_RADIUS * 1.2));
    }
    
    // Set bubble size
    function setBubbleSize(radius) {
        NODE_RADIUS = parseInt(radius);
        
        // Update markers
        svg.selectAll('defs marker')
            .attr('refX', NODE_RADIUS + 10);
        
        // Update simulation forces
        if (simulation) {
            simulation
                .force('link', d3.forceLink().id(d => d.id).distance(NODE_RADIUS * 2.5))
                .force('collision', d3.forceCollide().radius(NODE_RADIUS * 1.2));
            
            // Update existing nodes
            container.selectAll('.node circle')
                .attr('r', NODE_RADIUS);
                
            // Update node text wrapping
            container.selectAll('.node text')
                .call(wrapText, NODE_RADIUS * 1.5);
            
            // Restart simulation if we have nodes
            if (nodes.length > 0) {
                simulation.alpha(0.3).restart();
            }
        }
    }
    
    // Render the mind map
    function render(data) {
        if (!svg || !container) return;
        
        // Store data
        nodes = data.nodes || [];
        links = data.links || [];
        selectedNodeId = null;
        
        // Update the simulation with the new data
        simulation.nodes(nodes);
        simulation.force('link').links(links);
        
        // Render links
        const link = container.selectAll('.link')
            .data(links, d => d.id)
            .join(
                enter => enter.append('g')
                    .attr('class', 'link')
                    .call(g => {
                        // Create path
                        g.append('path')
                            .attr('stroke-width', 2)
                            .attr('stroke', d => COLOR_SCHEME[d.type] || COLOR_SCHEME.default)
                            .attr('marker-end', d => `url(#arrow-${d.type || 'default'})`)
                            .attr('fill', 'none')
                            .attr('opacity', 0.7);
                            
                        // Create label
                        g.append('text')
                            .attr('class', 'link-label')
                            .attr('dy', -5)
                            .attr('text-anchor', 'middle')
                            .attr('fill', d => COLOR_SCHEME[d.type] || COLOR_SCHEME.default)
                            .text(d => d.type)
                            .attr('opacity', 0.9)
                            .style('font-size', '12px')
                            .style('pointer-events', 'none');
                    }),
                update => update,
                exit => exit.remove()
            );
        
        // Render nodes
        const node = container.selectAll('.node')
            .data(nodes, d => d.id)
            .join(
                enter => {
                    const nodeGroup = enter.append('g')
                        .attr('class', 'node')
                        .attr('data-id', d => d.id)
                        .call(drag(simulation))
                        .attr('cursor', 'pointer');
                    
                    // Node circle
                    nodeGroup.append('circle')
                        .attr('r', NODE_RADIUS)
                        .attr('fill', 'white')
                        .attr('stroke', NODE_DEFAULT_COLOR)
                        .attr('stroke-width', NODE_STROKE_WIDTH)
                        .style('filter', 'url(#drop-shadow)');
                    
                    // Node gradient background
                    nodeGroup.append('circle')
                        .attr('r', NODE_RADIUS - 1)
                        .attr('fill', (d, i) => {
                            // Create a pastel color based on node index
                            const hue = (i * 137.5) % 360; // Golden angle approximation
                            return `hsl(${hue}, 70%, 85%)`;
                        })
                        .attr('opacity', 0.5);
                    
                    // Node text
                    nodeGroup.append('text')
                        .attr('dy', 0)
                        .attr('text-anchor', 'middle')
                        .attr('fill', '#333')
                        .style('font-weight', 'bold')
                        .style('font-size', '14px')
                        .style('pointer-events', 'none')
                        .text(d => d.label)
                        .call(wrapText, NODE_RADIUS * 1.5);
                    
                    return nodeGroup;
                },
                update => {
                    update.select('text')
                        .text(d => d.label)
                        .call(wrapText, NODE_RADIUS * 1.5);
                    return update;
                },
                exit => exit.remove()
            );
        
        // Update simulation on tick
        simulation.on('tick', () => {
            // Constrain nodes to svg boundaries
            nodes.forEach(d => {
                d.x = Math.max(NODE_RADIUS, Math.min(svg.node().clientWidth - NODE_RADIUS, d.x));
                d.y = Math.max(NODE_RADIUS, Math.min(svg.node().clientHeight - NODE_RADIUS, d.y));
            });
            
            // Update link paths
            link.selectAll('path')
                .attr('d', d => {
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const angle = Math.atan2(dy, dx);
                    
                    // Adjust start and end points to be on node boundaries
                    const sourceX = d.source.x + NODE_RADIUS * Math.cos(angle);
                    const sourceY = d.source.y + NODE_RADIUS * Math.sin(angle);
                    const targetX = d.target.x - NODE_RADIUS * Math.cos(angle);
                    const targetY = d.target.y - NODE_RADIUS * Math.sin(angle);
                    
                    return `M${sourceX},${sourceY} Q${(sourceX + targetX) / 2 + 30 * Math.sin(angle)},${(sourceY + targetY) / 2 - 30 * Math.cos(angle)} ${targetX},${targetY}`;
                });
            
            // Update link labels
            link.selectAll('text')
                .attr('transform', d => {
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const angle = Math.atan2(dy, dx);
                    
                    const midX = (d.source.x + d.target.x) / 2 + 15 * Math.sin(angle);
                    const midY = (d.source.y + d.target.y) / 2 - 15 * Math.cos(angle);
                    
                    return `translate(${midX}, ${midY})`;
                });
            
            // Update node positions
            node.attr('transform', d => `translate(${d.x}, ${d.y})`);
        });
        
        // Start or restart the simulation
        simulation.alpha(1).restart();
        
        // Reset zoom
        resetZoom();
    }
    
    // Wrap text within circles
    function wrapText(text, width) {
        text.each(function(d) {
            const text = d3.select(this);
            const words = d.label.split(/\s+/).reverse();
            const lineHeight = 1.1;
            const y = text.attr('y');
            const dy = parseFloat(text.attr('dy'));
            
            let line = [];
            let lineNumber = 0;
            let word;
            let tspan = text.text(null).append('tspan')
                .attr('x', 0)
                .attr('y', y)
                .attr('dy', dy + 'em');
                
            // Limited to 3 lines max
            const maxLines = 3;
            
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(' '));
                
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(' '));
                    line = [word];
                    
                    lineNumber++;
                    if (lineNumber >= maxLines) {
                        // Add ellipsis if we have more text but hit max lines
                        if (words.length > 0) {
                            tspan.text(tspan.text() + '...');
                            break;
                        }
                    }
                    
                    tspan = text.append('tspan')
                        .attr('x', 0)
                        .attr('y', y)
                        .attr('dy', lineNumber * lineHeight + dy + 'em')
                        .text(word);
                }
            }
            
            // Adjust vertical position based on number of lines
            const totalLineHeight = lineHeight * Math.min(lineNumber, maxLines);
            text.selectAll('tspan')
                .attr('dy', function(_, i) {
                    return (dy - totalLineHeight/2 + i * lineHeight) + 'em';
                });
        });
    }
    
    // Drag behavior for nodes
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            // Keep the node where it was dragged to
            // event.subject.fx = null;
            // event.subject.fy = null;
        }
        
        return d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }
    
    // Select a node
    function selectNode(id) {
        // Deselect previous node
        if (selectedNodeId) {
            container.select(`.node[data-id="${selectedNodeId}"]`)
                .select('circle')
                .attr('stroke', NODE_DEFAULT_COLOR);
        }
        
        // Select new node
        selectedNodeId = id;
        
        if (selectedNodeId) {
            container.select(`.node[data-id="${selectedNodeId}"]`)
                .select('circle')
                .attr('stroke', NODE_SELECTED_COLOR);
                
            // Find the node data
            return nodes.find(node => node.id === selectedNodeId);
        }
        
        return null;
    }
    
    // Clear node selection
    function clearSelection() {
        if (selectedNodeId) {
            container.select(`.node[data-id="${selectedNodeId}"]`)
                .select('circle')
                .attr('stroke', NODE_DEFAULT_COLOR);
            selectedNodeId = null;
        }
    }
    
    // Get the currently selected node
    function getSelectedNode() {
        return selectedNodeId ? nodes.find(node => node.id === selectedNodeId) : null;
    }
    
    // Get all nodes
    function getNodes() {
        return [...nodes];
    }
    
    // Add a new node
    function addNode(label, x, y) {
        const id = `node-${Date.now()}`;
        const node = {
            id: id,
            label: label,
            x: x,
            y: y
        };
        
        nodes.push(node);
        render({ nodes, links });
        return node;
    }
    
    // Update a node
    function updateNode(id, label) {
        const node = nodes.find(n => n.id === id);
        if (node) {
            node.label = label;
            render({ nodes, links });
        }
        return node;
    }
    
    // Remove a node and its connected links
    function removeNode(id) {
        nodes = nodes.filter(n => n.id !== id);
        links = links.filter(l => l.source.id !== id && l.target.id !== id);
        render({ nodes, links });
    }
    
    // Add a link between nodes
    function addLink(sourceId, targetId, type = 'related') {
        const id = `link-${Date.now()}`;
        const link = {
            id: id,
            source: sourceId,
            target: targetId,
            type: type
        };
        
        links.push(link);
        render({ nodes, links });
        return link;
    }
    
    // Remove a link
    function removeLink(id) {
        links = links.filter(l => l.id !== id);
        render({ nodes, links });
    }
    
    // Zoom functions
    function zoom(factor) {
        const currentTransform = d3.zoomTransform(svg.node());
        const newScale = currentTransform.k * factor;
        
        svg.transition()
            .duration(300)
            .call(zoomBehavior.transform, 
                d3.zoomIdentity
                    .translate(currentTransform.x, currentTransform.y)
                    .scale(newScale)
            );
    }
    
    function resetZoom() {
        svg.transition()
            .duration(500)
            .call(zoomBehavior.transform, d3.zoomIdentity);
    }
    
    // Export data
    function exportData() {
        return {
            nodes: nodes.map(node => ({
                id: node.id,
                label: node.label,
                x: node.x,
                y: node.y
            })),
            links: links.map(link => ({
                id: link.id,
                source: typeof link.source === 'object' ? link.source.id : link.source,
                target: typeof link.target === 'object' ? link.target.id : link.target,
                type: link.type
            }))
        };
    }
    
    // Public API
    return {
        init,
        render,
        selectNode,
        clearSelection,
        getSelectedNode,
        getNodes,
        addNode,
        updateNode,
        removeNode,
        addLink,
        removeLink,
        zoom,
        resetZoom,
        exportData,
        setBubbleSize // New function for bubble size control
    };
})();