import React, { useState } from 'react';
import styled from 'styled-components';

const InventoryContainer = styled.div`
  padding: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
`;

const CategoryTabs = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const CategoryTab = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.active ? '#4CAF50' : '#ddd'};
  border: none;
  border-radius: 5px 5px 0 0;
  cursor: pointer;
  margin-right: 5px;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 5px;
`;

const ItemSlot = styled.div`
  width: 60px;
  height: 60px;
  background-color: #f0f0f0;
  border: 2px solid #bdc3c7;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #d0d0d0;
  }
`;

const ItemName = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const ItemQuantity = styled.div`
  font-size: 10px;
  color: #7f8c8d;
`;

const Inventory = ({ inventory, onEquipItem }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Все' },
    { id: 'weapon', name: 'Оружие' },
    { id: 'armor', name: 'Броня' },
    { id: 'potion', name: 'Зелья' },
    { id: 'misc', name: 'Предметы' },
  ];

  const filteredInventory = inventory.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  );

  return (
    <InventoryContainer>
      <CategoryTabs>
        {categories.map(category => (
          <CategoryTab
            key={category.id}
            active={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </CategoryTab>
        ))}
      </CategoryTabs>
      <ItemGrid>
        {filteredInventory.map((item, index) => (
          <ItemSlot key={index} onClick={() => onEquipItem(item.id, item.slot)}>
            <ItemName>{item.name}</ItemName>
            <ItemQuantity>x{item.quantity}</ItemQuantity>
          </ItemSlot>
        ))}
        {[...Array(25 - filteredInventory.length)].map((_, index) => (
          <ItemSlot key={`empty-${index}`} />
        ))}
      </ItemGrid>
    </InventoryContainer>
  );
};

export default Inventory;