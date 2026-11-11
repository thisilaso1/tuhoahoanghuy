import React from 'react';
import { ThienCoPanel } from '../copilot/ThienCoPanel';
import { NamPhaiReadingPanel } from '../copilot/NamPhaiReadingPanel';

export const ThienCoView: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6">
      <NamPhaiReadingPanel />
      <ThienCoPanel fullScreen={true} />
    </div>
  );
};
