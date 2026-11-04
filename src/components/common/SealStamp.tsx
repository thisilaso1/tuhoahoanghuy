import React from 'react';

interface SealStampProps {
  text?: string;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SealStamp: React.FC<SealStampProps> = ({
  text = '懷月閣',
  subtext = '欽天',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-1 border-[1.5px]',
    md: 'text-xs px-2.5 py-1.5 border-2',
    lg: 'text-sm px-3.5 py-2 border-[2.5px]',
  };

  return (
    <div
      className={`seal-stamp select-none transition-all duration-300 hover:scale-105 ${sizeClasses[size]} ${className}`}
      title="Hoài Nguyệt Các Ấn"
    >
      <span className="font-cjk font-bold leading-none tracking-widest">{text}</span>
      {subtext && <span className="text-[8px] opacity-80 tracking-widest mt-0.5">{subtext}</span>}
    </div>
  );
};
