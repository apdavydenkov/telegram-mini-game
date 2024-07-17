import React, { useState } from 'react';

const CategoryTab = ({ id, name, active, onClick }) => (
  <button
    className={`px-4 py-2 font-bold transition-colors duration-200 
      ${active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
      first:rounded-tl-lg last:rounded-tr-lg`}
    onClick={() => onClick(id)}
  >
    {name}
  </button>
);

const SkillSlot = ({ skill }) => (
  <div className="aspect-square bg-white border border-gray-300 rounded-md flex flex-col justify-center items-center p-1 text-xs text-center">
    {skill && (
      <>
        <div className="font-bold mb-1 text-gray-800 truncate w-full">{skill.name}</div>
        <div className="text-gray-600">Ур. {skill.level}</div>
      </>
    )}
  </div>
);

const Skills = ({ skills }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Все' },
    { id: 'attack', name: 'Атака' },
    { id: 'defense', name: 'Защита' },
    { id: 'healing', name: 'Лечение' },
  ];

  const filteredSkills = skills.filter(skill => 
    activeCategory === 'all' || skill.category === activeCategory
  );

  return (
    <div>
      <div className="flex mt-4 overflow-auto">
        {categories.map(category => (
          <CategoryTab
            key={category.id}
            id={category.id}
            name={category.name}
            active={activeCategory === category.id}
            onClick={setActiveCategory}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 gap-1 bg-gray-200 p-2 rounded-b-lg rounded-tr-lg">
        {filteredSkills.map((skill, index) => (
          <SkillSlot key={index} skill={skill} />
        ))}
        {[...Array(24 - filteredSkills.length)].map((_, index) => (
          <SkillSlot key={`empty-${index}`} />
        ))}
      </div>
    </div>
  );
};

export default Skills;