export interface City {
    name: string;
    latitude: number;
    longitude: number;
}

export interface WeatherInsight {
    city: string;
    temperatureC: number | null;
    temperatureF: number | null;
    windspeedKmH: number | null;
    windspeedMpH: number | null;
    windCategory: string | null;
    timeStamp: string | null;
}