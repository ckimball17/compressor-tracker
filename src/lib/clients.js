
export function normalizeClient(raw) {
  const id = raw && raw.id ? String(raw.id) : `unknown-${Math.random().toString(36).slice(2, 8)}`;
  const name = raw && raw.name ? String(raw.name) : 'Unknown Client';
  const phone = raw && raw.phone ? String(raw.phone) : null;
  const email = raw && raw.email ? String(raw.email) : null;
  const billingAddress = raw && raw.billingAddress ? String(raw.billingAddress) : null;
  const compressorModel = raw && raw.compressorModel ? String(raw.compressorModel) : 'Unknown Model';
  const nextMaintenanceDate = raw && raw.nextMaintenanceDate ? String(raw.nextMaintenanceDate) : null;

  let location = { lat: null, lng: null };
  if (raw && raw.location && typeof raw.location === 'object') {
    const lat = Number(raw.location.lat);
    const lng = Number(raw.location.lng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) location = { lat, lng };
  }
  return { id, name, phone, email, billingAddress, compressorModel, nextMaintenanceDate, location };
}

export function isValidClientForMarker(client) {
  return !!(client && client.location &&
    typeof client.location.lat === 'number' &&
    typeof client.location.lng === 'number' &&
    !Number.isNaN(client.location.lat) &&
    !Number.isNaN(client.location.lng));
}

export function normalizeClientsPayload(payload) {
  let rawArray = [];
  if (Array.isArray(payload)) rawArray = payload;
  else if (payload && Array.isArray(payload.clients)) rawArray = payload.clients;
  else if (payload && Array.isArray(payload.data)) rawArray = payload.data;
  else throw new Error('Unexpected payload shape from API — expected array or { clients: [...] }');
  return rawArray.map(normalizeClient);
}

export const MOCK_CLIENTS = [
  {
    id: 'ACCT-0001',
    name: 'Acme Industrial',
    phone: '555-1010',
    email: 'pm@acme.example',
    billingAddress: '123 Industrial Way, City A, ST',
    compressorModel: 'AS 7',
    nextMaintenanceDate: '2025-10-01',
    location: { lat: 34.0522, lng: -118.2437 }
  },
  {
    id: 'ACCT-0002',
    name: 'Oceanic Foods',
    phone: '555-2020',
    email: 'service@oceanic.example',
    billingAddress: '45 Harbor Dr, City B, ST',
    compressorModel: 'CSD 85',
    nextMaintenanceDate: '2025-09-15',
    location: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: 'ACCT-0003',
    name: 'Valley Construction',
    phone: null,
    email: null,
    billingAddress: '678 Construction Rd, City C, ST',
    compressorModel: 'CD 60',
    nextMaintenanceDate: null,
    location: { lat: 36.7783, lng: -119.4179 }
  }
];
