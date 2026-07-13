import { render, screen } from '@testing-library/react';
import DragAndDrop from './DragAndDrop';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
