
import { normalizeClient, isValidClientForMarker, normalizeClientsPayload } from '../lib/clients'

test('normalizeClient fills defaults and parses numbers', () => {
  const raw = { id: 1, name: 2, location: { lat: '33.3', lng: -118.1 } }
  const n = normalizeClient(raw)
  expect(n.id).toBe('1')
  expect(n.name).toBe('2')
  expect(n.location.lat).toBeCloseTo(33.3)
  expect(n.location.lng).toBeCloseTo(-118.1)
})

test('isValidClientForMarker true/false cases', () => {
  expect(isValidClientForMarker({ location: { lat: 1, lng: 2 } })).toBe(true)
  expect(isValidClientForMarker({ location: { lat: 'x', lng: 2 } })).toBe(false)
  expect(isValidClientForMarker({})).toBe(false)
})

test('normalizeClientsPayload accepts array and {clients:[]}', () => {
  const arr = [{ id:'a', location:{lat:1,lng:2} }]
  const obj = { clients: arr }
  expect(Array.isArray(normalizeClientsPayload(arr))).toBe(true)
  expect(normalizeClientsPayload(obj)[0].id).toBe('a')
})
