import React, { useEffect, useState } from 'react'

interface AddressData {
  address_line1: string
  city: string
  state: string
  zip: string
  country: string
}

interface MapboxContext {
  id: string
  short_code?: string
  text: string
}

interface MapboxFeature {
  id: string
  place_name: string
  context?: MapboxContext[]
  address?: string
  text: string
}

interface AddressSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (data: AddressData) => void
}

export default function AddressSearch({ value, onChange, onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<MapboxFeature[]>([])
  const token = import.meta.env.VITE_MAPBOX_TOKEN

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    if (!token || query.length < 3) {
      setResults([])
      return
    }

    const controller = new AbortController()
    const fetchResults = async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&autocomplete=true&types=address&limit=5`,
          { signal: controller.signal }
        )
        const data = await res.json()
        setResults((data.features as MapboxFeature[]) || [])
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Address search failed', err)
        }
      }
    }

    fetchResults()
    return () => controller.abort()
  }, [query, token])

  const handleSelect = (feature: MapboxFeature) => {
    const context = feature.context ?? []
    const getContext = (id: string) => context.find(c => c.id.startsWith(id))

    const streetNumber = feature.address ?? ''
    const streetName = feature.text

    const address: AddressData = {
      address_line1: streetNumber ? `${streetNumber} ${streetName}` : streetName,
      city: getContext('place')?.text || '',
      state:
        getContext('region')?.short_code?.split('-')[1]?.toUpperCase() ||
        getContext('region')?.text || '',
      zip: getContext('postcode')?.text || '',
      country: getContext('country')?.short_code?.toUpperCase() || ''
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
              key={result.id}
              onClick={() => handleSelect(result)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {result.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

