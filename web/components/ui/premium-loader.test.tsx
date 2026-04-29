import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PremiumLoader } from './premium-loader';

describe('PremiumLoader', () => {
  it('renders an animated svg loader with the provided class name', () => {
    const { container } = render(<PremiumLoader className="text-amber-500" />);

    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-amber-500');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(container.querySelectorAll('animate')).toHaveLength(3);
    expect(container.querySelectorAll('animateTransform')).toHaveLength(6);
  });

  it('renders the expected sparkle shapes', () => {
    const { container } = render(<PremiumLoader />);

    expect(container.querySelector('path')).toBeInTheDocument();
    expect(container.querySelectorAll('circle')).toHaveLength(2);
  });
});
