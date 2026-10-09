import React, { useState, useEffect } from 'react';
import { HouseInfo, HouseType } from '../types/dune';
import { 
  HOUSE_TYPES, 
  HOUSE_TRAITS_SUGGESTIONS, 
  HOUSE_COLORS_PRESETS, 
  HOUSE_SIGIL_PRESETS, 
  HOUSE_HOMEWORLD_PRESETS,
  HOUSE_DOMAIN_AREAS,
  HOUSE_DOMAIN_ROLES,
  HOUSE_RULER_TITLES,
  HOUSE_MOTTOS,
  generateRandomHouse,
  getStoredCustomHouses,
  saveCustomHouseToStorage,
  deleteCustomHouseFromStorage
} from '../utils/houseGenerator';
import { PRESET_HOUSES } from '../data/duneData';
import { 
  X, 
  Shield, 
  Sparkles, 
  RotateCcw, 
  Save, 
  Trash2, 
  Check, 
  Copy, 
  BookMarked, 
  Globe, 
  Crown, 
  Scroll, 
  Palette,
  Flag,
  Flame,
  Award
} from 'lucide-react';

interface HouseCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHouse: HouseInfo;
  onApplyHouse: (updatedHouse: HouseInfo) => void;
}

export const HouseCustomizerModal: React.FC<HouseCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentHouse,
  onApplyHouse,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'library'>('editor');
  
  // House form state
  const [formData, setFormData] = useState<HouseInfo>(() => ({
    ...currentHouse,
    id: currentHouse.id || `house-${Date.now()}`,
    isCustom: true,
  }));

  // Saved houses library state
  const [savedHouses, setSavedHouses] = useState<HouseInfo[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync with currentHouse prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...currentHouse,
        id: currentHouse.id || `house-${Date.now()}`,
        isCustom: true,
      });
      setSavedHouses(getStoredCustomHouses());
      setSaveSuccessMsg(null);
    }
  }, [isOpen, currentHouse]);

  if (!isOpen) return null;

  const handleRandomize = () => {
    const generated = generateRandomHouse();
    setFormData(generated);
    setSaveSuccessMsg('Maison générée aléatoirement avec succès !');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleApply = () => {
    const finalized: HouseInfo = {
      ...formData,
      isCustom: true,
      name: formData.name.trim() || 'Maison Personnalisée',
      reputationTrait: formData.reputationTrait.trim() || 'Fidèle',
      homeworld: formData.homeworld.trim() || 'Monde Inconnu',
      primaryDomain: formData.primaryDomain.trim() || 'Armée (Experts)',
      secondaryDomain: formData.secondaryDomain.trim() || 'Commerce (Production)',
      colors: formData.colors.trim() || 'Or et Écarlate',
      sigil: formData.sigil.trim() || 'Faucon d’acier',
    };
    // Also save to library automatically
    saveCustomHouseToStorage(finalized);
    onApplyHouse(finalized);
    onClose();
  };

  const handleSaveToLibrary = () => {
    const finalized: HouseInfo = {
      ...formData,
      isCustom: true,
      name: formData.name.trim() || 'Maison Personnalisée',
    };
    const updated = saveCustomHouseToStorage(finalized);
    setSavedHouses(updated);
    setSaveSuccessMsg('Maison sauvegardée dans votre bibliothèque de fiefs !');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDeleteFromLibrary = (idOrName: string) => {
    const updated = deleteCustomHouseFromStorage(idOrName);
    setSavedHouses(updated);
  };

  const handleLoadFromLibrary = (h: HouseInfo) => {
    setFormData({
      ...h,
      id: `house-custom-${Date.now()}`,
      isCustom: true,
    });
    setActiveTab('editor');
    setSaveSuccessMsg(`Modèle de "${h.name}" chargé dans l’éditeur !`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#131117] border border-[#523d24] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1c1722] via-[#241c14] to-[#1a140f] p-4 sm:p-5 border-b border-[#473620] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#3b2915] border border-[#d4a34b]/40 flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-[#d4a34b]" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold text-[#fae5b5] flex items-center gap-2">
                Personnalisation de la Maison Noble
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#c99738]/20 text-[#d4a34b] border border-[#c99738]/40">
                  Dune 2d20
                </span>
              </h2>
              <p className="text-xs text-[#a89885]">
                Forgez un fief unique, son rang dans le Landsraad, sa devise, ses domaines et ses armoiries.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRandomize}
              className="px-3 py-1.5 rounded-lg bg-[#2e2014] hover:bg-[#422d19] text-[#e09145] hover:text-[#fae5b5] border border-[#5c3e1e] text-xs font-semibold flex items-center space-x-1.5 transition-all shadow"
              title="Générer une maison noble aléatoire complète"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Générer Aléatoire</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#a89885] hover:text-white hover:bg-[#28212a] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#18151e] border-b border-[#2e261e] px-4 flex items-center justify-between shrink-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-2.5 px-3.5 text-xs font-medium border-b-2 transition-all flex items-center space-x-1.5 ${
                activeTab === 'editor'
                  ? 'border-[#d4a34b] text-[#fae5b5] font-semibold'
                  : 'border-transparent text-[#8c7d6c] hover:text-[#d4a34b]'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>Éditeur de Fief</span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`py-2.5 px-3.5 text-xs font-medium border-b-2 transition-all flex items-center space-x-1.5 ${
                activeTab === 'library'
                  ? 'border-[#d4a34b] text-[#fae5b5] font-semibold'
                  : 'border-transparent text-[#8c7d6c] hover:text-[#d4a34b]'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Bibliothèque des Maisons ({savedHouses.length + PRESET_HOUSES.length})</span>
            </button>
          </div>

          {saveSuccessMsg && (
            <span className="text-[11px] text-[#48bb78] font-medium flex items-center gap-1 animate-pulse">
              <Check className="w-3.5 h-3.5" />
              {saveSuccessMsg}
            </span>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'editor' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form columns (left 7/12) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* 1. Identity & Rank */}
                <div className="bg-[#18161f] p-4 rounded-xl border border-[#382b1d] space-y-3.5">
                  <div className="flex items-center space-x-2 border-b border-[#2d2218] pb-2">
                    <Crown className="w-4 h-4 text-[#d4a34b]" />
                    <span className="font-cinzel text-xs font-bold text-[#fae5b5] uppercase tracking-wider">
                      1. Identité & Rang Féodal
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#a89885] block">
                        Nom de la Maison *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Maison Thorne, Maison Atréides..."
                        className="w-full bg-[#0e0e13] border border-[#4d3a24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#a89885] block">
                        Rang dans le Landsraad *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as HouseType })}
                        className="w-full bg-[#0e0e13] border border-[#4d3a24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                      >
                        {HOUSE_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Devise (Motto) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono text-[#a89885]">
                        Devise héraldique (Motto)
                      </label>
                      <span className="text-[10px] text-[#7d6e5d]">Paroles de la Maison</span>
                    </div>
                    <input
                      type="text"
                      value={formData.motto || ''}
                      onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                      placeholder="Ex: L’honneur avant la vie / Le silence est souverain..."
                      className="w-full bg-[#0e0e13] border border-[#4d3a24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                    />
                    {/* Quick motto chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {HOUSE_MOTTOS.slice(0, 4).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setFormData({ ...formData, motto: m })}
                          className="text-[10px] bg-[#221c26] hover:bg-[#342738] text-[#c9b79c] px-2 py-0.5 rounded border border-[#3a2c20] truncate max-w-[200px]"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ruler Title & Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#a89885] block">
                        Titre du Régent
                      </label>
                      <select
                        value={formData.rulerTitle || 'Duc'}
                        onChange={(e) => setFormData({ ...formData, rulerTitle: e.target.value })}
                        className="w-full bg-[#0e0e13] border border-[#4d3a24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                      >
                        {HOUSE_RULER_TITLES.map((title) => (
                          <option key={title} value={title}>{title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#a89885] block">
                        Nom du Dirigeant
                      </label>
                      <input
                        type="text"
                        value={formData.rulerName || ''}
                        onChange={(e) => setFormData({ ...formData, rulerName: e.target.value })}
                        placeholder="Ex: Duc Leto, Baronne Kara..."
                        className="w-full bg-[#0e0e13] border border-[#4d3a24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Homeworld & Reputation Trait */}
                <div className="bg-[#18161f] p-4 rounded-xl border border-[#382b1d] space-y-3.5">
                  <div className="flex items-center space-x-2 border-b border-[#2d2218] pb-2">
                    <Globe className="w-4 h-4 text-[#d4a34b]" />
                    <span className="font-cinzel text-xs font-bold text-[#fae5b5] uppercase tracking-wider">
                      2. Monde d’Origine & Trait de Réputation
                    </span>
                  </div>

                  {/* Homeworld */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-[#a89885] block">
                      Monde d’origine (Homeworld)
                    </label>
                    <input
                      type="text"
                      value={formData.homeworld}
                      onChange={(e) => setFormData({ ...formData, homeworld: e.target.value })}
                      placeholder="Ex: Caladan (Planète-océan), Giedi Prime..."
                      className="w-full bg-[#0e0e13] border border-[#4d3a24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                    />
                    {/* Quick world chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {HOUSE_HOMEWORLD_PRESETS.slice(0, 6).map((hw) => (
                        <button
                          key={hw.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, homeworld: `${hw.name} (${hw.type})` })}
                          className="text-[10px] bg-[#221c26] hover:bg-[#342738] text-[#c9b79c] px-2 py-0.5 rounded border border-[#3a2c20]"
                        >
                          {hw.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reputation Trait */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono text-[#a89885] block">
                        Trait de Réputation de la Maison *
                      </label>
                      <span className="text-[10px] text-[#e09145] font-sans">
                        Empruntable pour 1 Impulsion
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.reputationTrait}
                      onChange={(e) => setFormData({ ...formData, reputationTrait: e.target.value })}
                      placeholder="Ex: Honorable, Brutale, Secrète, Innovatrice..."
                      className="w-full bg-[#0e0e13] border border-[#4d3a24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                    />
                    {/* Quick trait chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {HOUSE_TRAITS_SUGGESTIONS.map((trait) => (
                        <button
                          key={trait}
                          type="button"
                          onClick={() => setFormData({ ...formData, reputationTrait: trait })}
                          className={`text-[10px] px-2 py-0.5 rounded transition-all ${
                            formData.reputationTrait.toLowerCase() === trait.toLowerCase()
                              ? 'bg-[#c99738] text-black font-semibold'
                              : 'bg-[#221c26] hover:bg-[#342738] text-[#c9b79c] border border-[#3a2c20]'
                          }`}
                        >
                          {trait}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Domains */}
                <div className="bg-[#18161f] p-4 rounded-xl border border-[#382b1d] space-y-3.5">
                  <div className="flex items-center space-x-2 border-b border-[#2d2218] pb-2">
                    <Flame className="w-4 h-4 text-[#d4a34b]" />
                    <span className="font-cinzel text-xs font-bold text-[#fae5b5] uppercase tracking-wider">
                      3. Domaines d’Excellence
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#a89885] block">
                        Domaine Primaire *
                      </label>
                      <input
                        type="text"
                        value={formData.primaryDomain}
                        onChange={(e) => setFormData({ ...formData, primaryDomain: e.target.value })}
                        placeholder="Ex: Armée (Experts) – Tacticiens et Maîtres d'armes"
                        className="w-full bg-[#0e0e13] border border-[#4d3a24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#a89885] block">
                        Domaine Secondaire *
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryDomain}
                        onChange={(e) => setFormData({ ...formData, secondaryDomain: e.target.value })}
                        placeholder="Ex: Commerce (Production) – Riz pundi et vignes"
                        className="w-full bg-[#0e0e13] border border-[#4d3a24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                      />
                    </div>

                    {/* Quick domain builder helper */}
                    <div className="pt-1 text-[10px] text-[#8c7d6c]">
                      Suggestions de domaines rapides :
                      <div className="flex flex-wrap gap-1 mt-1">
                        {HOUSE_DOMAIN_AREAS.slice(0, 6).map((area) => (
                          <button
                            key={area}
                            type="button"
                            onClick={() => {
                              const newDom = `${area} (Production)`;
                              if (!formData.primaryDomain) {
                                setFormData({ ...formData, primaryDomain: newDom });
                              } else {
                                setFormData({ ...formData, secondaryDomain: newDom });
                              }
                            }}
                            className="bg-[#241e2a] hover:bg-[#342738] text-[#c9b79c] px-2 py-0.5 rounded border border-[#3b2a1a]"
                          >
                            + {area}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Heraldry & Banner */}
                <div className="bg-[#18161f] p-4 rounded-xl border border-[#382b1d] space-y-3.5">
                  <div className="flex items-center space-x-2 border-b border-[#2d2218] pb-2">
                    <Palette className="w-4 h-4 text-[#d4a34b]" />
                    <span className="font-cinzel text-xs font-bold text-[#fae5b5] uppercase tracking-wider">
                      4. Héraldique & Bannière
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#a89885] block">
                        Couleurs Héraldiques
                      </label>
                      <input
                        type="text"
                        value={formData.colors}
                        onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                        placeholder="Ex: Vert et Noir, Or et Écarlate..."
                        className="w-full bg-[#0e0e13] border border-[#4d3a24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#a89885] block">
                        Sceau & Emblème (Sigil)
                      </label>
                      <input
                        type="text"
                        value={formData.sigil}
                        onChange={(e) => setFormData({ ...formData, sigil: e.target.value })}
                        placeholder="Ex: Faucon rouge, Griffon d'acier, Lion d'Or..."
                        className="w-full bg-[#0e0e13] border border-[#4d3a24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                      />
                    </div>
                  </div>

                  {/* Quick color preset chips */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] text-[#8c7d6c] block">Palettes héraldiques courantes :</label>
                    <div className="flex flex-wrap gap-1">
                      {HOUSE_COLORS_PRESETS.slice(0, 6).map((c) => (
                        <button
                          key={c.label}
                          type="button"
                          onClick={() => setFormData({ ...formData, colors: c.colors })}
                          className="text-[10px] bg-[#221c26] hover:bg-[#342738] text-[#c9b79c] px-2 py-0.5 rounded border border-[#3a2c20]"
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Banner description */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-mono text-[#a89885] block">
                      Description de la Bannière
                    </label>
                    <textarea
                      rows={2}
                      value={formData.bannerDescription || ''}
                      onChange={(e) => setFormData({ ...formData, bannerDescription: e.target.value })}
                      placeholder="Ex: Faucon rouge stylisé en plein vol sur champ coupé de sinople et de sable."
                      className="w-full bg-[#0e0e13] border border-[#4d3a24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                    />
                  </div>

                  {/* Historical notes */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-mono text-[#a89885] block">
                      Historique & Particularités du Fief
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Ex: Maison réputée pour sa flotte d’ornithoptères et sa loyauté indéfectible..."
                      className="w-full bg-[#0e0e13] border border-[#4d3a24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                    />
                  </div>
                </div>

              </div>

              {/* Live Heraldic Crest Preview (right 5/12) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="sticky top-2 bg-gradient-to-b from-[#1b1723] via-[#15121a] to-[#0f0e13] p-5 rounded-xl border-2 border-[#d4a34b]/40 shadow-xl space-y-4 text-center">
                  
                  <div className="flex items-center justify-between border-b border-[#3a2c1f] pb-2 text-left">
                    <span className="text-[10px] font-cinzel font-bold text-[#d4a34b] uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Blason Héraldique
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3a2916] text-[#fae5b5] border border-[#5c4021]">
                      {formData.type}
                    </span>
                  </div>

                  {/* Crest Shield Badge */}
                  <div className="relative mx-auto w-24 h-28 sm:w-28 sm:h-32 rounded-b-full bg-gradient-to-b from-[#3a2c1a] via-[#1f1710] to-[#0c0a08] border-2 border-[#d4a34b] shadow-2xl flex flex-col items-center justify-center p-2 overflow-hidden group">
                    <div className="absolute inset-0 bg-radial-gradient from-[#d4a34b]/20 to-transparent pointer-events-none" />
                    <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-[#d4a34b] mb-1 drop-shadow-md group-hover:scale-105 transition-transform" />
                    <span className="text-[9px] font-mono text-[#fae5b5] text-center line-clamp-1 font-bold">
                      {formData.sigil || 'Sceau'}
                    </span>
                    <div className="text-[8px] text-[#a89885] mt-0.5 line-clamp-1">
                      {formData.colors.split('(')[0]}
                    </div>
                  </div>

                  {/* House Name & Motto */}
                  <div className="space-y-1">
                    <h3 className="font-cinzel text-lg sm:text-xl font-extrabold text-[#fae5b5] tracking-wide">
                      {formData.name || 'Maison sans Nom'}
                    </h3>
                    {formData.motto ? (
                      <p className="text-xs text-[#d4a34b] italic font-serif">
                        « {formData.motto} »
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#7d6e5d] italic">
                        Aucune devise héraldique
                      </p>
                    )}
                  </div>

                  {/* Key Stats Pill Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                    <span className="px-2.5 py-1 rounded bg-[#2e2316] text-[#fae5b5] border border-[#523d24] flex items-center gap-1 text-[11px]">
                      <Globe className="w-3 h-3 text-[#d4a34b]" />
                      {formData.homeworld}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-[#8c4e1a]/30 text-[#e09145] border border-[#8c4e1a]/50 text-[11px] font-semibold">
                      Trait : {formData.reputationTrait}
                    </span>
                  </div>

                  {/* Domains Summary */}
                  <div className="bg-[#100f14] p-3 rounded-lg border border-[#2e2419] text-left space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-[#a89885] block">Domaine Primaire :</span>
                      <span className="text-[#fae5b5] font-medium">{formData.primaryDomain}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#a89885] block">Domaine Secondaire :</span>
                      <span className="text-[#c9b79c]">{formData.secondaryDomain}</span>
                    </div>
                    {formData.bannerDescription && (
                      <div className="pt-1 border-t border-[#241c14]">
                        <span className="text-[10px] font-mono text-[#a89885] block">Bannière :</span>
                        <span className="text-[11px] text-[#a89885] italic">{formData.bannerDescription}</span>
                      </div>
                    )}
                    {formData.rulerName && (
                      <div className="pt-1 border-t border-[#241c14]">
                        <span className="text-[10px] font-mono text-[#a89885] block">Souverain légitime :</span>
                        <span className="text-[11px] text-[#d4a34b] font-medium">{formData.rulerName}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Action buttons */}
                  <div className="pt-2 space-y-2">
                    <button
                      onClick={handleSaveToLibrary}
                      className="w-full py-2 rounded-lg bg-[#291f14] hover:bg-[#3d2d1d] text-[#fae5b5] border border-[#5c4021] text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow"
                    >
                      <Save className="w-3.5 h-3.5 text-[#d4a34b]" />
                      <span>Sauvegarder dans la Bibliothèque</span>
                    </button>

                    <button
                      onClick={handleApply}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#c99738] to-[#9e6224] hover:from-[#d9a84a] hover:to-[#b3702a] text-[#120f0a] font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-lg"
                    >
                      <Check className="w-4 h-4" />
                      <span>Appliquer à ce Personnage</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Library Tab */
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#fae5b5]">
                    Bibliothèque des Maisons Nobles
                  </h3>
                  <p className="text-xs text-[#a89885]">
                    Sélectionnez un fief de l’Imperium pour charger ses caractéristiques ou réutiliser une maison personnalisée.
                  </p>
                </div>

                <button
                  onClick={handleRandomize}
                  className="px-3 py-1.5 rounded-lg bg-[#291f14] hover:bg-[#3d2d1d] text-[#e09145] border border-[#5c4021] text-xs font-semibold flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Générer un Fief</span>
                </button>
              </div>

              {/* Saved Custom Houses */}
              {savedHouses.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-cinzel font-bold text-[#d4a34b] uppercase">
                    <Save className="w-3.5 h-3.5" />
                    <span>Vos Fiefs Personnalisés ({savedHouses.length})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {savedHouses.map((h) => (
                      <div
                        key={h.id || h.name}
                        className="bg-[#1c1724] border border-[#4d3a24] rounded-lg p-3.5 space-y-2 flex flex-col justify-between hover:border-[#d4a34b] transition-all shadow-md"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-cinzel font-bold text-sm text-[#fae5b5] truncate">{h.name}</h4>
                            <span className="text-[10px] font-mono text-[#d4a34b]">{h.type}</span>
                          </div>
                          {h.motto && (
                            <p className="text-[11px] text-[#c9b79c] italic truncate">« {h.motto} »</p>
                          )}
                          <div className="text-xs text-[#a89885] mt-1 line-clamp-1">{h.primaryDomain}</div>
                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#2e261e] mt-2 text-[#8c7d6c]">
                            <span>Trait : <strong className="text-[#e09145]">{h.reputationTrait}</strong></span>
                            <span>{h.homeworld}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2 border-t border-[#2e261e]">
                          <button
                            onClick={() => handleLoadFromLibrary(h)}
                            className="flex-1 py-1 px-2 rounded bg-[#c99738] hover:bg-[#d9a84a] text-black text-xs font-semibold text-center transition-all"
                          >
                            Charger
                          </button>
                          <button
                            onClick={() => handleDeleteFromLibrary(h.id || h.name)}
                            className="p-1 rounded bg-[#2e1c1c] hover:bg-[#472222] text-[#e06060] transition-all"
                            title="Supprimer cette maison personnalisée"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard Canon Houses */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2 text-xs font-cinzel font-bold text-[#fae5b5] uppercase">
                  <Shield className="w-3.5 h-3.5 text-[#d4a34b]" />
                  <span>Grandes & Petites Maisons de l’Imperium (Officielles)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PRESET_HOUSES.map((h) => (
                    <div
                      key={h.name}
                      className="bg-[#18161f] border border-[#2e261e] rounded-lg p-3.5 space-y-2 flex flex-col justify-between hover:border-[#5c4021] transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-cinzel font-bold text-sm text-[#fae5b5] truncate">{h.name}</h4>
                          <span className="text-[10px] font-mono text-[#d4a34b]">{h.type}</span>
                        </div>
                        {h.motto && (
                          <p className="text-[11px] text-[#c9b79c] italic truncate">« {h.motto} »</p>
                        )}
                        <div className="text-xs text-[#a89885] mt-1 line-clamp-1">{h.primaryDomain}</div>
                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#2e261e] mt-2 text-[#8c7d6c]">
                          <span>Trait : <strong className="text-[#e09145]">{h.reputationTrait}</strong></span>
                          <span>{h.homeworld}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#2e261e] flex items-center space-x-2">
                        <button
                          onClick={() => handleLoadFromLibrary(h)}
                          className="w-full py-1 px-2 rounded bg-[#291f14] hover:bg-[#3d2d1d] text-[#fae5b5] border border-[#5c4021] text-xs font-semibold text-center transition-all"
                        >
                          Charger comme Modèle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#121015] border-t border-[#382b1d] p-3.5 sm:px-6 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#8c7d6c] hidden sm:block">
            Système Dune : Aventures dans l’Imperium • Règle d'Emprunt de Trait de Maison incluse
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#221c26] hover:bg-[#2d2533] text-[#c9b79c] text-xs font-medium transition-all"
            >
              Fermer
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-lg bg-[#c99738] hover:bg-[#d9a84a] text-black font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Valider & Appliquer</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
