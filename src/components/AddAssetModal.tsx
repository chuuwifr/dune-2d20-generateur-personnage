import React, { useState } from 'react';
import { Asset } from '../types/dune';
import { COMMON_ASSETS } from '../data/duneData';
import { Shield, X, Plus, Search, Check } from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAsset: (asset: Asset) => void;
  existingAssets: Asset[];
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onAddAsset,
  existingAssets,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Tous');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Custom asset state
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<'tangible' | 'intangible'>('tangible');
  const [customCategory, setCustomCategory] = useState<Asset['category']>('Équipement');
  const [customQuality, setCustomQuality] = useState(0);
  const [customKeywords, setCustomKeywords] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  if (!isOpen) return null;

  const filteredAssets = COMMON_ASSETS.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'Tous' || a.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newAsset: Asset = {
      id: `custom-ast-${Date.now()}`,
      name: customName.trim(),
      type: customType,
      category: customCategory,
      quality: customQuality,
      keywords: customKeywords ? customKeywords.split(',').map((k) => k.trim()) : ['Personnel'],
      description: customDesc.trim() || undefined,
    };

    onAddAsset(newAsset);
    setCustomName('');
    setCustomKeywords('');
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
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                Ajouter un Atout ou Ressource
              </h2>
              <p className="text-xs text-[#a89885]">
                Sélectionnez dans les équipements du livre de base ou créez un atout personnalisé
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="p-4 border-b border-[#2b241c] bg-[#18161d] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8a7a67] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher un atout (krys, bouclier, chantage...)"
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
              {isCustomMode ? 'Bibliothèque officielle' : '+ Atout Personnalisé'}
            </button>
          </div>

          {!isCustomMode && (
            <div className="flex gap-2">
              {['Tous', 'tangible', 'intangible'].map((tp) => (
                <button
                  key={tp}
                  onClick={() => setSelectedType(tp)}
                  className={`px-2.5 py-0.5 rounded text-xs font-mono uppercase transition-all border ${
                    selectedType === tp
                      ? 'bg-[#d4a34b] text-black font-bold border-[#d4a34b]'
                      : 'bg-[#100f13] text-[#a89885] border-[#29221b] hover:border-[#523d24]'
                  }`}
                >
                  {tp === 'tangible' ? 'Tangible (Physique)' : tp === 'intangible' ? 'Intangible (Social/Secret)' : 'Tous'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3 text-xs flex-1">
          {isCustomMode ? (
            <form onSubmit={handleAddCustom} className="space-y-3 bg-[#18161d] p-4 rounded-lg border border-[#3b3022]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#fae5b5] text-xs">Nom de l'atout :</label>
                  <input
                    type="text"
                    placeholder="Ex: Kindjal de duel forgé à la main..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#fae5b5] text-xs">Nature :</label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value as any)}
                    className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded px-3 py-1.5 text-xs text-[#fae5b5]"
                  >
                    <option value="tangible">Tangible (Physique)</option>
                    <option value="intangible">Intangible (Social / Information)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#fae5b5] text-xs">Catégorie :</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded px-3 py-1.5 text-xs text-[#fae5b5]"
                  >
                    <option value="Arme">Arme</option>
                    <option value="Protection">Protection</option>
                    <option value="Équipement">Équipement</option>
                    <option value="Véhicule">Véhicule</option>
                    <option value="Contact">Contact</option>
                    <option value="Information">Information</option>
                    <option value="Faveur">Faveur</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#fae5b5] text-xs">Qualité (0 à 4) :</label>
                  <div className="flex items-center space-x-2">
                    {[0, 1, 2, 3, 4].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setCustomQuality(q)}
                        className={`w-7 h-7 rounded font-mono font-bold text-xs border ${
                          customQuality === q
                            ? 'bg-[#d4a34b] text-black border-[#d4a34b]'
                            : 'bg-[#241c14] text-[#a89885] border-[#4a3a28]'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#fae5b5] text-xs">Mots-clés (séparés par virgule) :</label>
                <input
                  type="text"
                  placeholder="Ex: Arme de corps à corps, Dissimulable, Damacier..."
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#fae5b5] text-xs">Description :</label>
                <textarea
                  rows={2}
                  placeholder="Détails narratifs sur l'origine ou l'utilisation de cet atout..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
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
                  Ajouter l'atout
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredAssets.map((ast) => {
                const isAlreadyPresent = existingAssets.some((ea) => ea.id === ast.id);

                return (
                  <div
                    key={ast.id}
                    className={`p-3 rounded-lg border transition-all flex flex-col justify-between space-y-2 ${
                      isAlreadyPresent
                        ? 'bg-[#1b2418] border-green-800 text-green-300'
                        : 'bg-[#18161d] border-[#2b241c] hover:border-[#5a4224] text-[#fae5b5]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel font-bold text-xs text-[#fae5b5]">{ast.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#291f14] text-[#d4a34b] font-mono">
                          Q{ast.quality} • {ast.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ast.keywords.map((kw, i) => (
                          <span key={i} className="text-[9px] text-[#8a7a67] font-mono">#{kw}</span>
                        ))}
                      </div>
                      {ast.description && (
                        <p className="text-[11px] text-[#a89885] mt-1.5 leading-snug">{ast.description}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#262018] flex justify-end">
                      {isAlreadyPresent ? (
                        <span className="text-[10px] text-green-400 flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Déjà dans la fiche</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            onAddAsset(ast);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded bg-[#2b2014] hover:bg-[#c99738] hover:text-black text-[#d4a34b] border border-[#523d24] text-xs font-semibold flex items-center space-x-1"
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
