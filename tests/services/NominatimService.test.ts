import { NominatimService } from "../../src/services/NominatimService"

describe('NominatimService', ()=>{
  let originalFetch: any
  beforeAll(()=>{ originalFetch = globalThis.fetch })
  afterAll(()=>{ globalThis.fetch = originalFetch })

  test('returns first result when fetch ok', async ()=>{
    globalThis.fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async ()=> [{ lat: '10', lon: '20' }] })
    const svc = new NominatimService()
    const r = await svc.findCity('X')
    expect(r).toEqual({ lat: '10', lon: '20' })
  })

  test('returns null when fetch not ok', async ()=>{
    globalThis.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 500 })
    const svc = new NominatimService()
    const r = await svc.findCity('X')
    expect(r).toBeNull()
  })
})
