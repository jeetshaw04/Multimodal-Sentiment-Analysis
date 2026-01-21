import { FileText, Headphones, Video } from 'lucide-react';

type InputType = 'text' | 'audio' | 'video';

interface InputTabsProps {
  activeTab: InputType;
  onTabChange: (tab: InputType) => void;
}

const InputTabs = ({ activeTab, onTabChange }: InputTabsProps) => {
  const tabs = [
    { id: 'text' as InputType, label: 'Text', icon: FileText },
    { id: 'audio' as InputType, label: 'Audio', icon: Headphones },
    { id: 'video' as InputType, label: 'Video', icon: Video },
  ];

  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-card/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                isActive
                  ? 'gradient-button text-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InputTabs;
