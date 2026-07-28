import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, BookOpen, Award, FileCheck,
  Users, Activity, Shield, Layers, FileText, HeartHandshake, Search, MapPin,
} from 'lucide-react';

interface AccordionCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'violet';
  items: { id: string; label: string; icon: React.ElementType }[];
}

interface AccordionNavProps {
  onSelectItem?: (categoryTitle: string, itemLabel: string) => void;
}

export const AccordionNav: React.FC<AccordionNavProps> = ({ onSelectItem }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    academics: false,
    services: false,
    campus: false,
  });

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories: AccordionCategory[] = [
    {
      id: 'academics',
      title: 'Academics',
      icon: BookOpen,
      color: 'blue',
      items: [
        { id: 'evaluation', label: 'Evaluation', icon: Award },
        { id: 'notes', label: 'Lecture Notes', icon: FileText },
        { id: 'plagiarism', label: 'Plagiarism Test', icon: FileCheck },
      ],
    },
    {
      id: 'services',
      title: 'Student Services',
      icon: Shield,
      color: 'emerald',
      items: [
        { id: 'complaints', label: 'Complaints Desk', icon: HeartHandshake },
        { id: 'lost-and-found', label: 'Lost & Found', icon: MapPin },
        { id: 'requests', label: 'Requests', icon: Search },
      ],
    },
    {
      id: 'campus',
      title: 'Campus Life',
      icon: Layers,
      color: 'violet',
      items: [
        { id: 'forum', label: 'General Forum', icon: Users },
        { id: 'elections', label: 'Student Elections', icon: Activity },
      ],
    },
  ];

  const colorMap = {
    blue: {
      headerOpen: 'bg-blue-50 border-blue-200',
      headerClosed: 'bg-white border-slate-200',
      icon: 'bg-blue-100 text-blue-600',
      iconClosed: 'bg-slate-100 text-slate-500',
      chevron: 'text-blue-500',
      itemHover: 'hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700',
      itemIcon: 'bg-blue-100 text-blue-600',
    },
    emerald: {
      headerOpen: 'bg-emerald-50 border-emerald-200',
      headerClosed: 'bg-white border-slate-200',
      icon: 'bg-emerald-100 text-emerald-600',
      iconClosed: 'bg-slate-100 text-slate-500',
      chevron: 'text-emerald-500',
      itemHover: 'hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700',
      itemIcon: 'bg-emerald-100 text-emerald-600',
    },
    violet: {
      headerOpen: 'bg-violet-50 border-violet-200',
      headerClosed: 'bg-white border-slate-200',
      icon: 'bg-violet-100 text-violet-600',
      iconClosed: 'bg-slate-100 text-slate-500',
      chevron: 'text-violet-500',
      itemHover: 'hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700',
      itemIcon: 'bg-violet-100 text-violet-600',
    },
  };

  const handleItemClick = (categoryTitle: string, item: { id: string; label: string }) => {
    if (onSelectItem) onSelectItem(categoryTitle, item.id);
  };

  return (
    <div className="w-full space-y-3">
      {categories.map((category) => {
        const CategoryIcon = category.icon;
        const isOpen = !!openCategories[category.id];
        const colors = colorMap[category.color];

        return (
          <div key={category.id}
            className={`rounded-2xl border overflow-hidden transition-all duration-200 shadow-sm ${
              isOpen ? colors.headerOpen : colors.headerClosed
            }`}>

            {/* Header button */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl transition-colors ${isOpen ? colors.icon : colors.iconClosed}`}>
                  <CategoryIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[15px] font-bold text-slate-900">{category.title}</span>
                  <p className="text-xs text-slate-400 font-medium">{category.items.length} modules</p>
                </div>
              </div>
              <div className={`transition-all duration-200 ${isOpen ? colors.chevron : 'text-slate-400'}`}>
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>

            {/* Items */}
            {isOpen && (
              <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {category.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(category.title, item)}
                      className={`flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-slate-50 text-left transition-all duration-150 group text-slate-700 ${colors.itemHover}`}
                    >
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${colors.itemIcon} group-hover:scale-105 transition-transform`}>
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
