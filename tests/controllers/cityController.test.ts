import { CityController } from "../../src/controllers/cityController"

describe('CityController', ()=>{
  test('handleAddCity returns 400 for invalid payload', async ()=>{
    const svc: any = { addCity: async ()=> ({conflict:false, city:{name:'X', latitude:1, longitude:2}}), listCities: ()=>[], deleteCity: ()=>true }
    const controller = new CityController(svc)
    const res = await controller.handleAddCity({})
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  test('handleAddCity success', async ()=>{
    const svc: any = { addCity: async (name:string)=> ({conflict:false, city:{name, latitude:1, longitude:2}}), listCities: ()=>[], deleteCity: ()=>true }
    const controller = new CityController(svc)
    const res = await controller.handleAddCity({ name: 'Paris' })
    expect(res.status).toBe(201)
    expect(res.body.message).toMatch(/added successfully/)
  })

  test('handleDeleteCity returns 404 when not found', ()=>{
    const svc: any = { addCity: async ()=>{}, listCities: ()=>[], deleteCity: ()=>false }
    const controller = new CityController(svc)
    const res = controller.handleDeleteCity('NoCity')
    expect(res.status).toBe(404)
  })

  test('handleDeleteCity returns message on success', ()=>{
    const svc: any = { addCity: async ()=>{}, listCities: ()=>[], deleteCity: ()=>true }
    const controller = new CityController(svc)
    const res = controller.handleDeleteCity('City')
    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/deleted successfully/)
  })

  test('handleGetInsightForCity returns 404 when not found', async ()=>{
    const svc: any = { getInsightForCity: async ()=> null }
    const controller = new CityController(svc)
    const res = await controller.handleGetInsightForCity('NoCity')
    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })

  test('handleGetInsightForCity returns insight on success', async ()=>{
    const insight = { city: 'X', temperatureC: 10 }
    const svc: any = { getInsightForCity: async ()=> insight }
    const controller = new CityController(svc)
    const res = await controller.handleGetInsightForCity('X')
    expect(res.status).toBe(200)
    expect(res.body).toEqual(insight)
  })
})
