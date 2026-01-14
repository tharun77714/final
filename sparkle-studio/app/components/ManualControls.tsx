'use client';

import { useState } from 'react';
import type { ManualControls } from '@/app/actions/jewelry-actions';

interface ManualControlsProps {
  controls: ManualControls;
  onChange: (controls: ManualControls) => void;
}

export default function ManualControls({ controls, onChange }: ManualControlsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['metal', 'stone', 'finish'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateControl = <K extends keyof ManualControls>(
    key: K,
    value: ManualControls[K]
  ) => {
    onChange({ ...controls, [key]: value });
  };

  const SectionHeader = ({ 
    id, 
    title, 
    children 
  }: { 
    id: string; 
    title: string; 
    children: React.ReactNode;
  }) => (
    <div className="border-b border-white/10">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-medium text-white/90">{title}</span>
        <span className="text-white/60">
          {expandedSections.has(id) ? '−' : '+'}
        </span>
      </button>
      {expandedSections.has(id) && (
        <div className="p-4 space-y-4">{children}</div>
      )}
    </div>
  );

  return (
    <div 
      className="w-full h-full overflow-y-auto bg-black/20 backdrop-blur-sm border-r border-white/10"
      style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(139, 92, 246, 0.8) rgba(0, 0, 0, 0.2)'
      }}
    >
      <div className="p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Customize Design</h2>
        
        <div className="space-y-2">
          {/* Metal Selection */}
          <SectionHeader id="metal" title="Metal">
            <div className="grid grid-cols-2 gap-2">
              {(['Gold', 'Rose Gold', 'Silver', 'Platinum'] as const).map((metal) => (
                <button
                  key={metal}
                  onClick={() => updateControl('metal', metal)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    controls.metal === metal
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {metal}
                </button>
              ))}
            </div>
          </SectionHeader>

          {/* Stone Selection */}
          <SectionHeader id="stone" title="Stone">
            <div className="grid grid-cols-2 gap-2">
              {(['Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Pearl'] as const).map((stone) => (
                <button
                  key={stone}
                  onClick={() => updateControl('stone', stone)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    controls.stone === stone
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {stone}
                </button>
              ))}
            </div>
          </SectionHeader>

          {/* Stone Cut Selection */}
          <SectionHeader id="stoneCut" title="Stone Cut">
            <select
              value={controls.stoneCut || ''}
              onChange={(e) => updateControl('stoneCut', e.target.value as ManualControls['stoneCut'])}
              className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Cut</option>
              {(['Round', 'Princess', 'Emerald', 'Oval', 'Pear', 'Marquise', 'Cushion', 'Heart'] as const).map((cut) => (
                <option key={cut} value={cut} className="bg-gray-900">
                  {cut}
                </option>
              ))}
            </select>
          </SectionHeader>

          {/* Finish Slider */}
          <SectionHeader id="finish" title="Finish">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/70">
                <span>Matte</span>
                <span>Glossy</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={controls.finish ?? 50}
                onChange={(e) => updateControl('finish', parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="text-xs text-white/60 text-center">
                {controls.finish !== undefined
                  ? controls.finish < 33
                    ? 'Matte'
                    : controls.finish < 66
                    ? 'Semi-glossy'
                    : 'Glossy'
                  : 'Medium'}
              </div>
            </div>
          </SectionHeader>

          {/* Engraving Text */}
          <SectionHeader id="engraving" title="Engraving Text">
            <div className="space-y-2">
              <input
                type="text"
                value={controls.engravingText || ''}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 50);
                  updateControl('engravingText', value);
                }}
                placeholder="Enter text to engrave..."
                maxLength={50}
                className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-white/40"
              />
              <div className="text-xs text-white/60 text-right">
                {(controls.engravingText?.length || 0)}/50
              </div>
            </div>
          </SectionHeader>

          {/* Complexity Slider */}
          <SectionHeader id="complexity" title="Complexity">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/70">
                <span>Simple</span>
                <span>Intricate</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={controls.complexity ?? 50}
                onChange={(e) => updateControl('complexity', parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="text-xs text-white/60 text-center">
                {controls.complexity !== undefined
                  ? controls.complexity < 33
                    ? 'Simple'
                    : controls.complexity < 66
                    ? 'Moderate'
                    : 'Intricate'
                  : 'Moderate'}
              </div>
            </div>
          </SectionHeader>
        </div>
      </div>
    </div>
  );
}


