import { inject, injectable } from "inversify";
import { TYPES } from "../types.js";
import { citySchema } from "../validators/cityValidator.js";
import { CityService } from "../services/CityService.js";

@injectable()
export class CityController {
    constructor(@inject(TYPES.CityService) private cityService: CityService){}

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
}