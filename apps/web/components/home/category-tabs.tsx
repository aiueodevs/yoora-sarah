'use client';

import { useState } from 'react';
import { cn } from '@yoora/ui';

const tabs = [
  { id: 'best-seller', label: 'Terlaris' },
  { id: 'sale', label: 'Diskon' },
  { id: 'new-arrival', label: 'Koleksi Terbaru' },
  { id: 'exclusive', label: 'Eksklusif' },
  { id: 'coming-soon', label: 'Segera Hadir' },
];

interface CategoryTabsProps {
  onTabChange?: (tabId: string) => void;
}

export function CategoryTabs({ onTabChange }: CategoryTabsProps) {
  const [activeTab, setActiveTab] = useState('best-seller');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 md:gap-8 overflow-x-auto py-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'whitespace-nowrap text-sm md:text-base font-medium pb-2 border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}