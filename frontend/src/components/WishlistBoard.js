const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(price) || 0);

function ItemTile({ item, deleting, onDelete }) {
    const title = item.title || 'Untitled item';
    const category = item.category || 'Uncategorized';

    return (
        <article className="item-card">
            <div className="tile-art" aria-hidden="true">
                <span className="tile-art-mark">{title.trim().charAt(0).toUpperCase() || '?'}</span>
                <span className="tile-art-orbit" />
                <span className="tile-art-caption">kept in mind</span>
            </div>
            <div className="tile-copy">
                <div className="item-topline">
                    <span className="category">{category}</span>
                    <span className="tile-index" aria-hidden="true">✳</span>
                </div>
                <h3>{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">{title}</a> : title}</h3>
                <div className="item-footer">
                    <p className="price">{formatPrice(item.price)}</p>
                    <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="delete-btn"
                        disabled={deleting}
                        aria-label={`Remove ${title}`}
                    >
                        {deleting ? 'Removing...' : 'Remove'}
                    </button>
                </div>
            </div>
        </article>
    );
}

export default function WishlistBoard({
    items,
    filtered,
    categories,
    filter,
    setFilter,
    query,
    setQuery,
    totalValue,
    loading,
    error,
    deletingId,
    onDelete,
}) {
    const categoryCounts = items.reduce((counts, item) => {
        const category = item.category || 'Uncategorized';
        counts[category] = (counts[category] || 0) + 1;
        return counts;
    }, {});

    return (
        <main className="workspace-shell">
            <aside className="collection-rail" aria-label="Collection categories">
                <div className="rail-heading">
                    <span className="rail-stamp" aria-hidden="true">K</span>
                    <div><span className="eyebrow">YOUR LIBRARY</span><h2>Little shelves</h2></div>
                </div>
                <nav className="category-nav" aria-label="Filter collection by category">
                    {categories.map((category, index) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setFilter(category)}
                            className={filter === category ? 'category-link active' : 'category-link'}
                            aria-pressed={filter === category}
                        >
                            <span className={`category-swatch swatch-${index % 4}`} aria-hidden="true" />
                            <span className="category-link-name">{category}</span>
                            <span className="category-count">{category === 'All' ? items.length : categoryCounts[category]}</span>
                        </button>
                    ))}
                </nav>
                <div className="rail-note"><span className="rail-note-mark" aria-hidden="true">✳</span><p>A collection of things for someday, or just because.</p></div>
            </aside>

            <div className="workspace-main">
                <section className="board-hero">
                    <div className="board-title-block">
                        <p className="eyebrow">A LITTLE PLACE FOR THE THINGS YOU LOVE</p>
                        <h1>Your wishlist<span>.</span></h1>
                        <p className="intro-copy">Good finds, saved for the right moment.</p>
                    </div>
                    <div className="board-summary" aria-label="Wishlist summary">
                        <div className="summary-cell summary-count"><span className="summary-label">ON THE LIST</span><strong>{items.length.toString().padStart(2, '0')}</strong><span className="summary-caption">{items.length === 1 ? 'one good thing' : 'good things'}</span></div>
                        <div className="summary-cell summary-value"><span className="summary-label">TOTAL VALUE</span><strong>{formatPrice(totalValue)}</strong><span className="summary-caption">a someday fund</span></div>
                        <span className="summary-spark" aria-hidden="true">✳</span>
                    </div>
                    <span className="hero-sticker" aria-hidden="true">collect<br />what delights</span>
                </section>

                <section className="collection-module" aria-label="Saved items">
                    <div className="module-header">
                        <div className="module-title">
                            <span className="module-number">01</span>
                            <div><p className="eyebrow">THE COLLECTION</p><h2>{filter === 'All' ? 'Saved things' : filter}<span>{filtered.length}</span></h2></div>
                        </div>
                        <label className="search-box">
                            <span className="search-glyph" aria-hidden="true">⌕</span>
                            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a saved thing" aria-label="Search wishlist" />
                        </label>
                    </div>

                    <div className="module-toolbar">
                        <span>{filtered.length === items.length ? 'Everything you saved, in one place.' : `${filtered.length} matching ${filtered.length === 1 ? 'find' : 'finds'}`}</span>
                        <span className="view-label"><span aria-hidden="true">▦</span> BOARD VIEW</span>
                    </div>

                    {error && <p className="notice error-notice" role="alert">{error}</p>}
                    {loading ? (
                        <div className="collection-message" role="status">Gathering your saved things...</div>
                    ) : filtered.length > 0 ? (
                        <div className="items-grid">
                            {filtered.map((item) => <ItemTile key={item.id} item={item} deleting={deletingId === item.id} onDelete={onDelete} />)}
                        </div>
                    ) : (
                        <div className="collection-message empty-state">
                            <span className="empty-mark" aria-hidden="true">+</span>
                            <h3>{items.length === 0 ? 'Your next favorite starts here.' : 'Nothing in this corner yet.'}</h3>
                            <p>{items.length === 0 ? 'Save something from the browser extension and it will show up here.' : 'Try another category or search for a different item.'}</p>
                            {items.length > 0 && (filter !== 'All' || query) && <button type="button" onClick={() => { setFilter('All'); setQuery(''); }}>Clear filters</button>}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
