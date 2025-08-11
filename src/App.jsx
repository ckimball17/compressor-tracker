
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { normalizeClientsPayload, isValidClientForMarker, MOCK_CLIENTS } from './lib/clients'

async function fetchClientsFromApi(endpoint = '/api/clients', timeoutMs = 10000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(endpoint, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`HTTP ${res.status} ${res.statusText} — ${text.slice(0,200)}`)
    }

    const ct = (res.headers.get('content-type') || '').toLowerCase()
    if (ct.includes('json')) return normalizeClientsPayload(await res.json())

    const text = await res.text()
    try {
      return normalizeClientsPayload(JSON.parse(text))
    } catch {
      console.warn('Non-JSON from /api/clients, using built-in mock data.')
      return normalizeClientsPayload(MOCK_CLIENTS)
    }
  } catch (e) {
    console.warn('Fetch failed, using built-in mock data.', e)
    return normalizeClientsPayload(MOCK_CLIENTS)
  } finally {
    clearTimeout(timer)
  }
}

export default function App({ apiEndpoint = '/api/clients' }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)

  const loadClients = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await fetchClientsFromApi(apiEndpoint, 10000)
      setClients(data)
    } catch (e) {
      setError(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint])

  useEffect(() => { loadClients() }, [loadClients])

  const filtered = useMemo(() => {
    const q = (searchTerm||'').toLowerCase()
    if (!q) return clients
    return clients.filter(c =>
      (c.name||'').toLowerCase().includes(q) ||
      (c.compressorModel||'').toLowerCase().includes(q) ||
      (c.billingAddress||'').toLowerCase().includes(q)
    )
  }, [clients, searchTerm])

  const mapCenter = useMemo(() => {
    const valid = clients.filter(isValidClientForMarker)
    if (!valid.length) return { lat: 37.7749, lng: -122.4194 }
    const lat = valid.reduce((s,c)=>s+c.location.lat,0)/valid.length
    const lng = valid.reduce((s,c)=>s+c.location.lng,0)/valid.length
    return { lat, lng }
  }, [clients])

  const googleMapsKey = (typeof window !== 'undefined' && window.__REACT_APP_GOOGLE_MAPS_API_KEY__) || null

  function getDirectionsUrl(c) {
    if (!isValidClientForMarker(c)) return null
    const { lat, lng } = c.location
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat+','+lng)}&travelmode=driving`
  }

  return (
    <div style={{ padding: 18, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div>
          <h1 style={{ margin:0, fontSize:20 }}>Compressor Activity Tracker</h1>
          <div style={{ fontSize:12, color:'#555' }}>List + Map view • resilient mock fallback</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>setView('list')}>List View</button>
          <button onClick={()=>setView('map')}>Map View</button>
          <button onClick={loadClients}>Refresh</button>
        </div>
      </header>

      {loading && <div>Loading clients…</div>}
      {error && <div style={{ background:'#fee', border:'1px solid #fbb', padding:10, marginBottom:12 }}>{error}</div>}

      {view === 'list' && (
        <section>
          <div style={{ marginBottom:8, display:'flex', gap:8, alignItems:'center' }}>
            <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search name, model, or address" style={{ padding:'6px 8px', minWidth:260 }} />
            <div style={{ fontSize:13, color:'#666' }}>{filtered.length} account(s)</div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ textAlign:'left', borderBottom:'1px solid #ddd' }}>
                  <th style={{ padding:'8px' }}>Name</th>
                  <th style={{ padding:'8px' }}>Phone</th>
                  <th style={{ padding:'8px' }}>Email</th>
                  <th style={{ padding:'8px' }}>Billing Address</th>
                  <th style={{ padding:'8px' }}>Compressor Model</th>
                  <th style={{ padding:'8px' }}>Next Maintenance</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ borderBottom:'1px solid #f1f1f1' }}>
                    <td style={{ padding:'8px' }}>{c.name}</td>
                    <td style={{ padding:'8px' }}>{c.phone || <span style={{ color:'#999' }}>—</span>}</td>
                    <td style={{ padding:'8px' }}>{c.email || <span style={{ color:'#999' }}>—</span>}</td>
                    <td style={{ padding:'8px' }}>{c.billingAddress || <span style={{ color:'#999' }}>—</span>}</td>
                    <td style={{ padding:'8px' }}>{c.compressorModel}</td>
                    <td style={{ padding:'8px' }}>{c.nextMaintenanceDate || <span style={{ color:'#999' }}>N/A</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {view === 'map' && (
        <section>
          {!googleMapsKey && (
            <div style={{ background:'#fff3f0', padding:12, border:'1px solid #ffd6cc', marginBottom:12 }}>
              Provide a key as window.__REACT_APP_GOOGLE_MAPS_API_KEY__ to enable map view.
            </div>
          )}
          {googleMapsKey && (
            <div style={{ height: 600 }}>
              <LoadScript googleMapsApiKey={googleMapsKey}>
                <GoogleMap mapContainerStyle={{ width:'100%', height:'100%' }} center={mapCenter} zoom={6}>
                  {clients.filter(isValidClientForMarker).map(c => (
                    <Marker key={c.id} position={c.location} onClick={() => setSelectedClient(c)} />
                  ))}
                  {selectedClient && isValidClientForMarker(selectedClient) && (
                    <InfoWindow position={selectedClient.location} onCloseClick={() => setSelectedClient(null)}>
                      <div style={{ minWidth: 220 }}>
                        <div style={{ fontWeight:700 }}>{selectedClient.name}</div>
                        <div style={{ fontSize:13 }}>{selectedClient.compressorModel}</div>
                        <div style={{ fontSize:13, color:'#444', marginTop:6 }}>
                          <div><strong>Phone:</strong> {selectedClient.phone || '—'}</div>
                          <div><strong>Email:</strong> {selectedClient.email || '—'}</div>
                          <div style={{ marginTop:6 }}><a href={getDirectionsUrl(selectedClient)} target="_blank" rel="noreferrer">Get driving directions</a></div>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function getDirectionsUrl(c) {
  if (!isValidClientForMarker(c)) return null
  const { lat, lng } = c.location
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat+','+lng)}&travelmode=driving`
}
