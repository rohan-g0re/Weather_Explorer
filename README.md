# Weather Wisdom Explorer

## Project Overview

Weather Wisdom Explorer is a comprehensive weather application that enables users to search for locations worldwide, view current and historical weather data, save their favorite locations, and visualize weather patterns on an interactive map.

![Weather Wisdom Explorer](https://i.imgur.com/YourImageHere.png)

## Features

### Core Functionality

- **Location-based Weather Search**: Search for any location globally with autocomplete suggestions
- **Current Weather Display**: View detailed current weather conditions with intuitive visual indicators
- **Historical Weather Data**: Retrieve and analyze weather data for any date range in the past
- **Data Persistence**: Save weather records locally for future reference
- **Weather Visualization**: Visual representation of weather data through charts and maps
- **Data Export**: Export weather data in multiple formats (JSON, CSV, XML, PDF, Markdown)
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Interactive Map Features

- **Multiple Location Visualization**: View all saved locations on a single interactive map
- **Custom Markers**: Numbered markers that correspond to the location list for easy reference
- **Information Popups**: Click on markers to view detailed location information
- **Separate Location Card List**: Clean, organized display of all saved locations below the map
- **Dynamic Map Controls**: Zoom, pan, and navigate the map with intuitive controls

## Tech Stack

The application is built with modern web technologies for optimal performance and user experience:

### Core Technologies
- **React**: Frontend library for building the user interface
- **TypeScript**: Static typing for improved code quality and developer experience
- **Vite**: Build tool and development server with fast refresh
- **TailwindCSS**: Utility-first CSS framework for styling

### UI Components and Design
- **Shadcn UI**: Component library built on Radix UI primitives
- **Lucide React**: Icon library for weather and UI icons
- **Tailwind Merge**: For managing Tailwind class combinations

### Data Visualization
- **Leaflet.js**: Interactive maps for location visualization
- **Recharts**: Weather data chart visualization

### State Management and Data Handling
- **React Query**: For data fetching, caching, and state management
- **Local Storage**: For persisting user data

### External APIs
- **Open-Meteo API**: Weather data source for current and historical conditions
- **OpenStreetMap**: Map tiles for the location visualization

## Implementation Details

### Weather Data Retrieval

The application uses the Open-Meteo API to fetch current and historical weather data. This data is processed and normalized to provide consistent information across different time periods. Weather conditions include:

- Temperature (current, min/max, feels like)
- Humidity and pressure
- Wind speed and direction
- Cloud coverage
- Precipitation
- Visibility
- Sunrise and sunset times

### Map Implementation

The map functionality was implemented using Leaflet.js, which provides:

1. **Dynamic Marker Creation**: Custom markers with numbered indicators
2. **Responsive Map Container**: Automatically adjusts to viewport size
3. **Custom Popup Design**: Enhanced popup styling for better readability
4. **Optimized Map Controls**: User-friendly navigation controls
5. **Automatic Bounds Fitting**: Ensures all locations are visible on map load

The location list has been implemented as a separate card below the map, featuring:

- Matching numbered indicators that correspond to map markers
- Comprehensive location details including coordinates
- Hover effects for improved user interaction
- Responsive grid layout that adapts to different screen sizes

### Data Persistence

Weather data is saved to the browser's localStorage, allowing users to:

- Store unlimited weather records
- Access saved data between sessions
- Edit or delete saved records
- Export data in various formats

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```sh
git clone <repository-url>
```

2. Navigate to the project directory:
```sh
cd weather-wisdom-explorer
```

3. Install dependencies:
```sh
npm install
```

4. Start the development server:
```sh
npm run dev
```

5. Open your browser to `http://localhost:5173`

## Usage Guide

### Searching for Weather

1. Use the search box to find a location
2. Select a date range for historical data (optional)
3. Click "GET WEATHER" to retrieve weather information
4. View current conditions and historical data (if requested)
5. Save the weather data using the "Save" button

### Using the Map

1. Navigate to the "Map" tab to view all saved locations
2. Interact with the map by zooming in/out and panning
3. Click on markers to view location details
4. Refer to the location cards below the map for a complete list of saved locations

### Managing Weather Data

1. Use the "History" tab to view all saved weather records
2. Edit or delete records as needed
3. Export data in your preferred format

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Open-Meteo](https://open-meteo.com/) for providing free weather API
- [OpenStreetMap](https://www.openstreetmap.org/) for map data
- [Leaflet](https://leafletjs.com/) for mapping functionality
- [Shadcn UI](https://ui.shadcn.com/) for the component library
