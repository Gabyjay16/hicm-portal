import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Award,
  FileCheck,
  Users,
  Activity,
  Shield,
  Layers,
  FileText,
  HeartHandshake,
  Search,
  MapPin,
} from 'lucide-react';

interface AccordionCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  items: { id: string; label: string; icon: React.ElementType }[];
}

interface AccordionNavProps {
  onSelectItem?: (categoryTitle: string, itemLabel: string) => void;
}

export const AccordionNav: React.FC<AccordionNavProps> = ({ onSelectItem }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    academics: true,
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
      color: 'indigo',
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
        { id: 'request-documents', label: 'Request Document', icon: Search },
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

  const colorMap: Record<string, { header: string; icon: string; item: string; itemHover: string; badge: string }> = {
    indigo: {
      header: 'border-indigo-500/30 bg-indigo-500/10',
      icon: 'bg-indigo-500/20 text-indigo-300',
      item: 'border-white/08 bg-white/04',
      itemHover: 'hover:bg-indigo-500/15 hover:border-indigo-500/30 hover:text-white',
      badge: 'text-indigo-300',
    },
    emerald: {
      header: 'border-emerald-500/30 bg-emerald-500/10',
      icon: 'bg-emerald-500/20 text-emerald-300',
      item: 'border-white/08 bg-white/04',
      itemHover: 'hover:bg-emerald-500/15 hover:border-emerald-500/30 hover:text-white',
      badge: 'text-emerald-300',
    },
    violet: {
      header: 'border-violet-500/30 bg-violet-500/10',
      icon: 'bg-violet-500/20 text-violet-300',
      item: 'border-white/08 bg-white/04',
      itemHover: 'hover:bg-violet-500/15 hover:border-violet-500/30 hover:text-white',
      badge: 'text-violet-300',
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
          <div
            key={category.id}
            className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
              isOpen ? colors.header : 'border-white/08 bg-white/03'
            }`}
          >
            {/* Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/05"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl transition-colors ${isOpen ? colors.icon : 'bg-white/08 text-slate-400'}`}>
                  <CategoryIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[15px] font-bold text-white">{category.title}</span>
                  <p className="text-xs text-slate-500 font-medium">{category.items.length} modules</p>
                </div>
              </div>
              <div className={`transition-all duration-200 ${isOpen ? colors.badge : 'text-slate-500'}`}>
                {isOpen
                  ? <ChevronDown className="w-4 h-4" />
                  : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>

            {/* Body */}
            {isOpen && (
              <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {category.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(category.title, item)}
                      className={`flex items-center space-x-3 p-3 rounded-xl border text-left transition-all duration-200 group text-slate-300 ${colors.item} ${colors.itemHover}`}
                    >
                      <div className={`p-1.5 rounded-lg ${colors.icon} flex-shrink-0 group-hover:scale-110 transition-transform`}>
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
