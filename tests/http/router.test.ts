// Use unstable mocks to replace container and bodyParser before importing router
beforeEach(()=>{
  jest.resetModules()
})

test('router GET /api/v1/cities returns list', async ()=>{
  const { container } = await import('../../src/container.js')
  const { TYPES } = await import('../../src/types.js')
  // Rebind controller to a simple mock implementation for the test
  ;(container as any).unbind(TYPES.CityController)
  ;(container as any).bind(TYPES.CityController).toConstantValue({ handleListCities: ()=>({ status:200, body: [{ name: 'A' }] }) })
  const { router } = await import('../../src/http/router.js')

  const req: any = { url: '/api/v1/cities', method: 'GET', headers: { host: 'localhost:3000' } }
  const written: any = { head: null, body: null }
  const res: any = { writeHead: (s:number, h:any)=> written.head = s, end: (b:any)=> written.body = b }

  await router(req, res)
  expect(written.head).toBe(200)
  expect(JSON.parse(written.body)).toEqual([{ name: 'A' }])
})

test('router POST /api/v1/cities calls controller', async ()=>{
  const { container } = await import('../../src/container.js');
  const { TYPES } = await import('../../src/types.js');
  (container as any).unbind(TYPES.CityController)
  (container as any).bind(TYPES.CityController).toConstantValue({ handleAddCity: async (b:any)=> ({ status:201, body: { message: 'ok' } }) })
  const { router } = await import('../../src/http/router.js')
  const req: any = {
    url: '/api/v1/cities/',
    method: 'POST',
    headers: { host: 'localhost:3000' },
    on: (event: string, cb: any) => {
      if (event === 'data') cb(Buffer.from(JSON.stringify({ name: 'X' })))
      if (event === 'end') cb()
    }
  }
  const written: any = { head: null, body: null }
  const res: any = { writeHead: (s:number, h:any)=> written.head = s, end: (b:any)=> written.body = b }

  await router(req, res)
  expect(written.head).toBe(201)
  expect(JSON.parse(written.body)).toHaveProperty('message')
})
