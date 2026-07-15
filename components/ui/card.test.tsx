import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'

describe('Card', () => {
  it('renders all card components correctly', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">Card Title</CardTitle>
          <CardDescription data-testid="card-description">Card Description</CardDescription>
        </CardHeader>
        <CardContent data-testid="card-content">
          Card Content
        </CardContent>
        <CardFooter data-testid="card-footer">
          Card Footer
        </CardFooter>
      </Card>
    )

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()

    const title = screen.getByTestId('card-title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('Card Title')

    const description = screen.getByTestId('card-description')
    expect(description).toBeInTheDocument()
    expect(description).toHaveTextContent('Card Description')

    const content = screen.getByTestId('card-content')
    expect(content).toBeInTheDocument()
    expect(content).toHaveTextContent('Card Content')

    const footer = screen.getByTestId('card-footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveTextContent('Card Footer')
  })

  it('applies custom classes to card components', () => {
    render(
      <Card data-testid="card" className="custom-card-class">
        <CardHeader data-testid="card-header" className="custom-header-class">
          <CardTitle data-testid="card-title" className="custom-title-class">Title</CardTitle>
          <CardDescription data-testid="card-description" className="custom-description-class">Description</CardDescription>
        </CardHeader>
        <CardContent data-testid="card-content" className="custom-content-class">
          Content
        </CardContent>
        <CardFooter data-testid="card-footer" className="custom-footer-class">
          Footer
        </CardFooter>
      </Card>
    )

    expect(screen.getByTestId('card')).toHaveClass('custom-card-class')
    expect(screen.getByTestId('card-header')).toHaveClass('custom-header-class')
    expect(screen.getByTestId('card-title')).toHaveClass('custom-title-class')
    expect(screen.getByTestId('card-description')).toHaveClass('custom-description-class')
    expect(screen.getByTestId('card-content')).toHaveClass('custom-content-class')
    expect(screen.getByTestId('card-footer')).toHaveClass('custom-footer-class')
  })
})
