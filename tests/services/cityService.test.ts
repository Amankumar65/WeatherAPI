import { CityService } from "../../src/services/CityService"

describe('CityService', ()=>{
  const nominatimMock: any = { findCity: async (name: string) => ({ lat: '1', lon: '2' }) }
  let service: CityService

  beforeEach(()=>{
    service = new CityService(nominatimMock)
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
})
