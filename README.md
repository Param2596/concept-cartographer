# Concept Cartographer

Concept Cartographer is a local-first web application designed to help users visualize key concepts from pasted text in an interactive mind map format. The application extracts important concepts and relationships using natural language processing and presents them in a user-friendly interface.

## Features

- **Text Input**: Users can paste any block of text to extract key concepts.
- **Mind Map Visualization**: Automatically generates an interactive mind map based on the extracted concepts.
- **Local Storage**: Saves mind map data in the browser's local storage, allowing users to persist their work across sessions.
- **Interactive Elements**: Users can drag nodes and create custom links within the mind map.

## Project Structure

```
concept-cartographer
├── index.html          # Main HTML document
├── css
│   ├── main.css       # Main styles for the application
│   └── mindmap.css    # Styles specific to the mind map visualization
├── js
│   ├── app.js         # Entry point of the application
│   ├── concept-extractor.js  # Extracts key concepts from text
│   ├── mindmap-renderer.js   # Renders the mind map visualization
│   └── storage.js     # Functions for saving and retrieving data
├── assets
│   └── icons
│       └── favicon.svg # Favicon for the web application
└── README.md          # Documentation for the project
```

## Setup Instructions

1. Clone the repository to your local machine.
2. Open `index.html` in your web browser to run the application.
3. Paste your text into the input area and click the button to generate the mind map.

## Usage Guidelines

- Ensure that the text you paste is clear and contains distinct concepts for better extraction results.
- Use the interactive features of the mind map to explore relationships and organize your thoughts.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.