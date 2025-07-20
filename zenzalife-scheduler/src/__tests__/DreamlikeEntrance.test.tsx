import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DreamlikeEntrance } from '../components/DreamlikeEntrance'
import '@testing-library/jest-dom'

describe('DreamlikeEntrance', () => {
  it('renders the entrance button initially', () => {
    render(<DreamlikeEntrance onComplete={() => {}}><div /></DreamlikeEntrance>)
    expect(screen.getByRole('button')).toHaveTextContent('Click to Enter ZenzaLife')
  })
})
