import { TYPES } from "../src/types"

describe('TYPES', ()=>{
  test('contains expected symbols', ()=>{
    expect(TYPES.CityController).toBeDefined()
    expect(typeof TYPES.CityController).toBe('symbol')
    expect(TYPES.CityService).toBeDefined()
    expect(TYPES.NominatimService).toBeDefined()
  })
})
