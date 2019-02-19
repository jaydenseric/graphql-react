import FormData from 'formdata-node'
import t from 'tap'
import { hashObject } from '../universal/hashObject'

// Global FormData polyfill.
global.FormData = FormData

t.test('hashObject() with an object', t => {
  const object = { a: 1, b: 2 }

  const hash1 = hashObject(object)

  t.type(hash1, 'string', 'Hash type')

  const hash2 = hashObject(object)

  t.equals(hash1, hash2, 'Deterministic hash')

  object.b = 3

  const hash3 = hashObject(object)

  t.notEquals(hash2, hash3, 'Property values affect the hash')

  t.end()
})

t.test('hashObject() with a FormData instance', t => {
  const form1 = new FormData()
  const form2 = new FormData()

  form1.append('1', 'a')
  form2.append('1', 'b')

  const hash1 = hashObject(form1)
  const hash2 = hashObject(form1)
  const hash3 = hashObject(form2)

  t.type(hash1, 'string', 'Hash type')
  t.equals(hash1, hash2, 'Deterministic hash')
  t.notEquals(hash2, hash3, 'Fields determine hash')
  t.end()
})
