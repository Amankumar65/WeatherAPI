import { inject, injectable } from "inversify";
import { TYPES } from "../types.js";
import { NominatimService } from "./NominatimService.js";
import { WeatherService } from "./WeatherService.js";
import { City, WeatherInsight } from "../models/types.js";

@injectable()
export class CityService {
    private cities:City[] = []

    constructor(
        @inject(TYPES.NominatimService) private nominatimService: NominatimService,
        @inject(TYPES.WeatherService) private weatherService: WeatherService
    ){}

    private insertSorted(city: City) {
        const key = city.name.toLowerCase();
        let low = 0, high = this.cities.length;
        while (low < high) {
            const mid = (low + high) >>> 1;
            if (this.cities[mid].name.toLowerCase() < key) low = mid + 1;
            else high = mid;
        }

        // Insert at index low
        this.cities.splice(low, 0, city);
    }

    async addCity(name: string){
        const exists = this.cities.find(c=>c.name.toLowerCase()===name.toLowerCase())

        if(exists) return {conflict: true}

        const nominatimRaw = await this.nominatimService.findCity(name)

        const city = {
            name,
            latitude: nominatimRaw.lat,
            longitude: nominatimRaw.lon
        }

        this.insertSorted(city)

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

        const insight = await this.weatherService.getWeatherForCity(city)

        return insight;
    }


    searchByPrefix(prefix: string): City[] {
        const pre = prefix.toLowerCase();

        // find first occurrence
        let low= 0, high = this.cities.length;

        while (low < high) {
            const mid = (low + high) >>> 1;
            const name = this.cities[mid].name.toLowerCase();

            // if name is less than prefix (lexographically), go right
            if (name < pre) low = mid + 1;
            else high = mid;
        }

        const result: City[] = [];

        // collect all matching entries
        for (let i = low; i < this.cities.length; i++) {
            if (this.cities[i].name.toLowerCase().startsWith(pre)) {
                result.push(this.cities[i]);
            } else {
                break; // since sorted, no more matches possible
            }
        }

        return result;
    }
}