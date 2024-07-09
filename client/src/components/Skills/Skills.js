import React from 'react';
import styled from 'styled-components';

const SkillsContainer = styled.div`
  padding: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
`;

const SkillGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 5px;
`;

const SkillSlot = styled.div`
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

const SkillName = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const SkillLevel = styled.div`
  font-size: 10px;
  color: #7f8c8d;
`;

const Skills = ({ skills }) => {
  return (
    <SkillsContainer>
      <h3>Навыки</h3>
      <SkillGrid>
        {skills.map((skill, index) => (
          <SkillSlot key={index}>
            <SkillName>{skill.name}</SkillName>
            <SkillLevel>Уровень: {skill.level}</SkillLevel>
          </SkillSlot>
        ))}
        {[...Array(20 - skills.length)].map((_, index) => (
          <SkillSlot key={`empty-${index}`} />
        ))}
      </SkillGrid>
    </SkillsContainer>
  );
};

export default Skills;