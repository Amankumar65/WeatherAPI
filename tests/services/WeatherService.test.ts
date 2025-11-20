import { WeatherService } from "../../src/services/WeatherService"

describe('WeatherService', ()=>{
  const city = { name: 'TestCity', latitude: 1, longitude: 2 }

  afterEach(()=>{
    jest.restoreAllMocks()
  })

  test('concurrent getWeatherForCity calls share a single underlying fetch (debounce/in-flight)', async ()=>{
    const svc = new WeatherService()
    const insight = { city: 'TestCity', temperatureC: 10 }

    // mock fetchWeatherInsight to delay resolution so concurrent calls overlap
    const fetchMock = jest.spyOn(svc as any, 'fetchWeatherInsight').mockImplementation(() => {
      return new Promise((resolve) => setTimeout(()=> resolve(insight), 50))
    })

    const p1 = svc.getWeatherForCity(city as any)
    const p2 = svc.getWeatherForCity(city as any)
    const p3 = svc.getWeatherForCity(city as any)

    const results = await Promise.all([p1,p2,p3])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(results[0]).toEqual(insight)
    expect(results[1]).toEqual(insight)
    expect(results[2]).toEqual(insight)
  })

  test('caches results and reuses cached value without extra fetch', async ()=>{
    const svc = new WeatherService()
    const insight = { city: 'C', temperatureC: 5 }
    const fetchMock = jest.spyOn(svc as any, 'fetchWeatherInsight').mockResolvedValue(insight)

    const r1 = await svc.getWeatherForCity(city as any)
    const r2 = await svc.getWeatherForCity(city as any)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(r1).toEqual(insight)
    expect(r2).toEqual(insight)
  })

  test('respects TTL: expired entries cause a new fetch', async ()=>{
    const svc = new WeatherService()
    ;(svc as any).ttlMs = -1 // immediate expiry (ensure expiresAt is in the past)

    const first = { city: 'C', temperatureC: 1 }
    const second = { city: 'C', temperatureC: 2 }
    const fetchMock = jest.spyOn(svc as any, 'fetchWeatherInsight')
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second)

    const r1 = await svc.getWeatherForCity(city as any)
    const r2 = await svc.getWeatherForCity(city as any)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(r1).toEqual(first)
    expect(r2).toEqual(second)
  })

  test('evicts least-recently-used entries when cache exceeds maxSize', async ()=>{
    const svc = new WeatherService()
    ;(svc as any).maxSize = 2

    const c1 = { name: 'A', latitude: 0, longitude: 0 }
    const c2 = { name: 'B', latitude: 0, longitude: 0 }
    const c3 = { name: 'C', latitude: 0, longitude: 0 }

    jest.spyOn(svc as any, 'fetchWeatherInsight').mockImplementation(async (c:any)=> ({ city: c.name }))

    await svc.getWeatherForCity(c1 as any)
    await svc.getWeatherForCity(c2 as any)
    await svc.getWeatherForCity(c3 as any)

    const cache: Map<string, any> = (svc as any).cache
    expect(cache.size).toBe(2)
    expect(cache.has('A')).toBe(false)
    expect(cache.has('B')).toBe(true)
    expect(cache.has('C')).toBe(true)
  })

  test('fetchWeatherInsight transforms API response correctly and handles errors', async ()=>{
    const svc = new WeatherService()
    const raw = { current_weather: { temperature: 12, windspeed: 8, time: '2025-01-01T00:00' } }

    // mock global.fetch
    const origFetch = (globalThis as any).fetch
    ;(globalThis as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async ()=> raw })

    const out = await (svc as any).fetchWeatherInsight({ name: 'X', latitude:0, longitude:0 })
    expect(out).toBeDefined()
    expect(out.temperatureC).toBe(12)
    expect(out.temperatureF).toBe((12 * 9/5) + 32)
    expect(out.windspeedKmH).toBe(8)
    // WeatherService rounds the mph value; expect the rounded result
    expect(out.windspeedMpH).toBe(5)

    // non-OK
    ;(globalThis as any).fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 })
    const out2 = await (svc as any).fetchWeatherInsight({ name: 'X', latitude:0, longitude:0 })
    expect(out2).toBeNull()

    // exception
    ;(globalThis as any).fetch = jest.fn().mockRejectedValue(new Error('network'))
    const out3 = await (svc as any).fetchWeatherInsight({ name: 'X', latitude:0, longitude:0 })
    expect(out3).toBeNull()

    ;(globalThis as any).fetch = origFetch
  })
})

