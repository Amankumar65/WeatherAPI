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
  // Mock the container module before importing router so router gets the mocked controller
  await jest.unstable_mockModule('../../src/container.js', () => ({ container: { get: ()=>({ handleAddCity: async (b:any)=> ({ status:201, body: { message: 'ok' } }) }) } } as any))
  const { router } = await import('../../src/http/router.js')
  const req: any = {
    url: '/api/v1/cities/',
    method: 'POST',
    headers: { host: 'localhost:3000' },
    on: (event: string, cb: any) => {
      if (event === 'data') cb(Buffer.from(JSON.stringify({ name: 'Alex' })))
      if (event === 'end') cb()
    }
  }
  const written: any = { head: null, body: null }
  const res: any = { writeHead: (s:number, h:any)=> written.head = s, end: (b:any)=> written.body = b }

  await router(req, res)
  // debug output if test fails
  console.log('DEBUG body:', written.body)
  expect(written.head).toBe(201)
  expect(JSON.parse(written.body)).toHaveProperty('message')
})

test('router GET /api/v1/cities/:name/insight returns 404 when not found', async ()=>{
  const { container } = await import('../../src/container.js')
  const { TYPES } = await import('../../src/types.js')
  ;(container as any).unbind(TYPES.CityController)
  ;(container as any).bind(TYPES.CityController).toConstantValue({ handleGetInsightForCity: async (name:any)=> ({ status:404, body: { error: 'City not found' } }) })
  const { router } = await import('../../src/http/router.js')

  const req: any = { url: '/api/v1/cities/Nowhere/insight', method: 'GET', headers: { host: 'localhost:3000' } }
  const written: any = { head: null, body: null }
  const res: any = { writeHead: (s:number, h:any)=> written.head = s, end: (b:any)=> written.body = b }

  await router(req, res)
  expect(written.head).toBe(404)
  expect(JSON.parse(written.body)).toHaveProperty('error')
})

test('router GET /api/v1/cities/:name/insight returns data on success', async ()=>{
  const { container } = await import('../../src/container.js')
  const { TYPES } = await import('../../src/types.js')
  ;(container as any).unbind(TYPES.CityController)
  ;(container as any).bind(TYPES.CityController).toConstantValue({ handleGetInsightForCity: async (name:any)=> ({ status:200, body: { city: name, temperatureC: 5 } }) })
  const { router } = await import('../../src/http/router.js')

  const req: any = { url: '/api/v1/cities/Paris/insight', method: 'GET', headers: { host: 'localhost:3000' } }
  const written: any = { head: null, body: null }
  const res: any = { writeHead: (s:number, h:any)=> written.head = s, end: (b:any)=> written.body = b }

  await router(req, res)
  expect(written.head).toBe(200)
  expect(JSON.parse(written.body)).toHaveProperty('city','Paris')
})
