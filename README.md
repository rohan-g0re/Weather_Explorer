# Weather Explorer

## Overview
Weather Explorer is a production-ready weather application that provides real-time and historical weather data visualization for global locations with an interactive map interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features
- Location-based global weather search with autocomplete
- Current and historical weather data fetching
- Interactive map with custom location markers
- Local data persistence
- Multi-format data export (JSON, CSV, XML, PDF, Markdown)
- Responsive design for all devices

## Technical Implementation

### Architecture
This application is built on a modern tech stack with an API-first approach:

1. **Frontend Framework**
   - **React** with **TypeScript** for type-safe component development
   - **Vite** build system with HMR for optimized development workflow

2. **API Integration**
   - **Open-Meteo API** suite implementation:
     - Geocoding API for location coordinate conversion
     - Forecast API for current weather conditions
     - Archive API for historical weather data retrieval
   - **React Query** for data fetching, caching and state management
   - Custom data normalization pipeline for consistent display formatting

3. **Data Visualization**
   - **Google Maps** component showing current location
   - **Leaflet.js** integration with **OpenStreetMap** tiles
   - Dynamic marker generation with location-based indexing
   - Recharts implementation for weather metrics visualization

4. **State Management**
   - Client-side persistence via **localStorage**
   - Optimized data flow with React Query
   - Custom data transformation utilities for unit conversions

5. **UI Implementation**
   - Component architecture with **Shadcn UI** (Radix UI primitives)
   - **TailwindCSS** for responsive styling with utility-first approach
   - **Lucide React** for vector iconography
   - Mobile-first responsive design methodology

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Setup
```sh
# Clone repository
git clone https://github.com/rohan-g0re/weather-wisdom-explorer.git

# Navigate to project directory
cd Weather_Explorer

# Install dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:8080` in your browser.

## Usage Guide

### Quick Start
1. **Search**: Enter location → optionally select date range → click "GET WEATHER" → optionally save current or historical data 
2. **View Map**: Navigate to Map tab to see all saved locations
3. **Manage Data**: Access History tab to view, edit, export or delete saved records

## Contributing
Contributions welcome via Pull Requests. Please ensure code passes linting and tests.

## License
[MIT](LICENSE)

## Acknowledgments
- [Open-Meteo](https://open-meteo.com/) - Weather API
- [OpenStreetMap](https://www.openstreetmap.org/) - Map data
- [Leaflet](https://leafletjs.com/) - Mapping library
- [Shadcn UI](https://ui.shadcn.com/) - UI components
