# Weather Wisdom Explorer - Architecture

## Application Overview

Weather Wisdom Explorer is a React-based web application that allows users to:

- Search for locations and view current weather data
- View historical weather data for a selected location and date range
- Save weather data for future reference
- Edit and delete saved weather records
- Export weather data in various formats (JSON, CSV, XML, PDF, MD)
- View locations on a map

## Tech Stack

The application is built with the following technologies:

### Core Technologies
- **React**: Frontend library for building the user interface
- **TypeScript**: Adds static typing to improve code quality and developer experience
- **Vite**: Build tool and development server with fast refresh
- **TailwindCSS**: Utility-first CSS framework for styling

### UI Components and Design
- **Shadcn UI**: Component library built on Radix UI primitives
- **Radix UI**: Unstyled, accessible components
- **Lucide React**: Icon library
- **class-variance-authority**: For creating variant components
- **tailwind-merge**: For merging Tailwind classes
- **clsx**: For conditionally joining class names

### State Management and Data Fetching
- **React Query**: For handling server state, caching, and data fetching
- **React Hook Form**: For form state management and validation
- **Zod**: For data validation

### Routing
- **React Router DOM**: For client-side routing

### Data Visualization
- **Recharts**: For weather data visualization

### Notifications
- **Sonner**: For toast notifications

## Application Structure

### Directory Structure

```
src/
├── components/        # React components
│   ├── ui/            # Shadcn UI components
│   ├── CurrentWeather.tsx
│   ├── DateRangePicker.tsx
│   ├── EditWeatherRecord.tsx
│   ├── LocationSearch.tsx
│   ├── SimpleMap.tsx
│   └── WeatherHistory.tsx
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and API client
│   ├── api.ts         # API client for weather data
│   ├── export-utils.ts # Functions for exporting data
│   ├── types.ts       # TypeScript type definitions
│   ├── utils.ts       # General utility functions
│   └── weather-utils.ts # Weather-specific utility functions
├── pages/             # Application pages/routes
│   ├── Index.tsx      # Main dashboard page
│   └── NotFound.tsx   # 404 page
├── App.css            # App-specific styles
├── App.tsx            # Main application component
├── index.css          # Global styles (Tailwind imports)
├── main.tsx           # Application entry point
└── vite-env.d.ts      # TypeScript environment declarations
```

## Core Components

### App Component (`App.tsx`)
The root component that sets up:
- React Query client for data fetching
- React Router for routing
- UI providers (Tooltip, Toast)

### Main Page (`Index.tsx`)
The primary interface containing:
- Location search
- Current weather display
- Historical weather search with date range picker
- Weather data management (save, edit, delete)
- Data visualization
- Export functionality

### Key Feature Components

- **LocationSearch**: Autocomplete search for locations
- **CurrentWeather**: Display current weather conditions
- **DateRangePicker**: Select date ranges for historical data
- **WeatherHistory**: Display and visualize historical weather data
- **EditWeatherRecord**: Form for editing saved weather records
- **SimpleMap**: Display location on a map

## Data Flow

1. User searches for a location using the `LocationSearch` component
2. API calls are made through functions in `api.ts`
3. Weather data is retrieved and displayed in the UI
4. User can save data to local storage
5. Saved data can be viewed, edited, deleted, or exported

## API Integration

The application is designed to work with the OpenWeatherMap API, with endpoints for:
- Location search (geocoding)
- Current weather
- Historical weather

However, for demonstration purposes, the application currently uses simulated mock data that mimics API responses.

## State Management

- React's built-in useState and useEffect hooks for component-level state
- React Query for server state management
- Local Storage for persistent data storage

## Data Models

The application uses several key data types:

- **WeatherLocation**: Location data (name, coordinates, country)
- **WeatherData**: Weather information including temperature, humidity, etc.
- **WeatherCondition**: Weather conditions (clear, cloudy, etc.)
- **DateRange**: Selected date period for historical data
- **LocationSearchResult**: Search result from geocoding API

## Styling Approach

The application uses a combination of:
- TailwindCSS for utility-based styling
- Custom CSS for specific effects (glass cards)
- Dynamic backgrounds based on current weather conditions 