import { fireEvent, render, screen } from '@testing-library/react';
import WishlistBoard from './WishlistBoard';

test('renders category shelves and a saved item with remove action', () => {
    const onDelete = jest.fn();
    const items = [{
        id: 'item-1',
        title: 'A favorite notebook',
        url: 'https://example.com/notebook',
        price: 18.5,
        category: 'Stationery',
    }];

    render(
        <WishlistBoard
            items={items}
            filtered={items}
            categories={['All', 'Stationery']}
            filter="All"
            setFilter={jest.fn()}
            query=""
            setQuery={jest.fn()}
            totalValue={18.5}
            loading={false}
            error=""
            deletingId=""
            onDelete={onDelete}
        />
    );

    expect(screen.getByRole('navigation', { name: /filter collection by category/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /a favorite notebook/i })).toHaveAttribute('href', 'https://example.com/notebook');
    expect(screen.getAllByText('$18.50')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: /remove a favorite notebook/i }));
    expect(onDelete).toHaveBeenCalledWith('item-1');
});
