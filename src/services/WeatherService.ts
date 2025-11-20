import { injectable } from "inversify";
import { City, WeatherInsight } from "../models/types.js";

type CacheEntry = {
    value: WeatherInsight,
    expiresAt: number
}

@injectable()
export class WeatherService {
    private endpoint = "https://api.open-meteo.com/v1/forecast";
    private maxSize = 10;
    private ttlMs = 10 * 60 * 1000; // 10 minutes
    private cache = new Map<string, CacheEntry>();

    private inFlightRequests = new Map<string, {promise: Promise<WeatherInsight | null>, startedAt: number}>();

    private debounceTimeMs = 5000; // 5 seconds

    private cacheKey(city: City){
        return city.name;
    }

    private moveKeyToRecent(key: string){
        const v = this.cache.get(key);
        if(!v) return;
        this.cache.delete(key);
        this.cache.set(key, v);
    }

    private ensureCacheSizeLimit(){
        while(this.cache.size > this.maxSize){
            const oldestKey = this.cache.keys().next().value;
            if(!oldestKey) break;
            this.cache.delete(oldestKey);
        }
    }

    private isExpired(entry: CacheEntry){
        return Date.now() > entry.expiresAt;
    }

    async getWeatherForCity(city: City): Promise<WeatherInsight | null> {
        const key = this.cacheKey(city);

        // Check cache first
        const cached = this.cache.get(key);
        if(cached && !this.isExpired(cached)){
            // move to recent (LRU)
            this.moveKeyToRecent(key);
            console.log("Cache hit", cached); // debug for checking cache hits
            return cached.value;
        } else if (cached && this.isExpired(cached)){
            this.cache.delete(key);
        }

        // Debounce in-flight requests
        const inFlight = this.inFlightRequests.get(key);
        if(inFlight && (Date.now() - inFlight.startedAt) < this.debounceTimeMs){
            // If there's an in-flight request started within debounce time, return its promise
            console.log("Debouncing weather fetch for city:", city.name);
            return inFlight.promise;
        }

        // Create new fetch request
        const fetchPromise = this.fetchWeatherInsight(city).then((data)=>{
            const entry: CacheEntry = {
                // store fetched data in cache
                value: data,
                expiresAt: Date.now() + this.ttlMs
            };
            this.cache.set(key, entry);
            this.moveKeyToRecent(key);
            this.ensureCacheSizeLimit();
            return data;
        })
        .finally(()=>{
            // Clean up in-flight request entry
            this.inFlightRequests.delete(key);
        });

        this.inFlightRequests.set(key, {promise: fetchPromise, startedAt: Date.now()});

        return fetchPromise;
    }


    async fetchWeatherInsight(city: City): Promise<any> {
        try{
            const params = new URLSearchParams({
                latitude:city.latitude.toString(),
                longitude:city.longitude.toString(),
                current_weather: 'true'
            })

            const url = `${this.endpoint}?${params.toString()}`

            const response = await fetch(url,{
                method: 'GET',
                headers: {
                    "User-Agent": 'my-city-api/1.0'
                }
            })
            console.log('WEATHER API CALL:', city.name, "at", new Date().toISOString())

            if(!response.ok){
                console.log("Weather returned non-200 status:", response.status)
                return null
            }

            const data = await response.json();

            if(data){
                const rawData =  data.current_weather;

                 const windCategory = (windspeedKpH: number | null): string | null => {
                    if(windspeedKpH===null) return null;

                    if(windspeedKpH<1) return 'Calm'
                    if(windspeedKpH>=1 && windspeedKpH<=5) return 'Light air'
                    if(windspeedKpH>5 && windspeedKpH<=11) return 'Light breeze'
                    if(windspeedKpH>11 && windspeedKpH<=19) return 'Gentle breeze'
                    if(windspeedKpH>19 && windspeedKpH<=28) return 'Moderate breeze'
                    
                    return 'Strong Wind'
                }

                const insight: WeatherInsight = {
                    city: city.name,
                    temperatureC: rawData.temperature,
                    temperatureF: (rawData.temperature * 9/5) + 32,
                    windspeedKmH: rawData.windspeed,
                    windspeedMpH: parseFloat(Math.round(rawData.windspeed * 0.621371).toFixed(2)),
                    windCategory: windCategory(rawData.windspeed),
                    timeStamp: rawData.time,
                }

                return insight;

            }

            return null;
        }catch (e){
            console.error("WeatherService error", e.message ?? e)
            return null;
        }
    }
}