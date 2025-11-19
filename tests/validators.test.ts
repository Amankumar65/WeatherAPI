import { citySchema } from "../src/validators/cityValidator"

describe('citySchema', ()=>{
  test('validates good payload', ()=>{
    const { error, value } = citySchema.validate({ name: 'London' })
    expect(error).toBeUndefined()
    expect(value.name).toBe('London')
  })

  test('rejects short name', ()=>{
    const { error } = citySchema.validate({ name: 'A' })
    expect(error).toBeDefined()
  })
})
