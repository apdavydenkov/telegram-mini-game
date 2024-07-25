import React, { useState, useEffect, useMemo, useCallback } from 'react';

const FilterSortPanel = ({ items, onFilterSort, itemType }) => {
  const [filterCategory, setFilterCategory] = useState('none');
  const [filterValue, setFilterValue] = useState('all');
  const [sortBy, setSortBy] = useState('none');
  const [sortOrder, setSortOrder] = useState('asc');

  const filterCategories = useMemo(() => [
    { value: 'none', label: 'Без фильтра' },
    { value: 'type', label: 'По типу' },
    { value: 'rarity', label: 'По редкости' },
    { value: 'class', label: 'По классу' },
  ], []);

  const filterOptions = useMemo(() => ({
    type: [
      { value: 'all', label: 'Все типы' },
      { value: 'weapon', label: 'Оружие' },
      { value: 'armor', label: 'Броня' },
      { value: 'helmet', label: 'Шлемы' },
      { value: 'shield', label: 'Щиты' },
      { value: 'cloak', label: 'Плащи' },
      { value: 'belt', label: 'Пояса' },
      { value: 'boots', label: 'Обувь' },
      { value: 'banner', label: 'Знамена' },
      { value: 'useful', label: 'Полезное' },
    ],
    rarity: [
      { value: 'all', label: 'Все редкости' },
      { value: 'common', label: 'Обычные' },
      { value: 'uncommon', label: 'Необычные' },
      { value: 'rare', label: 'Редкие' },
      { value: 'epic', label: 'Эпические' },
      { value: 'legendary', label: 'Легендарные' },
    ],
    class: [
      { value: 'all', label: 'Все классы' },
      { value: 'Warrior', label: 'Воин' },
      { value: 'Mage', label: 'Маг' },
      { value: 'Archer', label: 'Лучник' },
    ],
  }), []);

  const sortOptions = useMemo(() => {
    const options = [
      { value: 'none', label: 'Без сортировки' },
      { value: 'rarity', label: 'По редкости' },
    ];

    if (itemType === 'inventory') {
      options.push({ value: 'level', label: 'По уровню' });
    } else if (itemType === 'gameItem') {
      options.push(
        { value: 'name', label: 'По имени' },
        { value: 'type', label: 'По типу' },
        { value: 'minLevel', label: 'По мин. уровню' }
      );
    }

    return options;
  }, [itemType]);

  const filterAndSortItems = useCallback(() => {
    let result = [...items];

    // Применяем фильтр
    if (filterCategory !== 'none' && filterValue !== 'all') {
      result = result.filter(item => {
        const gameItem = itemType === 'inventory' ? item.gameItem : item;
        switch (filterCategory) {
          case 'type':
            return gameItem.type === filterValue;
          case 'rarity':
            return gameItem.rarity === filterValue;
          case 'class':
            return gameItem.requiredClass.includes(filterValue);
          default:
            return true;
        }
      });
    }

    // Применяем сортировку
    if (sortBy !== 'none') {
      const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      result.sort((a, b) => {
        const gameItemA = itemType === 'inventory' ? a.gameItem : a;
        const gameItemB = itemType === 'inventory' ? b.gameItem : b;
        let comparison = 0;
        switch (sortBy) {
          case 'name':
            comparison = gameItemA.name.localeCompare(gameItemB.name);
            break;
          case 'type':
            comparison = gameItemA.type.localeCompare(gameItemB.type);
            break;
          case 'rarity':
            comparison = rarityOrder.indexOf(gameItemA.rarity) - rarityOrder.indexOf(gameItemB.rarity);
            break;
          case 'level':
          case 'minLevel':
            comparison = gameItemA.minLevel - gameItemB.minLevel;
            break;
          default:
            comparison = 0;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    onFilterSort(result);
  }, [items, filterCategory, filterValue, sortBy, sortOrder, itemType, onFilterSort]);

  useEffect(() => {
    filterAndSortItems();
  }, [filterAndSortItems]);

  const renderDropdown = (label, value, onChange, options) => (
    <div className="mb-2 mr-2">
      <label className="mr-2">{label}:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="p-1 rounded border border-gray-300"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="mb-4 flex flex-wrap items-center">
      {renderDropdown('Фильтр', filterCategory, setFilterCategory, filterCategories)}
      {filterCategory !== 'none' && renderDropdown('Значение', filterValue, setFilterValue, filterOptions[filterCategory] || [])}
      {renderDropdown('Сортировка', sortBy, setSortBy, sortOptions)}
      {sortBy !== 'none' && (
        <button
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      )}
    </div>
  );
};

export default FilterSortPanel;