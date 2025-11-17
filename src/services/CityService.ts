import { inject, injectable } from "inversify";
import { TYPES } from "../types.js";
import { NominatimService } from "./nominatimService.js";

@injectable()
export class CityService {
    private cities = []

    constructor(
        @inject(TYPES.NominatimService) private nominatimService: NominatimService
    ){}

    async addCity(name: string){
        const exists = this.cities.find(c=>c.name.toLowerCase()===name.toLowerCase())

        if(exists) return {conflict: true}

        const nominatimRaw = await this.nominatimService.findCity(name)

        const city = {
            name,
            latitude: nominatimRaw[0].lat,
            longitude: nominatimRaw[0].lon
        }

        this.cities.push(city)

        return {conflict: false, city}
    }

    listCities(){
        return [...this.cities]
    }

    deleteCity(name: string): boolean {
        const cityName = this.cities.findIndex(c=>c.name===name)
        if(cityName===-1) return false
        return true
    }
}