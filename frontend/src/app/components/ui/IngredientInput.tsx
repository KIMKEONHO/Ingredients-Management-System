'use client';

import { useState, useEffect, useRef } from 'react';
import { ingredientService, Ingredient } from '@/lib/api/services/ingredientService';

interface IngredientInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectIngredient?: (ingredient: Ingredient) => void;
  placeholder?: string;
  className?: string;
}

export default function IngredientInput({ 
  value, 
  onChange, 
  onSelectIngredient,
  placeholder = "재료명을 입력하세요",
  className = ""
}: IngredientInputProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 모든 식재료 로드
  useEffect(() => {
    const loadIngredients = async () => {
      setIsLoading(true);
      try {
        const data = await ingredientService.getAllIngredients();
        setIngredients(data);
      } catch (error) {
        console.error('식재료 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIngredients();
  }, []);

  // 입력값에 따른 필터링
  useEffect(() => {
    if (!value.trim() || value.length < 1) {
      setFilteredIngredients([]);
      setShowDropdown(false);
      return;
    }

    const filtered = ingredients.filter(ingredient =>
      ingredient.name?.toLowerCase().includes(value.toLowerCase())
    );
    
    setFilteredIngredients(filtered.slice(0, 5)); // 최대 5개만 표시
    setShowDropdown(filtered.length > 0);
    setSelectedIndex(-1);
  }, [value, ingredients]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredIngredients.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredIngredients.length) {
          handleSelectIngredient(filteredIngredients[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectIngredient = (ingredient: Ingredient) => {
    onChange(ingredient.name || '');
    if (onSelectIngredient) {
      onSelectIngredient(ingredient);
    }
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleInputFocus = () => {
    if (filteredIngredients.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />

      {/* 드롭다운 */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredIngredients.map((ingredient, index) => (
            <button
              key={ingredient.id}
              type="button"
              onClick={() => handleSelectIngredient(ingredient)}
              className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? 'bg-green-50 text-green-700' : ''
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === filteredIngredients.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {ingredient.name}
                  </div>
                  {ingredient.categoryName && (
                    <div className="text-sm text-gray-500">
                      {ingredient.categoryName}
                    </div>
                  )}
                </div>
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

