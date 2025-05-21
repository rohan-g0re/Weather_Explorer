
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, FileDown } from 'lucide-react';
import { WeatherData } from '@/lib/types';
import { formatDateForDisplay, convertKelvinToCelsius } from '@/lib/weather-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportData } from '@/lib/export-utils';

interface WeatherHistoryProps {
  weatherData: WeatherData[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (format: string) => void;
}

const WeatherHistory: React.FC<WeatherHistoryProps> = ({ weatherData, onEdit, onDelete, onExport }) => {
  const [selectedData, setSelectedData] = useState<WeatherData | null>(null);

  if (weatherData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No weather history available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Weather History</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-1" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onExport('json')}>
              JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('csv')}>
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('xml')}>
              XML
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('md')}>
              Markdown
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weatherData.map((data) => (
                <TableRow key={data.id}>
                  <TableCell className="font-medium">
                    {data.location.name}
                    <div className="text-xs text-muted-foreground">
                      {data.location.country}
                    </div>
                  </TableCell>
                  <TableCell>{formatDateForDisplay(data.date)}</TableCell>
                  <TableCell>{Math.round(convertKelvinToCelsius(data.temp))}°C</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <img
                        src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
                        alt={data.weather[0].description}
                        className="w-8 h-8 mr-1"
                      />
                      <span className="capitalize">{data.weather[0].description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(data.id!)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(data.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedData(data)}
                          >
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Weather Details</DialogTitle>
                          </DialogHeader>
                          {selectedData && (
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <img
                                  src={`https://openweathermap.org/img/wn/${selectedData.weather[0].icon}@2x.png`}
                                  alt={selectedData.weather[0].description}
                                  className="w-16 h-16 mr-4"
                                />
                                <div>
                                  <h3 className="text-lg font-semibold">{selectedData.location.name}</h3>
                                  <p className="text-gray-500">{formatDateForDisplay(selectedData.date)}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Temperature</p>
                                  <p>{Math.round(convertKelvinToCelsius(selectedData.temp))}°C</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Feels Like</p>
                                  <p>{Math.round(convertKelvinToCelsius(selectedData.feels_like))}°C</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Min/Max</p>
                                  <p>{Math.round(convertKelvinToCelsius(selectedData.temp_min))}°C / 
                                  {Math.round(convertKelvinToCelsius(selectedData.temp_max))}°C</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Humidity</p>
                                  <p>{selectedData.humidity}%</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Wind</p>
                                  <p>{Math.round(selectedData.wind_speed * 3.6)} km/h</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Pressure</p>
                                  <p>{selectedData.pressure} hPa</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherHistory;
