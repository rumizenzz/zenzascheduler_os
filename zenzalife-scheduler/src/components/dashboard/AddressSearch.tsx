import React, { useEffect, useState } from 'react'

interface AddressData {
  address_line1: string
  city: string
  state: string
  zip: string
  country: string
}

interface NominatimAddress {
  house_number?: string
  road?: string
  city?: string
  town?: string
  village?: string
  state?: string
  postcode?: string
  country?: string
}

interface NominatimResult {
  place_id: string
  display_name: string
  address: NominatimAddress
}

interface AddressSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (data: AddressData) => void
}

export default function AddressSearch({ value, onChange, onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<NominatimResult[]>([])

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      return
    }

    const controller = new AbortController()

    const fetchResults = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
          { signal: controller.signal, headers: { 'Accept-Language': 'en' } }
        )
        const data = await res.json()
        setResults((data as NominatimResult[]) || [])
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Address search failed', err)
        }
      }
    }

    fetchResults()
    return () => controller.abort()
  }, [query])

  const handleSelect = (result: NominatimResult) => {
    const addr = result.address
    const address: AddressData = {
      address_line1: [addr.house_number, addr.road].filter(Boolean).join(' ') || result.display_name,
      city: addr.city || addr.town || addr.village || '',
      state: addr.state || '',
      zip: addr.postcode || '',
      country: addr.country || ''
    }

    setQuery(address.address_line1)
    setResults([])
    onSelect(address)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          onChange(e.target.value)
        }}
        placeholder="Search address"
        className="input-dreamy w-full"
      />
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map(result => (
            <li
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

