import React from 'react';
import { cssFilterForColor } from '../utils/cssColorFilter';

export const PersonIcon = ({ color, faceIcon, accessoryIcon, className = '' }) => {
  const filter = cssFilterForColor(color);
  return (
    <div 
      className={`rounded-[2rem] border-4 flex items-center justify-center overflow-hidden relative ${className}`}
      style={{ borderColor: color || 'var(--text-muted)', backgroundColor: 'white' }}
    >
      <div className="absolute inset-0" style={filter ? { filter } : undefined}>
        <img
          src="/avatar/base.svg"
          alt="Person Base"
          className="w-full h-full object-cover absolute top-0 left-0 z-0"
        />
        {faceIcon && (
          <img
            src={faceIcon}
            alt="Face"
            className="w-full h-full object-cover absolute top-0 left-0 z-10"
          />
        )}
        {accessoryIcon && (
          <img
            src={accessoryIcon}
            alt="Accessory"
            className="w-full h-full object-cover absolute top-0 left-0 z-20"
          />
        )}
      </div>
    </div>
  );
};

export const GroupIcon = ({ color, faceIcon, accessoryIcon, className = '' }) => {
  const filter = cssFilterForColor(color);
  return (
    <div 
      className={`rounded-[2rem] border-4 flex items-center justify-center overflow-hidden relative ${className}`}
      style={{ borderColor: color || 'var(--text-muted)', backgroundColor: 'white' }}
    >
      <div className="absolute inset-0" style={filter ? { filter } : undefined}>
        <img
          src="/avatar/base-g.svg"
          alt="Group Base"
          className="w-full h-full object-cover absolute top-0 left-0 z-0"
        />
        {faceIcon && (
          <img
            src={faceIcon}
            alt="Face"
            className="w-full h-full object-cover absolute top-0 left-0 z-10"
          />
        )}
        {accessoryIcon && (
          <img
            src={accessoryIcon}
            alt="Accessory"
            className="w-full h-full object-cover absolute top-0 left-0 z-20"
          />
        )}
      </div>
    </div>
  );
};
