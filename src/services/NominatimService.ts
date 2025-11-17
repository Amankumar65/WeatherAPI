import { injectable } from "inversify";

@injectable()
export class NominatimService {
    private endpoint = "https://nominatim.openstreetmap.org/search";

    async findCity(cityName:string): Promise<any> {
        try{
            const params = new URLSearchParams({
                city: cityName,
                format: 'json',
                limit: '1'
            })

            const url = `${this.endpoint}?{params.toString()}`

            const response = await fetch(url,{
                method: 'GET',
                headers: {
                    "User-Agent": 'my-city-api/1.0'
                }
            })

            if(!response.ok){
                console.log("Nominatim returned non-200 status:", response.status)
                return null
            }

            const data = await response.json();

            if(Array.isArray(data) && data.length>0){
                return data[0]
            }

            return null;
        }catch (e){
            console.error("NominatimService error", e.message ?? e)
            return null;
        }
    }
}