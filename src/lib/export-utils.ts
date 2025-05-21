
import { WeatherData } from "./types";

// Export to CSV
export function exportToCSV(data: WeatherData[]): string {
  if (!data.length) return '';
  
  // Define CSV headers
  const headers = [
    "ID", "Location Name", "Latitude", "Longitude", "Date", "Temperature", 
    "Feels Like", "Min Temp", "Max Temp", "Pressure", "Humidity", 
    "Visibility", "Wind Speed", "Wind Direction", "Clouds", "Weather Condition"
  ];
  
  // Create CSV content with headers
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = [
      item.id || '',
      item.location.name,
      item.location.lat,
      item.location.lon,
      item.date,
      item.temp,
      item.feels_like,
      item.temp_min,
      item.temp_max,
      item.pressure,
      item.humidity,
      item.visibility,
      item.wind_speed,
      item.wind_deg,
      item.clouds,
      item.weather[0]?.description || ''
    ];
    
    // Format row and escape values that might contain commas
    const formattedRow = row.map(value => {
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    
    csv += formattedRow.join(',') + '\n';
  });
  
  return csv;
}

// Export to JSON
export function exportToJSON(data: WeatherData[]): string {
  return JSON.stringify(data, null, 2);
}

// Export to XML
export function exportToXML(data: WeatherData[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8" ?>\n<WeatherData>\n';
  
  data.forEach(item => {
    xml += '  <WeatherRecord>\n';
    xml += `    <ID>${item.id || ''}</ID>\n`;
    xml += '    <Location>\n';
    xml += `      <Name>${escapeXml(item.location.name)}</Name>\n`;
    xml += `      <Latitude>${item.location.lat}</Latitude>\n`;
    xml += `      <Longitude>${item.location.lon}</Longitude>\n`;
    xml += `      <Country>${escapeXml(item.location.country || '')}</Country>\n`;
    if (item.location.state) {
      xml += `      <State>${escapeXml(item.location.state)}</State>\n`;
    }
    xml += '    </Location>\n';
    xml += `    <Date>${item.date}</Date>\n`;
    xml += `    <Temperature>${item.temp}</Temperature>\n`;
    xml += `    <FeelsLike>${item.feels_like}</FeelsLike>\n`;
    xml += `    <MinTemp>${item.temp_min}</MinTemp>\n`;
    xml += `    <MaxTemp>${item.temp_max}</MaxTemp>\n`;
    xml += `    <Pressure>${item.pressure}</Pressure>\n`;
    xml += `    <Humidity>${item.humidity}</Humidity>\n`;
    xml += `    <Visibility>${item.visibility}</Visibility>\n`;
    xml += `    <Wind>\n`;
    xml += `      <Speed>${item.wind_speed}</Speed>\n`;
    xml += `      <Direction>${item.wind_deg}</Direction>\n`;
    xml += '    </Wind>\n';
    xml += `    <Clouds>${item.clouds}</Clouds>\n`;
    xml += '    <WeatherConditions>\n';
    item.weather.forEach(condition => {
      xml += '      <Condition>\n';
      xml += `        <ID>${condition.id}</ID>\n`;
      xml += `        <Main>${escapeXml(condition.main)}</Main>\n`;
      xml += `        <Description>${escapeXml(condition.description)}</Description>\n`;
      xml += `        <Icon>${condition.icon}</Icon>\n`;
      xml += '      </Condition>\n';
    });
    xml += '    </WeatherConditions>\n';
    xml += '  </WeatherRecord>\n';
  });
  
  xml += '</WeatherData>';
  return xml;
}

// Export to Markdown
export function exportToMarkdown(data: WeatherData[]): string {
  let md = '# Weather Data Export\n\n';
  
  data.forEach((item, index) => {
    md += `## Record ${index + 1}: ${item.location.name}\n\n`;
    md += `- **Date**: ${new Date(item.date).toLocaleDateString()}\n`;
    md += `- **Location**: ${item.location.name}, ${item.location.country || ''} ${item.location.state ? `(${item.location.state})` : ''}\n`;
    md += `- **Coordinates**: ${item.location.lat.toFixed(4)}, ${item.location.lon.toFixed(4)}\n`;
    md += `- **Temperature**: ${(item.temp - 273.15).toFixed(1)}°C / ${((item.temp - 273.15) * 9/5 + 32).toFixed(1)}°F\n`;
    md += `- **Feels Like**: ${(item.feels_like - 273.15).toFixed(1)}°C\n`;
    md += `- **Min/Max**: ${(item.temp_min - 273.15).toFixed(1)}°C / ${(item.temp_max - 273.15).toFixed(1)}°C\n`;
    md += `- **Humidity**: ${item.humidity}%\n`;
    md += `- **Pressure**: ${item.pressure} hPa\n`;
    md += `- **Wind**: ${item.wind_speed.toFixed(1)} m/s, ${item.wind_deg}°\n`;
    md += `- **Conditions**: ${item.weather.map(w => w.description).join(', ')}\n\n`;
  });
  
  return md;
}

// Download file
export function downloadFile(content: string, fileName: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

// Export data in specified format
export function exportData(data: WeatherData[], format: string, fileName?: string): void {
  if (!data.length) return;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  let content = '';
  let contentType = '';
  let extension = '';
  
  switch (format.toLowerCase()) {
    case 'csv':
      content = exportToCSV(data);
      contentType = 'text/csv';
      extension = 'csv';
      break;
    case 'json':
      content = exportToJSON(data);
      contentType = 'application/json';
      extension = 'json';
      break;
    case 'xml':
      content = exportToXML(data);
      contentType = 'application/xml';
      extension = 'xml';
      break;
    case 'md':
      content = exportToMarkdown(data);
      contentType = 'text/markdown';
      extension = 'md';
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
  
  const defaultFileName = `weather-data-${timestamp}.${extension}`;
  downloadFile(content, fileName || defaultFileName, contentType);
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, match => {
    switch (match) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return match;
    }
  });
}
