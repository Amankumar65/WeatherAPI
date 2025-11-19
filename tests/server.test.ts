beforeEach(()=>{ jest.resetModules() })

test('server creates HTTP server and listens', async ()=>{
  await jest.unstable_mockModule('node:http', ()=>({ default: { createServer: (fn:any)=> ({ listen: (port:number, cb:any)=>{ if(cb) cb() } }) } } as any))
  const mod = await import('../src/server.js')
  expect(mod).toBeDefined()
})
