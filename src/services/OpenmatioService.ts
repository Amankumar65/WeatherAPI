import { injectable } from "inversify";

@injectable()
export class OpenMatioService {
    private endpoint = "https://api.open-meteo.com/v1/forecast";


    async findInsight(latitude:number,longitude: number): Promise<any> {
        try{
            const params = new URLSearchParams({
                latitude:latitude.toString(),
                longitude:longitude.toString(),
                current_weather: 'true'
            })

            const url = `${this.endpoint}?${params.toString()}`

            const response = await fetch(url,{
                method: 'GET',
                headers: {
                    "User-Agent": 'my-city-api/1.0'
                }
            })

            if(!response.ok){
                console.log("OpenMatio returned non-200 status:", response.status)
                return null
            }

            const data = await response.json();

            if(data){
                return data
            }

            return null;
        }catch (e){
            console.error("OpenMatioService error", e.message ?? e)
            return null;
        }
    }
}