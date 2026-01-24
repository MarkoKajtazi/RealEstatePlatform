export default function ListingFilters({filters, floors, onFilterChange, onClear,}) {
    return (<div className="luxury-filters">
            <div className="luxury-filter-group">
                <div className="luxury-filter-item">
                    <label className="luxury-filter-label">Floor</label>
                    <select
                        className="luxury-filter-select"
                        name="floor"
                        value={filters.floor}
                        onChange={onFilterChange}
                    >
                        <option value="">All Floors</option>
                        {floors.map((floor) => (<option key={floor} value={floor}>
                                Floor {floor}
                            </option>))}
                    </select>
                </div>

                <div className="luxury-filter-item">
                    <label className="luxury-filter-label">Min Rooms</label>
                    <select
                        className="luxury-filter-select"
                        name="minRooms"
                        value={filters.minRooms}
                        onChange={onFilterChange}
                    >
                        <option value="">Any</option>
                        {[1, 2, 3, 4, 5].map((n) => (<option key={n} value={n}>
                                {n}+
                            </option>))}
                    </select>
                </div>

                <div className="luxury-filter-item">
                    <label className="luxury-filter-label">Max Price (EUR)</label>
                    <input
                        type="number"
                        className="luxury-filter-input"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={onFilterChange}
                        placeholder="No limit"
                    />
                </div>

                <div className="luxury-filter-item">
                    <label className="luxury-filter-label">Size (m²)</label>
                    <div className="luxury-input-group">
                        <input
                            type="number"
                            className="luxury-filter-input"
                            name="minSize"
                            value={filters.minSize}
                            onChange={onFilterChange}
                            placeholder="Min"
                        />
                        <input
                            type="number"
                            className="luxury-filter-input"
                            name="maxSize"
                            value={filters.maxSize}
                            onChange={onFilterChange}
                            placeholder="Max"
                        />
                    </div>
                </div>

                <div className="luxury-filter-item">
                    <label className="luxury-filter-label">Orientation</label>
                    <select
                        className="luxury-filter-select"
                        name="orientation"
                        value={filters.orientation}
                        onChange={onFilterChange}
                    >
                        <option value="">Any</option>
                        <option value="0">North</option>
                        <option value="1">South</option>
                        <option value="2">East</option>
                        <option value="3">West</option>
                    </select>
                </div>

                <div className="luxury-filter-item flex items-end">
                    <button className="luxury-filter-clear" onClick={onClear}>
                        Clear All
                    </button>
                </div>
            </div>

            <div className="luxury-filter-divider">
                <div className="flex gap-6">
                    <label className="luxury-filter-checkbox">
                        <input
                            type="checkbox"
                            name="hasBalcony"
                            checked={filters.hasBalcony}
                            onChange={onFilterChange}
                        />
                        <span className="luxury-filter-checkbox-label">Has Balcony</span>
                    </label>

                    <label className="luxury-filter-checkbox">
                        <input
                            type="checkbox"
                            name="showSold"
                            checked={filters.showSold}
                            onChange={onFilterChange}
                        />
                        <span className="luxury-filter-checkbox-label">Show Sold</span>
                    </label>
                </div>
            </div>
        </div>);
}
