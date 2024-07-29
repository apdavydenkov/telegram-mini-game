const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return '#FF7F00'; // Оранжевый
      case 'epic':
        return '#A335EE'; // Фиолетовый
      case 'rare':
        return '#0070DD'; // Синий
      case 'uncommon':
        return '#1EFF00'; // Зеленый
      case 'common':
      default:
        return '#FFFFFF'; // Белый
    }
  };
  
  export const getCharItemStyle = (rarity) => {
    const color = getRarityColor(rarity);
    return {
      backgroundColor: `${color}33`, // Добавляем прозрачность
      border: `2px solid ${color}`,
      boxShadow: `0 0 5px ${color}`,
    };
  };
  
  export const getEquippedItemStyle = (rarity) => {
    const baseStyle = getCharItemStyle(rarity);
    return {
      ...baseStyle,
      boxShadow: `0 0 10px ${getRarityColor(rarity)}`,
      border: `3px solid ${getRarityColor(rarity)}`,
    };
  };