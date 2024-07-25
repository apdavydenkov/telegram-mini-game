import React from 'react';

const HealthBar = ({ currentHealth, maxHealth }) => {
  const healthPercentage = (currentHealth / maxHealth) * 100;

  return (
    <div className="col-span-6 col-start-4 row-start-3 bg-red-200 rounded-md overflow-hidden relative h-6">
      <div
        className="h-full bg-red-500 absolute left-0 top-0"
        style={{ width: `${healthPercentage}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
        HP: {Math.round(currentHealth)}/{maxHealth}
      </div>
    </div>
  );
};

export default HealthBar;