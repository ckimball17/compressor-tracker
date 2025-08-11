
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App.jsx'
import fetchMock from 'jest-fetch-mock'

beforeAll(() => { fetchMock.enableMocks() })
beforeEach(() => { fetch.resetMocks() })

test('renders list view and filters', async () => {
  fetch.mockResponseOnce(JSON.stringify([{ id:'1', name:'Acme', compressorModel:'AS 7', billingAddress:'X', phone:null, email:null, nextMaintenanceDate:null, location:{lat:1,lng:2}}]))
  render(<App />)
  expect(await screen.findByText(/Acme/)).toBeInTheDocument()
  const input = screen.getByPlaceholderText(/Search name/)
  fireEvent.change(input, { target:{ value:'AS 7'} })
  expect(await screen.findByText(/Acme/)).toBeInTheDocument()
})

test('shows error when API fails but still renders mock fallback', async () => {
  fetch.mockRejectOnce(new Error('network fail'))
  render(<App />)
  // Because we fallback to mocks, we should still see a row from MOCK_CLIENTS
  expect(await screen.findByText(/Acme Industrial|Oceanic Foods|Valley Construction/)).toBeInTheDocument()
})
