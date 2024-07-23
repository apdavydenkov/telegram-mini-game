import React, { useState } from 'react';
import useCharacterStatus from '../../hooks/useCharacterStatus';
import { FaStar } from 'react-icons/fa';

const CharacterStatus = ({ initialStatus }) => {
  const { status, updateStatus } = useCharacterStatus(initialStatus);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const displayStatus = status.auto || status.user;

  const handleStatusChange = (newStatus) => {
    updateStatus(newStatus);
    setIsPopupOpen(false);
  };

  return (
    <div className="relative">
      <span className="bg-gray-300 text-gray-800 rounded-md py-1 text-xs cursor-pointer" onClick={() => setIsPopupOpen(!isPopupOpen)}>
        <FaStar className="inline-block mr-1" />
        {displayStatus}
      </span>
      {isPopupOpen && !status.auto && (
        <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button
              onClick={() => handleStatusChange('idle')}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
              role="menuitem"
            >
              Idle
            </button>
            <button
              onClick={() => handleStatusChange('resting')}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
              role="menuitem"
            >
              Resting
            </button>
            <button
              onClick={() => handleStatusChange('looking_for_battle')}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
              role="menuitem"
            >
              Looking for Battle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterStatus;