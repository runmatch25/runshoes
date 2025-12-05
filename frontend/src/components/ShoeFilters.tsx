"use client";

import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShoeFiltersProps {
  filters: {
    category: string[];
    brand: string[];
    stability: string[];
    cushion: string[];
  };
  availableOptions: {
    categories: string[];
    brands: string[];
    stabilityTypes: string[];
    cushionTypes: string[];
  };
  onFilterChange: (filterType: 'category' | 'brand' | 'stability' | 'cushion', value: string) => void;
  onClearFilters: () => void;
}

const STABILITY_LABELS: Record<string, string> = {
  NEUTRAL: 'NEUTRAL',
  MODERATE_SUPPORT: 'MODERATE SUPPORT',
  HIGH_SUPPORT: 'HIGH SUPPORT',
};

const CUSHION_LABELS: Record<string, string> = {
  SOFT: 'SOFT',
  BALANCED: 'BALANCED',
  FIRM: 'FIRM',
};

export default function ShoeFilters({
  filters,
  availableOptions,
  onFilterChange,
  onClearFilters,
}: ShoeFiltersProps) {
  const activeFilterCount = 
    filters.category.length +
    filters.brand.length +
    filters.stability.length +
    filters.cushion.length;

  const renderFilterOption = (
    value: string,
    label: string,
    isSelected: boolean,
    onChange: () => void
  ) => (
    <label
      className="flex items-center gap-3 cursor-pointer group"
    >
      <div 
        className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${
          isSelected
            ? 'border-[#007bff] bg-[#007bff]'
            : 'border-neutral-300 group-hover:border-[#007bff]'
        }`}
      >
        {isSelected && (
          <div className="w-2 h-2 bg-white"></div>
        )}
      </div>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onChange}
        className="sr-only"
      />
      <span className="text-sm tracking-wider group-hover:text-[#007bff] transition-colors uppercase">
        {label}
      </span>
    </label>
  );

  return (
    <div className="w-80 flex-shrink-0">
      <div className="sticky top-6">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="size-5 text-[#007bff]" />
            <h2 className="text-xl tracking-wider">FILTERS</h2>
            {activeFilterCount > 0 && (
              <span className="bg-[#007bff] text-white px-2 py-0.5 text-xs tracking-wider">
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-xs tracking-wider text-neutral-500 hover:text-[#007bff] transition-colors"
            >
              CLEAR ALL
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-xs tracking-widest text-neutral-500 mb-4">CATEGORY</h3>
          <div className="space-y-2">
            {availableOptions.categories.map((category) => (
              <div key={category}>
                {renderFilterOption(
                  category,
                  category || 'UNCATEGORIZED',
                  filters.category.includes(category),
                  () => onFilterChange('category', category)
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div className="mb-8 pt-8 border-t border-neutral-200">
          <h3 className="text-xs tracking-widest text-neutral-500 mb-4">BRAND</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableOptions.brands.map((brand) => (
              <div key={brand}>
                {renderFilterOption(
                  brand,
                  brand,
                  filters.brand.includes(brand),
                  () => onFilterChange('brand', brand)
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stability Filter */}
        <div className="mb-8 pt-8 border-t border-neutral-200">
          <h3 className="text-xs tracking-widest text-neutral-500 mb-4">STABILITY TYPE</h3>
          <div className="space-y-2">
            {availableOptions.stabilityTypes.map((stability) => (
              <div key={stability}>
                {renderFilterOption(
                  stability,
                  STABILITY_LABELS[stability] || stability,
                  filters.stability.includes(stability),
                  () => onFilterChange('stability', stability)
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cushion Filter */}
        <div className="pt-8 border-t border-neutral-200">
          <h3 className="text-xs tracking-widest text-neutral-500 mb-4">CUSHION</h3>
          <div className="space-y-2">
            {availableOptions.cushionTypes.map((cushion) => (
              <div key={cushion}>
                {renderFilterOption(
                  cushion,
                  CUSHION_LABELS[cushion] || cushion,
                  filters.cushion.includes(cushion),
                  () => onFilterChange('cushion', cushion)
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
