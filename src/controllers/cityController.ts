import { inject, injectable } from "inversify";
import { TYPES } from "../types.js";
import { citySchema } from "../validators/cityValidator.js";
import { CityService } from "../services/CityService.js";
import { WeatherService } from "../services/WeatherService.js";

@injectable()
export class CityController {
    constructor(@inject(TYPES.CityService) private cityService: CityService,
    @inject(TYPES.WeatherService) private weatherService: WeatherService
){}

    async handleAddCity(body: any){
        const {error, value} = citySchema.validate(body, {abortEarly: false})

        if(error){
            return {status: 400, body: {error: error.details.map(d=>d.message)}}
        }

        const result = await this.cityService.addCity(value.name);

        if(result.conflict){
            return {
                status: 409,
                body: {
                    error: "City Already exists"
                }
            }
        }

        const city = result.city

        return {
            status: 201,
            body: {
                message: "City added successfully",
                data: {
                    name: city.name,
                    latitude: city.latitude,
                    longitude: city.longitude
                }
            }
        }
    }

    handleListCities(){
        const cities = this.cityService.listCities().map(c=>({
            name: c.name,
            latitude: c.latitude,
            longitude: c.longitude
        }))

        return {status: 200, body: cities}
    }

    handleDeleteCity(name: string){
        const ok = this.cityService.deleteCity(name)
        if(!ok) return { status: 404, body: {error: "City not found"}}

        return { status: 200, body: {
            message: "City deleted successfully"
        }}
    }

    handleGetInsightForCity = async (name: string) => {
        const insight = await this.cityService.getInsightForCity(name);

        if(!insight){
            return { status: 404, body: {error: "City not found"}}
        }

        return { status: 200, body: insight}
    }

    handleSearch(prefix: string) {

        if(!prefix || typeof prefix!=='string' ||prefix.trim().length === 0) {
            return {status: 400, body: { error: "Invalid prefix"} }
        }

        const cities = this.cityService.searchByPrefix(prefix).map(c=>({
            name: c.name,
            latitude: c.latitude,
            longitude: c.longitude
        }))

        return {status: 200, body: cities}
    }

    async handleStats(){
        const cities = this.cityService.listCities()
        if(cities.length===0){
            return { status: 200, body: {
                averageTemperature: null,
                averageWindspeed: null,
                count: 0
            }}
        }

        const results: Array<{ temperature: number, windspeed: number }> = []

        for(const city of cities){
            try{
                const weather = await this.weatherService.getWeatherForCity(city)
                if(weather){
                    results.push({ temperature: weather.temperatureC, windspeed: weather.windspeedKmH })
                }
            }catch(e){
                // skip cities that fail to fetch weather (we don't want one failure to block the entire stats)
                results.push(null);
            }
        }

        let temperatureSum = 0, windspeedSum = 0, temperatureCount = 0, windspeedCount = 0;

        for(const r of results){
            if(r){
                temperatureSum += r.temperature
                windspeedSum += r.windspeed
                temperatureCount++;
                windspeedCount++;
            }
        }

        const avgTemp = temperatureCount===0 ? null : temperatureSum / temperatureCount
        const avgWind = windspeedCount===0 ? null : windspeedSum / windspeedCount

        return { 
            status: 200, 
            body: {
                averageTemperature: avgTemp,
                averageWindspeed: avgWind,
                count: cities.length,
                weatherCounted: temperatureCount // Number of cities for which weather was successfully fetched
            }
        }
    }
}