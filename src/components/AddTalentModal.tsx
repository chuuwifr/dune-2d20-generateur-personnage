import React, { useState } from 'react';
import { Talent, VocationType } from '../types/dune';
import { TALENTS_LIST } from '../data/duneData';
import { Sparkles, X, Plus, Search, Check } from 'lucide-react';

interface AddTalentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTalent: (talent: Talent) => void;
  existingTalents: Talent[];
  currentVocation: VocationType;
}

export const AddTalentModal: React.FC<AddTalentModalProps> = ({
  isOpen,
  onClose,
  onAddTalent,
  existingTalents,
  currentVocation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Custom talent state
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Personnalisé');
  const [customDesc, setCustomDesc] = useState('');

  if (!isOpen) return null;

  const categories = ['Tous', 'Combat', 'Discipline', 'Mobilité', 'Social', 'Bene Gesserit', 'Mentat', 'Docteur Suk', 'Guilde', 'Fremen'];

  const filteredTalents = TALENTS_LIST.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customDesc.trim()) return;

    const newTalent: Talent = {
      id: `custom-tal-${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      description: customDesc.trim(),
    };

    onAddTalent(newTalent);
    setCustomName('');
    setCustomDesc('');
    setIsCustomMode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#15141a] rounded-xl border border-[#523d24] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#382b1c] bg-[#1a1820] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#2b2014] text-[#d4a34b] border border-[#5c4021]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                Ajouter un Talent ou une Discipline
              </h2>
              <p className="text-xs text-[#a89885]">
                Sélectionnez dans la bibliothèque officielle de Dune ou créez une capacité sur mesure
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle & Search */}
        <div className="p-4 border-b border-[#2b241c] bg-[#18161d] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8a7a67] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher un talent (nom, effet...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
              />
            </div>

            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all ${
                isCustomMode
                  ? 'bg-[#c99738] text-black border-[#c99738]'
                  : 'bg-[#241c14] text-[#d4a34b] border-[#523d24] hover:bg-[#382b1c]'
              }`}
            >
              {isCustomMode ? 'Bibliothèque officielle' : '+ Talent Personnalisé'}
            </button>
          </div>

          {!isCustomMode && (
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all border ${
                    selectedCategory === cat
                      ? 'bg-[#d4a34b] text-black font-bold border-[#d4a34b]'
                      : 'bg-[#100f13] text-[#a89885] border-[#29221b] hover:border-[#523d24]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3 text-xs flex-1">
          {isCustomMode ? (
            <form onSubmit={handleAddCustom} className="space-y-3 bg-[#18161d] p-4 rounded-lg border border-[#3b3022]">
              <div className="space-y-1">
                <label className="font-bold text-[#fae5b5] text-xs">Nom du talent :</label>
                <input
                  type="text"
                  placeholder="Ex: Œil de faucon, Réflexes d'acier..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#fae5b5] text-xs">Catégorie :</label>
                <input
                  type="text"
                  placeholder="Ex: Combat, Espionnage, Tactique..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#fae5b5] text-xs">Description et règle mécanique :</label>
                <textarea
                  rows={3}
                  placeholder="Décrivez les effets (ex: Dépenser 1 point d'Impulsion pour relancer 1d20 lors des tests de Combat...)"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="px-3 py-1.5 text-gray-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#c99738] hover:bg-[#d9a84a] text-black font-bold text-xs"
                >
                  Ajouter le talent
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredTalents.map((t) => {
                const isAlreadyPresent = existingTalents.some((et) => et.id === t.id);
                const isRestricted = t.restriction && t.restriction !== currentVocation;

                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-lg border transition-all flex flex-col justify-between space-y-2 ${
                      isAlreadyPresent
                        ? 'bg-[#1b2418] border-green-800 text-green-300'
                        : isRestricted
                        ? 'bg-[#121115] border-[#222] text-gray-600 opacity-50'
                        : 'bg-[#18161d] border-[#2b241c] hover:border-[#5a4224] text-[#fae5b5]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel font-bold text-xs text-[#fae5b5]">{t.name}</span>
                        {t.category && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#291f14] text-[#d4a34b] font-mono">
                            {t.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#a89885] mt-1 leading-snug">{t.description}</p>
                      {t.restriction && (
                        <div className="text-[10px] text-[#e09145] font-mono mt-1">
                          Prérequis : {t.restriction}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#262018] flex justify-end">
                      {isAlreadyPresent ? (
                        <span className="text-[10px] text-green-400 flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Déjà possédé</span>
                        </span>
                      ) : (
                        <button
                          disabled={Boolean(isRestricted)}
                          onClick={() => {
                            onAddTalent(t);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded bg-[#2b2014] hover:bg-[#c99738] hover:text-black text-[#d4a34b] border border-[#523d24] text-xs font-semibold flex items-center space-x-1 disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Ajouter</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#382b1c] bg-[#1a1820] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-[#a89885] hover:text-white"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
