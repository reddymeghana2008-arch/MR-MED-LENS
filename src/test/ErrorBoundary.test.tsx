import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

const BadComponent: React.FC = () => {
  throw new Error('Simulated clinical rendering crash');
};

const GoodComponent: React.FC = () => {
  return <div>Healthy Workspace Interface</div>;
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    // Suppress console.error during expected throw
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Healthy Workspace Interface')).toBeInTheDocument();
  });

  it('catches runtime errors and renders accessible error fallback UI', () => {
    render(
      <ErrorBoundary>
        <BadComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Application Error')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected interface issue occurred/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload Workspace/i })).toBeInTheDocument();
  });
});
