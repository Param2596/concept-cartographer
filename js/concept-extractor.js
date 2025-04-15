// /**
//  * Concept Extractor - Extracts key concepts and relationships from text
//  */
// const ConceptExtractor = (function() {
//     // Common English stop words
//     const STOP_WORDS = new Set([
//         'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what', 'when',
//         'where', 'how', 'who', 'which', 'this', 'that', 'these', 'those', 'then',
//         'just', 'so', 'than', 'such', 'both', 'through', 'about', 'for', 'is', 'of',
//         'while', 'during', 'before', 'after', 'to', 'from', 'in', 'out', 'on', 'off',
//         'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
//         'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'some',
//         'other', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
//         'very', 'can', 'will', 'should', 'now', 'be', 'am', 'is', 'are', 'was', 'were',
//         'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
//         'would', 'could', 'should', 'shall', 'might', 'must', 'i', 'you', 'he', 'she', 
//         'it', 'we', 'they', 'their', 'his', 'her', 'its', 'our', 'your'
//     ]);
    
//     // Relationship patterns (simplified)
//     const RELATIONSHIP_PATTERNS = [
//         {type: 'causes', patterns: [/causes/i, /leads to/i, /results in/i]},
//         {type: 'part-of', patterns: [/part of/i, /component of/i, /belongs to/i]},
//         {type: 'example', patterns: [/example of/i, /instance of/i, /such as/i]},
//         {type: 'prerequisite', patterns: [/requires/i, /depends on/i, /needs/i]},
//     ];
    
//     // Extract noun phrases (basic approach)
//     function extractNounPhrases(text) {
//         // Split text into sentences
//         const sentences = text.split(/[.!?]+/).filter(s => s.trim() !== '');
        
//         // Process each sentence for potential noun phrases
//         const phrases = [];
//         const wordRegex = /\b[A-Za-z0-9][\w-]*\b/g;
        
//         sentences.forEach(sentence => {
//             // Simple approach: identify capitalized terms and multi-word phrases
//             const words = sentence.match(wordRegex) || [];
            
//             // Look for potential noun phrases (simplified)
//             let currentPhrase = [];
//             let isPotentialNounPhrase = false;
            
//             words.forEach((word, i) => {
//                 const lowerWord = word.toLowerCase();
                
//                 // Skip stop words at the start of phrases
//                 if (currentPhrase.length === 0 && STOP_WORDS.has(lowerWord)) {
//                     return;
//                 }
                
//                 // Consider a word part of a phrase if:
//                 // 1. It starts with uppercase (except at sentence start)
//                 // 2. It's not a stop word, or it's a stop word within a phrase
//                 // 3. It follows certain patterns
                
//                 const isCapitalized = word[0] === word[0].toUpperCase();
//                 const isFirstWord = i === 0 || (i > 0 && /[.!?]/.test(sentence[sentence.indexOf(words[i-1]) + words[i-1].length]));
//                 const isSignificant = !STOP_WORDS.has(lowerWord) || currentPhrase.length > 0;
                
//                 if ((isCapitalized && !isFirstWord) || isSignificant) {
//                     currentPhrase.push(word);
//                     isPotentialNounPhrase = true;
//                 } else if (currentPhrase.length > 0) {
//                     // End the current phrase
//                     if (isPotentialNounPhrase && currentPhrase.length > 0) {
//                         const phrase = currentPhrase.join(' ');
//                         if (!STOP_WORDS.has(phrase.toLowerCase())) {
//                             phrases.push(phrase);
//                         }
//                     }
//                     currentPhrase = [];
//                     isPotentialNounPhrase = false;
//                 }
//             });
            
//             // Add the last phrase if there's one
//             if (isPotentialNounPhrase && currentPhrase.length > 0) {
//                 const phrase = currentPhrase.join(' ');
//                 if (!STOP_WORDS.has(phrase.toLowerCase())) {
//                     phrases.push(phrase);
//                 }
//             }
            
//             // Also add stand-alone significant words
//             words.forEach(word => {
//                 if (!STOP_WORDS.has(word.toLowerCase()) && word.length > 3) {
//                     phrases.push(word);
//                 }
//             });
//         });
        
//         // Filter and deduplicate
//         const uniquePhrases = [...new Set(phrases)]
//             .filter(phrase => phrase.length > 1)
//             .slice(0, 20); // Limit to top 20 concepts
        
//         return uniquePhrases;
//     }
    
//     // Detect relationships between concepts
//     function detectRelationships(text, concepts) {
//         const relationships = [];
        
//         // For each pair of concepts
//         for (let i = 0; i < concepts.length; i++) {
//             for (let j = i + 1; j < concepts.length; j++) {
//                 const concept1 = concepts[i];
//                 const concept2 = concepts[j];
                
//                 // Check if they appear close to each other
//                 const distance = getConceptDistance(text, concept1, concept2);
//                 if (distance < 100) { // Within 100 characters
//                     // Check the text between them for relationship clues
//                     const betweenText = getTextBetween(text, concept1, concept2);
//                     const relationshipType = identifyRelationship(betweenText);
                    
//                     relationships.push({
//                         source: concept1,
//                         target: concept2,
//                         type: relationshipType
//                     });
//                 }
//             }
//         }
        
//         return relationships;
//     }
    
//     // Find the character distance between two concepts in the text
//     function getConceptDistance(text, concept1, concept2) {
//         const pos1 = text.indexOf(concept1);
//         const pos2 = text.indexOf(concept2);
        
//         if (pos1 === -1 || pos2 === -1) return Infinity;
        
//         return Math.abs(pos1 - pos2);
//     }
    
//     // Get the text between two concepts
//     function getTextBetween(text, concept1, concept2) {
//         const pos1 = text.indexOf(concept1);
//         const pos2 = text.indexOf(concept2);
        
//         if (pos1 === -1 || pos2 === -1) return "";
        
//         const start = Math.min(pos1 + concept1.length, pos2 + concept2.length);
//         const end = Math.max(pos1, pos2);
        
//         return text.substring(start, end);
//     }
    
//     // Identify relationship type based on text
//     function identifyRelationship(text) {
//         for (const {type, patterns} of RELATIONSHIP_PATTERNS) {
//             if (patterns.some(pattern => pattern.test(text))) {
//                 return type;
//             }
//         }
//         return "related"; // Default relationship type
//     }
    
//     // Generate a mind map data structure
//     function generateMindMap(concepts, relationships) {
//         // Create nodes
//         const nodes = concepts.map(concept => ({
//             id: concept,
//             label: concept
//         }));
        
//         // Create links
//         const links = relationships.map(rel => ({
//             source: rel.source,
//             target: rel.target,
//             type: rel.type
//         }));
        
//         return {
//             nodes,
//             links
//         };
//     }
    
//     // Process text to extract concepts and relationships
//     function processText(text) {
//         const concepts = extractNounPhrases(text);
//         const relationships = detectRelationships(text, concepts);
//         const mindMap = generateMindMap(concepts, relationships);
        
//         return mindMap;
//     }
    
//     // Public API
//     return {
//         processText
//     };
// })();



/**
 * Concept Extractor - Extracts key concepts and relationships from text
 */
const ConceptExtractor = (function() {
    // Common English stop words
    const STOP_WORDS = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what', 'when',
        'where', 'how', 'who', 'which', 'this', 'that', 'these', 'those', 'then',
        'just', 'so', 'than', 'such', 'both', 'through', 'about', 'for', 'is', 'of',
        'while', 'during', 'before', 'after', 'to', 'from', 'in', 'out', 'on', 'off',
        'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
        'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'some',
        'other', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
        'very', 'can', 'will', 'should', 'now', 'be', 'am', 'is', 'are', 'was', 'were',
        'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
        'would', 'could', 'should', 'shall', 'might', 'must', 'i', 'you', 'he', 'she', 
        'it', 'we', 'they', 'their', 'his', 'her', 'its', 'our', 'your'
    ]);
    
    // Relationship patterns (simplified)
    const RELATIONSHIP_PATTERNS = [
        {type: 'causes', patterns: [/causes/i, /leads to/i, /results in/i]},
        {type: 'part-of', patterns: [/part of/i, /component of/i, /belongs to/i]},
        {type: 'example', patterns: [/example of/i, /instance of/i, /such as/i]},
        {type: 'prerequisite', patterns: [/requires/i, /depends on/i, /needs/i]},
    ];
    
    // Extract noun phrases (basic approach)
    function extractNounPhrases(text) {
        // Split text into sentences
        const sentences = text.split(/[.!?]+/).filter(s => s.trim() !== '');
        
        // Process each sentence for potential noun phrases
        const phrases = [];
        const wordRegex = /\b[A-Za-z0-9][\w-]*\b/g;
        
        sentences.forEach(sentence => {
            // Simple approach: identify capitalized terms and multi-word phrases
            const words = sentence.match(wordRegex) || [];
            
            // Look for potential noun phrases (simplified)
            let currentPhrase = [];
            let isPotentialNounPhrase = false;
            
            words.forEach((word, i) => {
                const cleanWord = word.toLowerCase();
                
                // Skip stop words
                if (STOP_WORDS.has(cleanWord)) {
                    if (currentPhrase.length > 0) {
                        phrases.push(currentPhrase.join(' '));
                        currentPhrase = [];
                    }
                    return;
                }
                
                // Check if it's a potential noun (simplified heuristic)
                const nextWord = words[i + 1] ? words[i + 1].toLowerCase() : '';
                const isPotentialNoun = 
                    word[0] === word[0].toUpperCase() || // Capitalized
                    !STOP_WORDS.has(nextWord) || // Followed by non-stop word
                    word.length > 7; // Long words are likely important
                
                if (isPotentialNoun) {
                    currentPhrase.push(word);
                } else {
                    if (currentPhrase.length > 0) {
                        phrases.push(currentPhrase.join(' '));
                        currentPhrase = [];
                    }
                }
            });
            
            // Add the last phrase if exists
            if (currentPhrase.length > 0) {
                phrases.push(currentPhrase.join(' '));
            }
        });
        
        // Count occurrences to find important concepts
        return phrases.reduce((acc, phrase) => {
            acc[phrase] = (acc[phrase] || 0) + 1;
            return acc;
        }, {});
    }
    
    // Find relationships between concepts
    function findRelationships(text, conceptList) {
        const relationships = [];
        
        // Check each pair of concepts for potential relationships
        for (let i = 0; i < conceptList.length; i++) {
            for (let j = 0; j < conceptList.length; j++) {
                if (i === j) continue;
                
                const concept1 = conceptList[i];
                const concept2 = conceptList[j];
                
                // Find sentences containing both concepts
                const sentences = text.split(/[.!?]+/).filter(s => 
                    s.toLowerCase().includes(concept1.toLowerCase()) && 
                    s.toLowerCase().includes(concept2.toLowerCase())
                );
                
                // Check for relationship patterns
                sentences.forEach(sentence => {
                    for (const { type, patterns } of RELATIONSHIP_PATTERNS) {
                        for (const pattern of patterns) {
                            if (pattern.test(sentence)) {
                                relationships.push({
                                    source: concept1,
                                    target: concept2,
                                    type: type
                                });
                                return;
                            }
                        }
                    }
                    
                    // If no specific relationship found but concepts appear in same sentence
                    // assume a general relationship
                    if (sentences.length > 0 && relationships.every(r => 
                        r.source !== concept1 || r.target !== concept2)) {
                        relationships.push({
                            source: concept1,
                            target: concept2,
                            type: 'related'
                        });
                    }
                });
            }
        }
        
        return relationships;
    }
    
    // Process text and extract concepts and relationships
    function processText(text) {
        // Extract noun phrases
        const concepts = extractNounPhrases(text);
        
        // Get top concepts by frequency
        const topConcepts = Object.entries(concepts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([concept]) => concept);
        
        // Find relationships
        const relationships = findRelationships(text, topConcepts);
        
        // Generate nodes and links for visualization
        const nodes = topConcepts.map((concept, index) => ({
            id: `node-${index}`,
            label: concept,
            x: Math.random() * 500 - 250,
            y: Math.random() * 500 - 250
        }));
        
        const links = relationships.map((rel, index) => {
            const sourceNode = nodes.find(node => node.label === rel.source);
            const targetNode = nodes.find(node => node.label === rel.target);
            
            if (!sourceNode || !targetNode) return null;
            
            return {
                id: `link-${index}`,
                source: sourceNode.id,
                target: targetNode.id,
                type: rel.type
            };
        }).filter(link => link !== null);
        
        return { nodes, links };
    }
    
    // Add the processTextWithAI function
    async function processTextWithAI(text) {
        try {
            // This is a placeholder for actual API integration
            // In a real implementation, you would call an external API like OpenAI
            
            // For now, we'll use our basic implementation but with a delay to simulate API call
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Get basic processing result
                    const result = processText(text);
                    
                    // Add a few more sophisticated connections to simulate AI
                    const existingNodes = result.nodes;
                    
                    // If we have more than 3 nodes, try to add more meaningful connections
                    if (existingNodes.length > 3) {
                        const newLinks = [];
                        
                        // Add some hierarchical relationships
                        for (let i = 0; i < Math.min(3, existingNodes.length - 1); i++) {
                            newLinks.push({
                                id: `ai-link-${i}`,
                                source: existingNodes[0].id, // Connect from first node (often main topic)
                                target: existingNodes[i + 1].id,
                                type: ['part-of', 'example', 'prerequisite'][Math.floor(Math.random() * 3)]
                            });
                        }
                        
                        // Add the new AI-generated links
                        result.links = [...result.links, ...newLinks];
                    }
                    
                    resolve(result);
                }, 1000); // 1 second delay to simulate API call
            });
        } catch (error) {
            console.error("Error in AI processing:", error);
            // Fall back to basic processing
            return processText(text);
        }
    }
    
    // Public API
    return {
        processText,
        processTextWithAI
    };
})();