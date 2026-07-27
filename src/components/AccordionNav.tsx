import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Calendar,
  Award,
  Library,
  DollarSign,
  Home,
  FileCheck,
  Heart,
  Users,
  Compass,
  Activity,
  Shield,
  Layers,
} from 'lucide-react';

interface AccordionCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  items: { id: string; label: string; icon: React.ElementType; description: string }[];
}

interface AccordionNavProps {
  onSelectItem?: (categoryTitle: string, itemLabel: string) => void;
}

export const AccordionNav: React.FC<AccordionNavProps> = ({ onSelectItem }) => {
  // Category accordion state
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    academics: false,
    services: false,
    campus: false,
  });

  const [activeModalItem, setActiveModalItem] = useState<{
    category: string;
    label: string;
    description: string;
  } | null>(null);

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
        { id: 'courses', label: 'Courses', icon: BookOpen, description: 'Registered course catalog, course codes, and unit allocations.' },
        { id: 'timetables', label: 'Timetables', icon: Calendar, description: 'Weekly lecture schedule and hall allocation timetables.' },
        { id: 'exam-schedule', label: 'Exam Schedule', icon: Calendar, description: 'Semester end examinations timetable & room assignments.' },
        { id: 'results', label: 'Results', icon: Award, description: 'Semester GPA, transcripts preview, and published grades.' },
        { id: 'library', label: 'Library', icon: Library, description: 'Digital e-library catalog, textbook checkout, and research papers.' },
      ],
    },
    {
      id: 'services',
      title: 'Student Services',
      icon: Shield,
      items: [
        { id: 'financial-aid', label: 'Financial Aid', icon: DollarSign, description: 'Tuition fees payment portal, scholarships, and bursary aid.' },
        { id: 'hostel-booking', label: 'Hostel Booking', icon: Home, description: 'On-campus hostel room allocation and reservation portal.' },
        { id: 'transcripts', label: 'Transcripts', icon: FileCheck, description: 'Official academic transcript request & processing service.' },
        { id: 'counseling', label: 'Counseling', icon: Heart, description: 'Student guidance, mental wellbeing & academic counseling appointment.' },
      ],
    },
    {
      id: 'campus',
      title: 'Campus Life',
      icon: Layers,
      items: [
        { id: 'clubs', label: 'Clubs & Societies', icon: Users, description: 'Student associations, departmental societies, and student union.' },
        { id: 'events', label: 'Events', icon: Calendar, description: 'Upcoming campus workshops, seminars, and social gatherings.' },
        { id: 'sports', label: 'Sports', icon: Activity, description: 'Intramural sports leagues, gymnasium scheduling, and tournaments.' },
        { id: 'campus-map', label: 'Campus Map', icon: Compass, description: 'Interactive map of faculty buildings, labs, and auditoriums.' },
        { id: 'health-services', label: 'Health Services', icon: Heart, description: 'Campus medical clinic info, emergency contacts, and health forms.' },
      ],
    },
  ];

  const handleItemClick = (categoryTitle: string, item: { label: string; description: string }) => {
    setActiveModalItem({
      category: categoryTitle,
      label: item.label,
      description: item.description,
    });
    if (onSelectItem) {
      onSelectItem(categoryTitle, item.label);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-offwhite uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Academic Directory
        </h3>
        <span className="text-xs text-slate-400">3 Categories</span>
      </div>

      <div className="space-y-2">
        {categories.map((category) => {
          const CategoryIcon = category.icon;
          const isOpen = !!openCategories[category.id];

          return (
            <div
              key={category.id}
              className="bg-navy-800/90 border border-slate-700/60 rounded-xl overflow-hidden shadow-sm transition-all"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-offwhite hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-navy-900 text-slate-400'}`}>
                    <CategoryIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-100">{category.title}</span>
                    <p className="text-[11px] text-slate-400 font-normal">{category.items.length} Modules</p>
                  </div>
                </div>
                <div className="text-slate-400">
                  {isOpen ? <ChevronDown className="w-5 h-5 text-emerald-400" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </button>

              {/* Accordion Items Body */}
              {isOpen && (
                <div className="px-3 pb-3 pt-1 border-t border-slate-700/40 bg-navy-900/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {category.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(category.title, item)}
                        className="flex items-center space-x-2.5 p-2 rounded-lg bg-navy-800/80 hover:bg-slate-700/60 border border-slate-700/40 text-left transition-all text-slate-200 hover:text-emerald-400 group"
                      >
                        <ItemIcon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Item Detail Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20">
                  {activeModalItem.category}
                </span>
                <h4 className="text-lg font-bold text-offwhite mt-1">{activeModalItem.label}</h4>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 hover:bg-slate-700/50 rounded-lg"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{activeModalItem.description}</p>
            <div className="p-3 bg-navy-900/80 rounded-xl border border-slate-700/50 text-xs text-slate-400">
              ℹ️ Portal service online. Connected to HICM Academic Database.
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold text-xs rounded-xl transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
