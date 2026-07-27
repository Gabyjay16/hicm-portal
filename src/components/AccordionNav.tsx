import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Award,
  FileCheck,
  Heart,
  Users,
  Activity,
  Shield,
  Layers,
  FileText
} from 'lucide-react';

interface AccordionCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  items: { id: string; label: string; icon: React.ElementType }[];
}

interface AccordionNavProps {
  onSelectItem?: (categoryTitle: string, itemLabel: string) => void;
}

export const AccordionNav: React.FC<AccordionNavProps> = ({ onSelectItem }) => {
  // Category accordion state - explicitly all false by default
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    academics: false,
    services: false,
    campus: false,
  });

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories: AccordionCategory[] = [
    {
      id: 'academics',
      title: 'Academics',
      icon: BookOpen,
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
      items: [
        { id: 'complaints', label: 'Complaints Desk', icon: Heart },
        { id: 'lost-and-found', label: 'Lost & Found', icon: Shield },
      ],
    },
    {
      id: 'campus',
      title: 'Campus Life',
      icon: Layers,
      items: [
        { id: 'forum', label: 'General Forum', icon: Users },
        { id: 'elections', label: 'Student Elections', icon: Activity },
      ],
    },
  ];

  const handleItemClick = (categoryTitle: string, item: { id: string; label: string }) => {
    if (onSelectItem) {
      onSelectItem(categoryTitle, item.id);
    }
  };

  return (
    <div className="w-full space-y-4">
      {categories.map((category) => {
        const CategoryIcon = category.icon;
        const isOpen = !!openCategories[category.id];

        return (
          <div
            key={category.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl transition-colors ${isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  <CategoryIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[15px] font-bold text-slate-800">{category.title}</span>
                  <p className="text-xs text-slate-500 font-medium">{category.items.length} Sub-menus</p>
                </div>
              </div>
              <div className={`transition-transform duration-200 ${isOpen ? 'text-emerald-500' : 'text-slate-400'}`}>
                {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </button>

            {/* Accordion Items Body */}
            {isOpen && (
              <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {category.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(category.title, item)}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-left transition-all text-slate-700 hover:text-emerald-700 group shadow-sm"
                    >
                      <ItemIcon className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform flex-shrink-0" />
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
