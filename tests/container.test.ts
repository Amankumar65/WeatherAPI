import { container } from "../src/container"
import { TYPES } from "../src/types"

describe('container', ()=>{
  test('resolves services and controller', ()=>{
    const svc = container.get(TYPES.CityService)
    const nom = container.get(TYPES.NominatimService)
    const ctrl = container.get(TYPES.CityController)
    expect(svc).toBeDefined()
    expect(nom).toBeDefined()
    expect(ctrl).toBeDefined()
  })
})
