import { CityService } from "../../src/services/CityService"

describe('CityService', ()=>{
  const nominatimMock: any = { findCity: async (name: string) => ({ lat: '1', lon: '2' }) }
  const weatherMock: any = { getWeatherForCity: async (city: any) => ({ city: city.name, temperatureC: 20, temperatureF: (20 * 9/5) + 32, windspeedKmH: 10, windspeedMpH: 6, windCategory: 'Light breeze', timeStamp: '2025-01-01T00:00' }) }
  let service: CityService

  beforeEach(()=>{
    service = new CityService(nominatimMock, weatherMock)
  })

  test('adds and lists city', async ()=>{
    const res = await service.addCity('Paris')
    expect(res.conflict).toBe(false)
    expect(res.city).toBeDefined()
    const list: any[] = service.listCities()
    expect(list.length).toBe(1)
    expect((list[0] as any).name).toBe('Paris')
  })

  test('prevents duplicate (case-insensitive)', async ()=>{
    await service.addCity('Berlin')
    const res = await service.addCity('berlin')
    expect(res.conflict).toBe(true)
  })

  test('deletes city', async ()=>{
    await service.addCity('Rome')
    const ok = service.deleteCity('Rome')
    expect(ok).toBe(true)
    expect(service.listCities()).toHaveLength(0)
  })

  test('delete returns false if not found', ()=>{
    const ok = service.deleteCity('NoCity')
    expect(ok).toBe(false)
  })

  test('getInsightForCity returns null when city not present', async ()=>{
    const r = await service.getInsightForCity('Unknown')
    expect(r).toBeNull()
  })

  test('getInsightForCity returns insight for existing city', async ()=>{
    await service.addCity('Mumbai')
    const insight: any = await service.getInsightForCity('Mumbai')
    expect(insight).toBeDefined()
    expect(insight.city).toBe('Mumbai')
    expect(insight.temperatureC).toBe(20)
    expect(insight.temperatureF).toBe((20 * 9/5) + 32)
    expect(insight.windspeedKmH).toBe(10)
    expect(insight.windspeedMpH).toBe(6)
    expect(insight.windCategory).toBe('Light breeze')
    expect(insight.timeStamp).toBe('2025-01-01T00:00')
  })
})
