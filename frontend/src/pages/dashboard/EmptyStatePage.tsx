import React from 'react';

interface EmptyStatePageProps {
  illustration: string;
  title: string;
  subtitle: string;
}

const EmptyStatePage: React.FC<EmptyStatePageProps> = ({ illustration, title, subtitle }) => {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white text-google-gray-900">
      <main className="flex-1 flex flex-col items-center justify-center">
        <img
          src={illustration}
          alt={title + ' Illustration'}
          className="w-64 h-64 mb-6"
        />
        <h2 className="text-2xl font-medium mb-2">{title}</h2>
        <p className="text-gray-600 text-base">{subtitle}</p>
      </main>
    </div>
  );
};

export default EmptyStatePage;