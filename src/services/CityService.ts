import { inject, injectable } from "inversify";
import { TYPES } from "../types.js";
import { NominatimService } from "./NominatimService.js";
import { OpenMatioService } from "./OpenmatioService.js";
import { timeStamp } from "console";

interface City {
    name: string;
    latitude: number;
    longitude: number;
}

@injectable()
export class CityService {
    private cities:City[] = []

    constructor(
        @inject(TYPES.NominatimService) private nominatimService: NominatimService,
        @inject(TYPES.OpenMatioService) private openMatioService: OpenMatioService
    ){}

    async addCity(name: string){
        const exists = this.cities.find(c=>c.name.toLowerCase()===name.toLowerCase())

        if(exists) return {conflict: true}

        const nominatimRaw = await this.nominatimService.findCity(name)

        const city = {
            name,
            latitude: nominatimRaw.lat,
            longitude: nominatimRaw.lon
        }

        this.cities.push(city)

        return {conflict: false, city}
    }

    listCities(){
        return [...this.cities]
    }

    deleteCity(name: string): boolean {
        const idx = this.cities.findIndex((c: any) => c.name.toLowerCase() === name.toLowerCase())
        if (idx === -1) return false
        this.cities.splice(idx, 1)
        return true
    }

    async getInsightForCity(name: string) {
        const city = this.cities.find(c=>c.name.toLowerCase()===name.toLowerCase())
        if(!city) return null;

        const openMatioRaw = await this.openMatioService.findInsight(city.latitude, city.longitude)

        const windCategory = (windspeedKpH: number | null): string | null => {

            if(windspeedKpH===null) return null;

            if(windspeedKpH<1) return 'Calm'
            if(windspeedKpH>=1 && windspeedKpH<=5) return 'Light air'
            if(windspeedKpH>5 && windspeedKpH<=11) return 'Light breeze'
            if(windspeedKpH>11 && windspeedKpH<=19) return 'Gentle breeze'
            if(windspeedKpH>19 && windspeedKpH<=28) return 'Moderate breeze'
            
            return 'Strong Wind'
        }

        const insight = {
            city: city.name,
            temperatureC : openMatioRaw?.current_weather?.temperature ?? null,
            temperatureF : openMatioRaw?.current_weather?.temperature ? (openMatioRaw.current_weather.temperature * 9/5) + 32 : null,
            windspeedKpH: openMatioRaw?.current_weather?.windspeed ?? null,
            windspeedMpH: openMatioRaw?.current_weather?.windspeed ? parseFloat(Math.round(openMatioRaw.current_weather.windspeed * 0.621371).toFixed(2)) : null,
            windCategory: windCategory(openMatioRaw?.current_weather?.windspeed ?? null),
            timeStamp: openMatioRaw?.current_weather?.time ?? null
        }

        return insight;
    }
}