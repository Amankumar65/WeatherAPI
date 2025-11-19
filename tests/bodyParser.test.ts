import { parseJsonBody } from "../src/bodyParser";

describe('parseJsonBody', ()=>{
  test('parses JSON body', async ()=>{
    const req: any = {
      on: (event: string, cb: any) => {
        if(event === 'data') cb(Buffer.from('{"a":1}'))
        if(event === 'end') cb()
      }
    }

    const result = await parseJsonBody(req as any)
    expect(result).toEqual({a:1})
  })

  test('returns empty object when no body', async ()=>{
    const req: any = { on: (event: string, cb: any)=>{ if(event==='data'){} if(event==='end') cb() } }
    const result = await parseJsonBody(req as any)
    expect(result).toEqual({})
  })

  test('rejects invalid json', async ()=>{
    const req: any = {
      on: (event: string, cb: any) => {
        if(event === 'data') cb(Buffer.from('invalid'))
        if(event === 'end') cb()
      }
    }
    await expect(parseJsonBody(req as any)).rejects.toThrow(/Invalid JSON/)
  })
})
