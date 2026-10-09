import React, { useState } from 'react';
import { 
  DuneCharacter, 
  SkillName, 
  PrincipleName, 
  CharacterTrait, 
  Asset, 
  Talent,
  VocationType,
  HouseType,
  HouseInfo
} from '../types/dune';
import { 
  SKILLS_INFO, 
  PRINCIPLES_INFO,
  ARCHETYPES_DATA,
  VOCATIONS_DATA,
  SPECIALIZATIONS_BY_SKILL,
  SUGGESTED_MAXIMES,
  PRESET_HOUSES
} from '../data/duneData';
import { generateRandomName } from '../utils/backgroundGenerator';
import { AddTalentModal } from './AddTalentModal';
import { AddAssetModal } from './AddAssetModal';
import { HouseCustomizerModal } from './HouseCustomizerModal';
import { 
  Shield, 
  Sword, 
  Sparkles, 
  Dices, 
  Tag, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Info, 
  Zap, 
  Award, 
  Bookmark, 
  Compass, 
  FileEdit, 
  Pencil,
  Check,
  RotateCcw,
  Sliders,
  ChevronDown,
  X
} from 'lucide-react';

interface CharacterSheetProps {
  character: DuneCharacter;
  setCharacter: React.Dispatch<React.SetStateAction<DuneCharacter>>;
  onOpenDiceTest: (skill?: SkillName, principle?: PrincipleName) => void;
  onOpenBackstoryGen: () => void;
  onOpenWizard: () => void;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  setCharacter,
  onOpenDiceTest,
  onOpenBackstoryGen,
  onOpenWizard,
}) => {
  // Global Edit Mode toggle
  const [isEditMode, setIsEditMode] = useState(false);

  // Modals state
  const [isAddTalentOpen, setIsAddTalentOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isHouseModalOpen, setIsHouseModalOpen] = useState(false);

  // House customization handler
  const handleApplyHouse = (updatedHouse: HouseInfo) => {
    const updatedTraits = character.traits.filter((t) => t.type !== 'maison');
    updatedTraits.push({
      id: `trait-house-${Date.now()}`,
      name: `${updatedHouse.name} (${updatedHouse.reputationTrait})`,
      type: 'maison',
      effectHint: `Permet d’emprunter le trait "${updatedHouse.reputationTrait}" pour 1 Impulsion durant une scène`,
    });
    setCharacter((prev) => ({
      ...prev,
      house: updatedHouse,
      traits: updatedTraits,
    }));
  };

  // Borrow house trait (for 1 Momentum in play)
  const isBorrowedHouseTraitActive = character.traits.some(
    (t) => t.name.startsWith('Emprunt : ') && t.type === 'situationnel'
  );

  const handleToggleBorrowHouseTrait = () => {
    if (isBorrowedHouseTraitActive) {
      setCharacter((prev) => ({
        ...prev,
        traits: prev.traits.filter((t) => !(t.name.startsWith('Emprunt : ') && t.type === 'situationnel')),
      }));
    } else {
      const borrowedTrait: CharacterTrait = {
        id: `borrowed-house-trait-${Date.now()}`,
        name: `Emprunt : ${character.house.reputationTrait} (${character.house.name})`,
        type: 'situationnel',
        effectHint: `Trait de Maison emprunté pour 1 Impulsion durant toute la scène en cours`,
      };
      setCharacter((prev) => ({
        ...prev,
        traits: [...prev.traits, borrowedTrait],
      }));
    }
  };

  // Trait management state
  const [selectedTraitInfo, setSelectedTraitInfo] = useState<CharacterTrait | null>(null);
  const [newTraitName, setNewTraitName] = useState('');
  const [newTraitType, setNewTraitType] = useState<CharacterTrait['type']>('situationnel');
  const [showAddTrait, setShowAddTrait] = useState(false);
  const [showTraitGuide, setShowTraitGuide] = useState(false);

  // Inline specialization input state per skill
  const [newSpecSkill, setNewSpecSkill] = useState<SkillName | null>(null);
  const [newSpecName, setNewSpecName] = useState('');

  // Toggle bafoué status of a principle
  const handleTogglePrincipleBafoue = (pName: PrincipleName) => {
    setCharacter((prev) => {
      const current = prev.principles[pName];
      const isNowBroken = !current.isBroken;
      return {
        ...prev,
        determination: isNowBroken ? Math.min(3, prev.determination + 1) : prev.determination,
        principles: {
          ...prev.principles,
          [pName]: {
            ...current,
            isBroken: isNowBroken,
          },
        },
      };
    });
  };

  // Trait actions
  const handleAddTrait = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraitName.trim()) return;

    let hint = 'Facilite ou complique les actions de la scène';
    if (newTraitType === 'situationnel') hint = 'Modifie la difficulté (+1 / -1) ou rend une action possible/impossible';
    if (newTraitType === 'réputation') hint = 'Influence la perception d’autrui et les tests sociaux de Rhétorique';
    if (newTraitType === 'rôle') hint = 'Définit les domaines d’action autorisés et le statut';
    if (newTraitType === 'maison') hint = 'Peut être emprunté pour 1 Impulsion durant une scène';

    const newTrait: CharacterTrait = {
      id: `trait-${Date.now()}`,
      name: newTraitName.trim(),
      type: newTraitType,
      effectHint: hint,
    };

    setCharacter((prev) => ({
      ...prev,
      traits: [...prev.traits, newTrait],
    }));

    setNewTraitName('');
    setShowAddTrait(false);
  };

  const handleRemoveTrait = (id: string) => {
    setCharacter((prev) => ({
      ...prev,
      traits: prev.traits.filter((t) => t.id !== id),
    }));
  };

  // Skill Score adjustments
  const handleAdjustSkill = (skillName: SkillName, delta: number) => {
    setCharacter((prev) => {
      const cur = prev.skills[skillName].value;
      const next = Math.max(4, Math.min(8, cur + delta));
      return {
        ...prev,
        skills: {
          ...prev.skills,
          [skillName]: {
            ...prev.skills[skillName],
            value: next,
          },
        },
      };
    });
  };

  // Specializations actions
  const handleRemoveSpec = (skillName: SkillName, specName: string) => {
    setCharacter((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillName]: {
          ...prev.skills[skillName],
          specializations: prev.skills[skillName].specializations.filter((s) => s !== specName),
        },
      },
    }));
  };

  const handleAddSpec = (skillName: SkillName, specToAdd: string) => {
    if (!specToAdd.trim()) return;
    setCharacter((prev) => {
      const current = prev.skills[skillName].specializations || [];
      if (current.includes(specToAdd.trim())) return prev;
      return {
        ...prev,
        skills: {
          ...prev.skills,
          [skillName]: {
            ...prev.skills[skillName],
            specializations: [...current, specToAdd.trim()],
          },
        },
      };
    });
    setNewSpecName('');
    setNewSpecSkill(null);
  };

  // Principle adjustments
  const handleSetPrincipleScore = (pName: PrincipleName, val: number) => {
    setCharacter((prev) => ({
      ...prev,
      principles: {
        ...prev.principles,
        [pName]: {
          ...prev.principles[pName],
          value: val,
        },
      },
    }));
  };

  const handleSetPrincipleMaxime = (pName: PrincipleName, text: string) => {
    setCharacter((prev) => ({
      ...prev,
      principles: {
        ...prev.principles,
        [pName]: {
          ...prev.principles[pName],
          maxime: text,
        },
      },
    }));
  };

  // Talent actions
  const handleAddTalent = (newTal: Talent) => {
    setCharacter((prev) => ({
      ...prev,
      talents: [...prev.talents, newTal],
    }));
  };

  const handleRemoveTalent = (talentId: string) => {
    setCharacter((prev) => ({
      ...prev,
      talents: prev.talents.filter((t) => t.id !== talentId),
    }));
  };

  // Asset actions
  const handleAddAsset = (newAst: Asset) => {
    setCharacter((prev) => ({
      ...prev,
      assets: [...prev.assets, newAst],
    }));
  };

  const handleRemoveAsset = (assetId: string) => {
    setCharacter((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => a.id !== assetId),
    }));
  };

  const handleAdjustAssetQuality = (assetId: string, delta: number) => {
    setCharacter((prev) => ({
      ...prev,
      assets: prev.assets.map((a) => {
        if (a.id === assetId) {
          return {
            ...a,
            quality: Math.max(0, Math.min(4, a.quality + delta)),
          };
        }
        return a;
      }),
    }));
  };

  // Vocation changer
  const handleChangeVocation = (newVoc: VocationType) => {
    const vocData = VOCATIONS_DATA[newVoc];
    let updatedTraits = character.traits.filter((t) => t.type !== 'faction');
    if (vocData.mandatoryTrait) {
      updatedTraits.push({
        id: `trait-vocation-${Date.now()}`,
        name: vocData.mandatoryTrait,
        type: 'faction',
        effectHint: `Accès aux doctrines et capacités exclusives de ${newVoc}`,
      });
    }

    setCharacter((prev) => ({
      ...prev,
      vocation: newVoc,
      traits: updatedTraits,
    }));
  };

  // Total skills score
  const totalSkillsScore = Object.values(character.skills).reduce((acc, s) => acc + s.value, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ================= EDIT MODE BANNER ================= */}
      {isEditMode && (
        <div className="bg-gradient-to-r from-[#2e1d0f] via-[#3d2714] to-[#24170b] border-2 border-[#d4a34b] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm text-[#fae5b5] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(212,163,75,0.2)] animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#c99738] text-black">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <strong className="font-cinzel text-sm text-[#fae5b5] uppercase tracking-wider block">
                Mode Modification Actif
              </strong>
              <p className="text-[11px] text-[#c9b79c]">
                Tous les champs, compétences, spécialisations, maximes, talents, atouts et textes de background sont éditables en direct.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditMode(false)}
            className="px-5 py-2 rounded-lg bg-[#c99738] hover:bg-[#d9a84a] text-black font-extrabold text-xs flex items-center space-x-1.5 shadow transition-all whitespace-nowrap"
          >
            <Check className="w-4 h-4" />
            <span>Valider & Quitter l’Édition</span>
          </button>
        </div>
      )}

      {/* ================= EN-TÊTE / IDENTITÉ DU PERSONNAGE ================= */}
      <div className={`relative rounded-xl border p-5 sm:p-7 shadow-2xl overflow-hidden transition-all ${
        isEditMode
          ? 'bg-[#1e1711] border-[#c99738] shadow-[0_0_15px_rgba(201,151,56,0.25)]'
          : 'bg-gradient-to-r from-[#1b1510] via-[#241a12] to-[#17130e] border-[#523d24]'
      }`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#d4a34b]/10 to-transparent pointer-events-none rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          
          {/* Identity Fields */}
          <div className="space-y-3 flex-1">
            {isEditMode ? (
              /* Editable Identity */
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-cinzel font-bold text-[#d4a34b] uppercase block">
                      Nom du personnage :
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={character.name}
                        onChange={(e) => setCharacter((prev) => ({ ...prev, name: e.target.value }))}
                        className="flex-1 bg-[#0f1015] border border-[#523d24] rounded-lg px-3 py-1.5 text-sm text-[#fae5b5] font-cinzel font-bold focus:border-[#d4a34b] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const gen = generateRandomName(character.gender === 'Homme' ? 'Homme' : 'Femme');
                          setCharacter((prev) => ({ ...prev, name: gen.name }));
                        }}
                        className="px-2.5 py-1 rounded bg-[#2a1c10] text-[#d4a34b] border border-[#523d24] hover:bg-[#3d2716] text-xs flex items-center space-x-1"
                        title="Générer un nom aléatoire de l'univers de Dune"
                      >
                        <Dices className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Aléatoire</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-cinzel font-bold text-[#d4a34b] uppercase block">
                      Genre :
                    </label>
                    <select
                      value={character.gender || 'Femme'}
                      onChange={(e) => setCharacter((prev) => ({ ...prev, gender: e.target.value }))}
                      className="w-full bg-[#0f1015] border border-[#523d24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5]"
                    >
                      <option value="Femme">Femme</option>
                      <option value="Homme">Homme</option>
                      <option value="Autre">Autre / Non-binaire</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-cinzel font-bold text-[#d4a34b] uppercase block">
                    Concept :
                  </label>
                  <input
                    type="text"
                    value={character.concept}
                    onChange={(e) => setCharacter((prev) => ({ ...prev, concept: e.target.value }))}
                    className="w-full bg-[#0f1015] border border-[#523d24] rounded-lg px-3 py-1.5 text-xs text-[#fae5b5] italic focus:border-[#d4a34b] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-[#a89885] block">Archétype :</label>
                    <select
                      value={character.archetype}
                      onChange={(e) => {
                        const newArch = e.target.value;
                        const updatedTraits = character.traits.map((t) => t.type === 'rôle' ? { ...t, name: newArch } : t);
                        setCharacter((prev) => ({ ...prev, archetype: newArch, traits: updatedTraits }));
                      }}
                      className="w-full bg-[#0f1015] border border-[#523d24] rounded px-2.5 py-1 text-xs text-[#fae5b5]"
                    >
                      {Object.keys(ARCHETYPES_DATA).map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-[#a89885] block">Vocation / Faction :</label>
                    <select
                      value={character.vocation}
                      onChange={(e) => handleChangeVocation(e.target.value as VocationType)}
                      className="w-full bg-[#0f1015] border border-[#523d24] rounded px-2.5 py-1 text-xs text-[#fae5b5]"
                    >
                      {Object.keys(VOCATIONS_DATA).map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono text-[#a89885] block">Maison :</label>
                      <button
                        type="button"
                        onClick={() => setIsHouseModalOpen(true)}
                        className="text-[10px] text-[#d4a34b] hover:underline flex items-center space-x-1"
                      >
                        <Sliders className="w-2.5 h-2.5" />
                        <span>Personnaliser</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={character.house.name}
                      onChange={(e) => setCharacter((prev) => ({
                        ...prev,
                        house: { ...prev.house, name: e.target.value }
                      }))}
                      className="w-full bg-[#0f1015] border border-[#523d24] rounded px-2.5 py-1 text-xs text-[#fae5b5]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold tracking-wider text-[#fae5b5]">
                    {character.name || 'Personnage sans nom'}
                  </h1>

                  <button
                    onClick={() => setIsEditMode(true)}
                    className="p-1.5 rounded-lg bg-[#291f14] hover:bg-[#3d2c1c] text-[#d4a34b] border border-[#5c4021] text-xs flex items-center space-x-1 shadow transition-all"
                    title="Modifier directement la fiche"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">Modifier</span>
                  </button>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c99738]/20 text-[#d4a34b] border border-[#c99738]/40">
                    {character.archetype}
                  </span>
                  {character.vocation !== 'Standard' && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8c4e1a]/30 text-[#e09145] border border-[#8c4e1a]/50">
                      {character.vocation}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-[#c9b79c] italic max-w-3xl">
                  « {character.concept || 'Aucun concept défini'} »
                </p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-[#a89885] pt-1">
                  <span className="flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#d4a34b]" />
                    <strong className="text-[#e6d8c3]">{character.house.name}</strong> ({character.house.type})
                  </span>
                  <span>•</span>
                  <span>Monde : <strong className="text-[#e6d8c3]">{character.backstory.originPlanet || character.house.homeworld}</strong></span>
                  <span>•</span>
                  <span>Couleurs : <strong className="text-[#e6d8c3]">{character.house.colors}</strong></span>

                  <button
                    onClick={() => setIsHouseModalOpen(true)}
                    className="px-2 py-0.5 rounded bg-[#291f14] hover:bg-[#3d2c1c] text-[#d4a34b] border border-[#5c4021] text-[11px] font-medium flex items-center space-x-1 transition-all shadow-sm"
                    title="Personnaliser ou changer de Maison noble"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Gérer la Maison</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats: Determination & Action buttons */}
          <div className="flex flex-wrap items-center gap-4 bg-[#120f0b]/80 p-3 rounded-lg border border-[#3d2e1b] shrink-0">
            {/* Determination */}
            <div className="text-center px-2">
              <div className="flex items-center justify-center space-x-1 text-[#d4a34b] mb-1">
                <Zap className="w-4 h-4 fill-[#d4a34b]" />
                <span className="text-xs font-cinzel font-bold tracking-wider uppercase">Détermination</span>
              </div>
              <div className="flex items-center space-x-1.5 justify-center">
                <button
                  onClick={() => setCharacter((prev) => ({ ...prev, determination: Math.max(0, prev.determination - 1) }))}
                  className="w-5 h-5 rounded bg-[#2a1f14] hover:bg-[#3d2b1b] text-xs font-bold text-[#c99738]"
                >
                  -
                </button>
                <div className="flex space-x-1 px-1">
                  {[1, 2, 3].map((pt) => (
                    <div
                      key={pt}
                      onClick={() => setCharacter((prev) => ({ ...prev, determination: pt }))}
                      className={`w-4 h-4 rounded-full cursor-pointer transition-all ${
                        pt <= character.determination
                          ? 'bg-[#d4a34b] shadow-[0_0_8px_rgba(212,163,75,0.7)]'
                          : 'bg-[#2b251d] border border-[#523d24]'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCharacter((prev) => ({ ...prev, determination: Math.min(3, prev.determination + 1) }))}
                  className="w-5 h-5 rounded bg-[#2a1f14] hover:bg-[#3d2b1b] text-xs font-bold text-[#c99738]"
                >
                  +
                </button>
              </div>
              <span className="text-[10px] text-[#8a7a67] mt-0.5 block">{character.determination} / 3 max</span>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2 border-l border-[#382b1c] pl-4">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-3 py-1.5 rounded font-bold text-xs flex items-center justify-center space-x-1.5 shadow transition-all ${
                  isEditMode
                    ? 'bg-[#c99738] text-black hover:bg-[#d9a84a]'
                    : 'bg-[#2b1f14] hover:bg-[#3d2b1a] text-[#fae5b5] border border-[#5a4224]'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>{isEditMode ? 'Terminer l’édition' : 'Mode Modification'}</span>
              </button>

              <button
                onClick={() => onOpenDiceTest()}
                className="px-3 py-1.5 rounded bg-[#c99738] hover:bg-[#d9a84a] text-[#120e09] font-bold text-xs flex items-center justify-center space-x-1 shadow transition-all"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Lancer un test</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ambition Banner */}
        <div className="mt-4 pt-3 border-t border-[#382b1c] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex-1 flex items-center space-x-2">
            <Award className="w-4 h-4 text-[#e09145] shrink-0" />
            <span className="font-semibold text-[#e09145] uppercase tracking-wider font-cinzel shrink-0">Ambition Suprême :</span>
            {isEditMode ? (
              <input
                type="text"
                value={character.ambition}
                onChange={(e) => setCharacter((prev) => ({ ...prev, ambition: e.target.value }))}
                placeholder="Ex: Protéger la dynastie et triompher lors du Kanly..."
                className="flex-1 bg-[#0f1015] border border-[#523d24] rounded px-3 py-1 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
              />
            ) : (
              <span className="text-[#f5ebd9] font-medium">{character.ambition || 'Définir une ambition'}</span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-[#8a7a67] shrink-0">
            <span>Progression :</span>
            {isEditMode ? (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCharacter((prev) => ({ ...prev, progressionPoints: Math.max(0, prev.progressionPoints - 1) }))}
                  className="w-5 h-5 rounded bg-[#241c14] text-[#fae5b5] font-bold"
                >
                  -
                </button>
                <span className="text-[#fae5b5] font-mono font-bold w-6 text-center">{character.progressionPoints}</span>
                <button
                  onClick={() => setCharacter((prev) => ({ ...prev, progressionPoints: prev.progressionPoints + 1 }))}
                  className="w-5 h-5 rounded bg-[#241c14] text-[#fae5b5] font-bold"
                >
                  +
                </button>
                <span>pts</span>
              </div>
            ) : (
              <strong className="text-[#fae5b5] font-mono">{character.progressionPoints} pts</strong>
            )}
          </div>
        </div>
      </div>

      {/* ================= GESTION DES TRAITS ================= */}
      <div className="bg-[#141419] rounded-xl border border-[#382e22] p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-[#d4a34b]" />
            <h2 className="font-cinzel text-base sm:text-lg font-bold tracking-wide text-[#fae5b5]">
              Gestion Automatique & Manuelle des Traits
            </h2>
            <button
              onClick={() => setShowTraitGuide(!showTraitGuide)}
              className="text-[#a89885] hover:text-[#d4a34b] text-xs flex items-center space-x-0.5 ml-2"
              title="Comment fonctionnent les traits dans Dune 2d20 ?"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="underline">Aide règles</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddTrait(!showAddTrait)}
              className="px-2.5 py-1 rounded bg-[#241d15] hover:bg-[#382b1c] text-[#d4a34b] border border-[#5c4323] text-xs flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau trait</span>
            </button>
          </div>
        </div>

        {/* Trait Guide */}
        {showTraitGuide && (
          <div className="bg-[#1b1712] border border-[#5c4323] rounded-lg p-3 text-xs text-[#c9b79c] space-y-2 animate-fadeIn">
            <p className="font-semibold text-[#d4a34b] flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#d4a34b]" />
              <span>Règle officielle des Traits (Chapitre 5, p. 143-144) :</span>
            </p>
            <p>
              Un trait est toujours vrai. S’il est pertinent, il peut <strong>rendre une action possible ou impossible</strong>, ou <strong>faciliter (Difficulté -1)</strong> ou <strong>compliquer (Difficulté +1)</strong> le test.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#3b2d1c]">
              <p>
                • <strong>Emprunt de Trait de Maison :</strong> En dépensant <strong>1 point d’Impulsion</strong>, vous pouvez emprunter le trait de votre Maison (ex: <em>{character.house.reputationTrait}</em>) pour en faire bénéficier votre personnage durant toute la scène !
              </p>
              <button
                type="button"
                onClick={handleToggleBorrowHouseTrait}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition-all shadow shrink-0 ${
                  isBorrowedHouseTraitActive
                    ? 'bg-[#8c4e1a] text-white border border-[#c99738]'
                    : 'bg-[#291f14] hover:bg-[#3d2c1c] text-[#d4a34b] border border-[#5c4021]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {isBorrowedHouseTraitActive
                    ? `✓ Emprunt Actif : "${character.house.reputationTrait}" (Désactiver)`
                    : `⚡ Emprunter "${character.house.reputationTrait}" (1 Impulsion)`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Form to add a trait */}
        {showAddTrait && (
          <form onSubmit={handleAddTrait} className="bg-[#1a182e] p-3 rounded-lg border border-[#4a3b2b] flex flex-wrap items-center gap-3 animate-fadeIn">
            <input
              type="text"
              placeholder="Nom du trait (ex: Ivre, Blessure, Ténébreux, Vindicatif...)"
              value={newTraitName}
              onChange={(e) => setNewTraitName(e.target.value)}
              className="flex-1 min-w-[200px] bg-[#0f1015] border border-[#4a3b2b] rounded px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
            />
            <select
              value={newTraitType}
              onChange={(e) => setNewTraitType(e.target.value as CharacterTrait['type'])}
              className="bg-[#0f1015] border border-[#4a3b2b] rounded px-2.5 py-1.5 text-xs text-[#fae5b5]"
            >
              <option value="situationnel">Situationnel / Temporaire</option>
              <option value="réputation">Réputation</option>
              <option value="rôle">Rôle</option>
              <option value="maison">Maison</option>
              <option value="faction">Faction</option>
            </select>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded bg-[#c99738] hover:bg-[#d9a84a] text-black font-semibold text-xs"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => setShowAddTrait(false)}
              className="px-2 py-1 text-xs text-gray-400 hover:text-white"
            >
              Annuler
            </button>
          </form>
        )}

        {/* Active traits badges */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          {character.traits.map((trait) => {
            const isHouse = trait.type === 'maison';
            const isFaction = trait.type === 'faction';
            const isRole = trait.type === 'rôle';
            const isRep = trait.type === 'réputation';

            let badgeStyle = 'bg-[#211a13] border-[#543f25] text-[#fae5b5]';
            if (isHouse) badgeStyle = 'bg-[#291b0f] border-[#8a4e1b] text-[#f29a4b]';
            if (isFaction) badgeStyle = 'bg-[#1b1c2b] border-[#444878] text-[#a5abf2]';
            if (isRole) badgeStyle = 'bg-[#1e2417] border-[#43592c] text-[#b6dba2]';
            if (isRep) badgeStyle = 'bg-[#2b2413] border-[#7d6325] text-[#fae5b5]';

            return (
              <div
                key={trait.id}
                onClick={() => setSelectedTraitInfo(trait)}
                className={`group px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-2 cursor-pointer hover:scale-105 transition-all shadow-sm ${badgeStyle}`}
              >
                <span className="uppercase text-[9px] tracking-wider opacity-70 font-mono">
                  [{trait.type}]
                </span>
                <span className="font-semibold">{trait.name}</span>
                
                {/* Delete button (always in edit mode, or on situational traits) */}
                {(isEditMode || trait.type === 'situationnel') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTrait(trait.id);
                    }}
                    className="opacity-70 hover:opacity-100 hover:text-red-400 ml-1 transition-opacity"
                    title="Supprimer ce trait"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Trait Detail */}
        {selectedTraitInfo && (
          <div className="bg-[#1b1921] border border-[#473b2d] rounded-lg p-3 text-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-[#fae5b5] flex items-center space-x-1.5">
                <span>Trait : {selectedTraitInfo.name}</span>
                <span className="text-[10px] text-[#a89885] font-mono">({selectedTraitInfo.type})</span>
              </span>
              <p className="text-[#a89885]">
                {selectedTraitInfo.effectHint || 'Ce trait peut rendre une action possible, réduire la difficulté (-1) ou la majorer (+1).'}
              </p>
            </div>
            <button
              onClick={() => setSelectedTraitInfo(null)}
              className="text-[#a89885] hover:text-white text-xs px-2 py-1"
            >
              Fermer
            </button>
          </div>
        )}
      </div>

      {/* ================= COMPÉTENCES & PRINCIPES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COMPÉTENCES */}
        <div className="bg-[#141419] rounded-xl border border-[#382e22] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#2b251d] pb-3">
            <div className="flex items-center space-x-2">
              <Sword className="w-5 h-5 text-[#d4a34b]" />
              <h2 className="font-cinzel text-lg font-bold tracking-wide text-[#fae5b5]">
                Compétences (4 à 8)
              </h2>
            </div>
            <span className={`text-xs font-mono font-bold ${totalSkillsScore === 28 ? 'text-[#a89885]' : 'text-amber-400'}`}>
              Total : {totalSkillsScore} / 28 pts {totalSkillsScore !== 28 && '(Ajusté)'}
            </span>
          </div>

          <div className="space-y-3.5">
            {(['Analyse', 'Combat', 'Discipline', 'Mobilité', 'Rhétorique'] as SkillName[]).map((sName) => {
              const skill = character.skills[sName];
              const info = SKILLS_INFO[sName];
              const officialCatalog = SPECIALIZATIONS_BY_SKILL[sName];

              return (
                <div
                  key={sName}
                  className="bg-[#18161d] rounded-lg border border-[#2b241b] p-3.5 space-y-2.5 hover:border-[#574125] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-cinzel font-bold text-sm text-[#fae5b5]">
                        {sName}
                      </span>
                      <span className="text-[10px] text-[#8a7a67] hidden sm:inline">
                        {info.description.slice(0, 40)}...
                      </span>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      {/* Score control */}
                      {isEditMode ? (
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustSkill(sName, -1)}
                            disabled={skill.value <= 4}
                            className="w-6 h-6 rounded bg-[#241c14] hover:bg-[#382b1c] disabled:opacity-30 text-xs font-bold text-[#d4a34b] border border-[#523d24]"
                          >
                            -
                          </button>
                          <div className="w-8 h-8 rounded bg-[#2e2316] border border-[#d4a34b] flex items-center justify-center font-mono font-bold text-sm text-[#fae5b5]">
                            {skill.value}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAdjustSkill(sName, 1)}
                            disabled={skill.value >= 8}
                            className="w-6 h-6 rounded bg-[#241c14] hover:bg-[#382b1c] disabled:opacity-30 text-xs font-bold text-[#d4a34b] border border-[#523d24]"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded bg-[#2e2316] border border-[#d4a34b]/60 flex items-center justify-center font-mono font-bold text-sm text-[#fae5b5]">
                          {skill.value}
                        </div>
                      )}

                      {/* Test 2d20 Button */}
                      <button
                        onClick={() => onOpenDiceTest(sName)}
                        title={`Lancer un test avec ${sName}`}
                        className="px-2.5 py-1 rounded bg-[#2b2116] hover:bg-[#d4a34b] hover:text-black text-[#d4a34b] border border-[#523d24] text-xs font-semibold flex items-center space-x-1 transition-all"
                      >
                        <Dices className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Tester</span>
                      </button>
                    </div>
                  </div>

                  {/* Specializations list with interactive add/remove */}
                  <div className="space-y-1.5 pt-1 border-t border-[#26211a]">
                    <div className="flex items-center justify-between text-[10px] text-[#a89885] font-mono">
                      <span>SPÉCIALISATIONS ({skill.specializations.length}) :</span>
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => setNewSpecSkill(newSpecSkill === sName ? null : sName)}
                          className="text-[#d4a34b] hover:underline flex items-center space-x-0.5"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Ajouter</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {skill.specializations && skill.specializations.length > 0 ? (
                        skill.specializations.map((spec, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded text-[11px] bg-[#291f14] text-[#d4a34b] border border-[#4d3820] font-medium flex items-center space-x-1"
                          >
                            <span>★ {spec}</span>
                            {isEditMode && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSpec(sName, spec)}
                                className="text-gray-400 hover:text-red-400 ml-1"
                                title="Supprimer la spécialisation"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-[#5e5345] italic">Aucune spécialisation</span>
                      )}
                    </div>

                    {/* Inline form to add specialization */}
                    {isEditMode && newSpecSkill === sName && (
                      <div className="bg-[#121115] p-2 rounded border border-[#473926] flex flex-wrap gap-2 items-center mt-2 animate-fadeIn">
                        <input
                          type="text"
                          placeholder="Nom (ex: Duel, Survie, Botanique...)"
                          value={newSpecName}
                          onChange={(e) => setNewSpecName(e.target.value)}
                          className="flex-1 bg-[#0b0c10] border border-[#4a3b2b] rounded px-2 py-1 text-xs text-[#fae5b5]"
                        />

                        {/* Quick select from official catalog */}
                        <select
                          onChange={(e) => {
                            if (e.target.value) handleAddSpec(sName, e.target.value);
                          }}
                          defaultValue=""
                          className="bg-[#0b0c10] border border-[#4a3b2b] rounded px-2 py-1 text-xs text-[#a89885]"
                        >
                          <option value="" disabled>Choisir dans le catalogue...</option>
                          {officialCatalog.map((catSpec) => (
                            <option key={catSpec} value={catSpec}>{catSpec}</option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleAddSpec(sName, newSpecName)}
                          className="px-2.5 py-1 rounded bg-[#c99738] text-black font-bold text-xs"
                        >
                          OK
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PRINCIPES & MAXIMES */}
        <div className="bg-[#141419] rounded-xl border border-[#382e22] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#2b251d] pb-3">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-[#d4a34b]" />
              <h2 className="font-cinzel text-lg font-bold tracking-wide text-[#fae5b5]">
                Principes & Maximes
              </h2>
            </div>
            <span className="text-xs text-[#8a7a67]">
              Distribution : 8, 7, 6, 5, 4
            </span>
          </div>

          <div className="space-y-3.5">
            {(['Devoir', 'Domination', 'Foi', 'Justice', 'Vérité'] as PrincipleName[]).map((pName) => {
              const p = character.principles[pName];
              const isMajor = p.value >= 6;
              const isBroken = p.isBroken;
              const suggestions = SUGGESTED_MAXIMES[pName];

              return (
                <div
                  key={pName}
                  className={`rounded-lg border p-3.5 space-y-2 transition-all ${
                    isBroken
                      ? 'bg-[#1f1515] border-red-900/60'
                      : isMajor
                      ? 'bg-[#18161d] border-[#3d2e1b] hover:border-[#694c26]'
                      : 'bg-[#131217] border-[#221f29]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-cinzel font-bold text-sm text-[#fae5b5]">
                        {pName}
                      </span>
                      {isBroken && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-semibold flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          <span>BAFOUÉ</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Score Selector in Edit Mode */}
                      {isEditMode ? (
                        <div className="flex items-center space-x-1">
                          {[8, 7, 6, 5, 4].map((sc) => (
                            <button
                              key={sc}
                              type="button"
                              onClick={() => handleSetPrincipleScore(pName, sc)}
                              className={`w-6 h-6 rounded font-mono font-bold text-xs border ${
                                p.value === sc
                                  ? 'bg-[#d4a34b] text-black border-[#d4a34b]'
                                  : 'bg-[#241c14] text-[#a89885] border-[#473926]'
                              }`}
                            >
                              {sc}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded border flex items-center justify-center font-mono font-bold text-sm ${
                          isBroken
                            ? 'bg-red-950 border-red-800 text-red-300'
                            : isMajor
                            ? 'bg-[#332517] border-[#d4a34b] text-[#fae5b5]'
                            : 'bg-[#1e1c24] border-gray-700 text-[#a89885]'
                        }`}>
                          {p.value}
                        </div>
                      )}

                      {/* Roll Test */}
                      <button
                        onClick={() => onOpenDiceTest(undefined, pName)}
                        title={`Lancer un test avec ${pName}`}
                        className="px-2.5 py-1 rounded bg-[#2b2116] hover:bg-[#d4a34b] hover:text-black text-[#d4a34b] border border-[#523d24] text-xs font-semibold flex items-center space-x-1 transition-all"
                      >
                        <Dices className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Tester</span>
                      </button>

                      {/* Bafouer toggle */}
                      {isMajor && (
                        <button
                          onClick={() => handleTogglePrincipleBafoue(pName)}
                          title={isBroken ? "Restaurer ce principe" : "Bafouer (Gagne 1 Détermination, biffe la maxime)"}
                          className={`px-2 py-1 rounded text-[10px] border font-semibold ${
                            isBroken
                              ? 'bg-green-950/60 border-green-800 text-green-300'
                              : 'bg-red-950/40 border-red-900/60 text-red-400'
                          }`}
                        >
                          {isBroken ? 'Restaurer' : 'Bafouer'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Maxime edit / display */}
                  <div className="pt-1">
                    {isEditMode ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={p.maxime || ''}
                          onChange={(e) => handleSetPrincipleMaxime(pName, e.target.value)}
                          placeholder={`Maxime pour ${pName}...`}
                          className="w-full bg-[#0b0c10] border border-[#4a3b2b] rounded px-3 py-1 text-xs text-[#fae5b5] italic focus:outline-none focus:border-[#d4a34b]"
                        />

                        {/* Quick suggestions pills */}
                        <div className="flex flex-wrap gap-1">
                          {suggestions.slice(0, 2).map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleSetPrincipleMaxime(pName, sug)}
                              className="text-[10px] px-2 py-0.5 rounded bg-[#100f13] hover:bg-[#2e2316] text-[#c9b79c] border border-[#2b241c] truncate max-w-xs"
                            >
                              « {sug} »
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {p.maxime ? (
                          <p className={`text-xs italic ${isBroken ? 'line-through text-red-400/80' : 'text-[#d6c8b2]'}`}>
                            « {p.maxime} »
                          </p>
                        ) : (
                          <span className="text-[11px] text-[#6b6052] italic">
                            Principe mineur (aucune maxime requise)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= TALENTS & ATOUTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TALENTS */}
        <div className="bg-[#141419] rounded-xl border border-[#382e22] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#2b251d] pb-3">
            <div className="flex items-center space-x-2">
              <Bookmark className="w-5 h-5 text-[#d4a34b]" />
              <h2 className="font-cinzel text-lg font-bold tracking-wide text-[#fae5b5]">
                Talents & Capacités Spéciales ({character.talents.length})
              </h2>
            </div>

            {isEditMode && (
              <button
                type="button"
                onClick={() => setIsAddTalentOpen(true)}
                className="px-2.5 py-1 rounded bg-[#2b2014] hover:bg-[#3d2b1b] text-[#d4a34b] border border-[#523d24] text-xs font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un talent</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {character.talents.map((tal, idx) => (
              <div
                key={tal.id || idx}
                className="bg-[#18161d] rounded-lg border border-[#2b241b] p-3.5 space-y-1.5 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-cinzel font-bold text-sm text-[#fae5b5]">
                    {tal.name}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    {tal.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#291e13] text-[#d4a34b] border border-[#523d24] font-mono">
                        {tal.category}
                      </span>
                    )}

                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTalent(tal.id)}
                        className="text-gray-400 hover:text-red-400 p-0.5"
                        title="Supprimer ce talent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#a89885] leading-relaxed">
                  {tal.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ATOUTS (ASSETS) */}
        <div className="bg-[#141419] rounded-xl border border-[#382e22] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#2b251d] pb-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[#d4a34b]" />
              <h2 className="font-cinzel text-lg font-bold tracking-wide text-[#fae5b5]">
                Atouts & Équipements ({character.assets.length})
              </h2>
            </div>

            {isEditMode && (
              <button
                type="button"
                onClick={() => setIsAddAssetOpen(true)}
                className="px-2.5 py-1 rounded bg-[#2b2014] hover:bg-[#3d2b1b] text-[#d4a34b] border border-[#523d24] text-xs font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un atout</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {character.assets.map((asset, idx) => (
              <div
                key={asset.id || idx}
                className="bg-[#18161d] rounded-lg border border-[#2b241b] p-3.5 space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-cinzel font-bold text-sm text-[#fae5b5]">
                      {asset.name}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-mono ${
                      asset.type === 'tangible' ? 'bg-[#291f14] text-[#d4a34b]' : 'bg-[#1a212b] text-[#9bb3d6]'
                    }`}>
                      {asset.type}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-[#a89885]">Qualité :</span>
                    
                    {isEditMode ? (
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleAdjustAssetQuality(asset.id, -1)}
                          disabled={asset.quality <= 0}
                          className="w-5 h-5 rounded bg-[#241c14] text-xs font-bold text-[#d4a34b]"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-xs text-[#fae5b5]">{asset.quality}</span>
                        <button
                          type="button"
                          onClick={() => handleAdjustAssetQuality(asset.id, 1)}
                          disabled={asset.quality >= 4}
                          className="w-5 h-5 rounded bg-[#241c14] text-xs font-bold text-[#d4a34b]"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="w-6 h-6 rounded bg-[#2e2316] border border-[#d4a34b] flex items-center justify-center font-mono font-bold text-xs text-[#fae5b5]">
                        {asset.quality}
                      </span>
                    )}

                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(asset.id)}
                        className="text-gray-400 hover:text-red-400 p-0.5 ml-1"
                        title="Supprimer cet atout"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {asset.keywords.map((kw, kwIdx) => (
                    <span key={kwIdx} className="text-[10px] px-2 py-0.5 rounded bg-[#100f13] text-[#8a7a67] border border-[#26222b]">
                      #{kw}
                    </span>
                  ))}
                </div>

                {asset.description && (
                  <p className="text-xs text-[#8a7a67] italic pt-1 border-t border-[#26222b]">
                    {asset.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= HISTORIQUE & BACKGROUND ENRICHI ================= */}
      <div className="bg-[#141419] rounded-xl border border-[#382e22] p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2b251d] pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#d4a34b]" />
            <h2 className="font-cinzel text-lg font-bold tracking-wide text-[#fae5b5]">
              Historique & Chroniques de l'Imperium
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenBackstoryGen}
              className="px-3 py-1.5 rounded-lg bg-[#2b2014] hover:bg-[#3d2b1b] text-[#fae5b5] border border-[#634524] text-xs font-semibold flex items-center space-x-1.5 transition-all shadow"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d4a34b]" />
              <span>Générateur Aléatoire</span>
            </button>
          </div>
        </div>

        {/* Background fields (editable or view) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#18161d] p-3.5 rounded-lg border border-[#2b241b] space-y-1.5">
            <span className="text-[11px] font-cinzel font-bold text-[#d4a34b] uppercase tracking-wider block">
              Origine & Statut de Naissance
            </span>
            {isEditMode ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={character.backstory.originPlanet}
                  onChange={(e) => setCharacter((prev) => ({
                    ...prev,
                    backstory: { ...prev.backstory, originPlanet: e.target.value }
                  }))}
                  placeholder="Monde d'origine..."
                  className="w-full bg-[#0b0c10] border border-[#3d2f1f] rounded px-2.5 py-1 text-xs text-[#fae5b5]"
                />
                <input
                  type="text"
                  value={character.backstory.birthStatus}
                  onChange={(e) => setCharacter((prev) => ({
                    ...prev,
                    backstory: { ...prev.backstory, birthStatus: e.target.value }
                  }))}
                  placeholder="Statut féodal..."
                  className="w-full bg-[#0b0c10] border border-[#3d2f1f] rounded px-2.5 py-1 text-xs text-[#a89885]"
                />
              </div>
            ) : (
              <>
                <p className="text-xs text-[#fae5b5] font-medium">
                  {character.backstory.originPlanet}
                </p>
                <p className="text-xs text-[#a89885]">
                  {character.backstory.birthStatus}
                </p>
              </>
            )}
          </div>

          <div className="bg-[#18161d] p-3.5 rounded-lg border border-[#2b241b] space-y-1.5">
            <span className="text-[11px] font-cinzel font-bold text-[#d4a34b] uppercase tracking-wider block">
              Événement Formateur
            </span>
            {isEditMode ? (
              <textarea
                rows={2}
                value={character.backstory.formativeEvent}
                onChange={(e) => setCharacter((prev) => ({
                  ...prev,
                  backstory: { ...prev.backstory, formativeEvent: e.target.value }
                }))}
                className="w-full bg-[#0b0c10] border border-[#3d2f1f] rounded px-2.5 py-1 text-xs text-[#c9b79c]"
              />
            ) : (
              <p className="text-xs text-[#c9b79c]">
                {character.backstory.formativeEvent}
              </p>
            )}
          </div>

          <div className="bg-[#18161d] p-3.5 rounded-lg border border-[#2b241b] space-y-1.5">
            <span className="text-[11px] font-cinzel font-bold text-[#e09145] uppercase tracking-wider block">
              Secret Inavouable / Dette
            </span>
            {isEditMode ? (
              <textarea
                rows={2}
                value={character.backstory.darkSecretOrDebt}
                onChange={(e) => setCharacter((prev) => ({
                  ...prev,
                  backstory: { ...prev.backstory, darkSecretOrDebt: e.target.value }
                }))}
                className="w-full bg-[#0b0c10] border border-[#3d2f1f] rounded px-2.5 py-1 text-xs text-[#c9b79c]"
              />
            ) : (
              <p className="text-xs text-[#c9b79c]">
                {character.backstory.darkSecretOrDebt}
              </p>
            )}
          </div>

          <div className="bg-[#18161d] p-3.5 rounded-lg border border-[#2b241b] space-y-1.5">
            <span className="text-[11px] font-cinzel font-bold text-[#d4a34b] uppercase tracking-wider block">
              Signe Distinctif
            </span>
            {isEditMode ? (
              <input
                type="text"
                value={character.backstory.distinctiveFeature}
                onChange={(e) => setCharacter((prev) => ({
                  ...prev,
                  backstory: { ...prev.backstory, distinctiveFeature: e.target.value }
                }))}
                className="w-full bg-[#0b0c10] border border-[#3d2f1f] rounded px-2.5 py-1 text-xs text-[#c9b79c]"
              />
            ) : (
              <p className="text-xs text-[#c9b79c]">
                {character.backstory.distinctiveFeature}
              </p>
            )}
          </div>

          <div className="bg-[#18161d] p-3.5 rounded-lg border border-[#2b241b] space-y-1.5">
            <span className="text-[11px] font-cinzel font-bold text-[#d4a34b] uppercase tracking-wider block">
              Objet Fétiche / Souvenir
            </span>
            {isEditMode ? (
              <input
                type="text"
                value={character.backstory.trinket}
                onChange={(e) => setCharacter((prev) => ({
                  ...prev,
                  backstory: { ...prev.backstory, trinket: e.target.value }
                }))}
                className="w-full bg-[#0b0c10] border border-[#3d2f1f] rounded px-2.5 py-1 text-xs text-[#c9b79c]"
              />
            ) : (
              <p className="text-xs text-[#c9b79c]">
                {character.backstory.trinket}
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-[#1c1724] via-[#16131c] to-[#110f14] p-4 rounded-xl border border-[#4d3a24] shadow-md space-y-3 col-span-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#36271a] pb-2.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#2e2013] border border-[#d4a34b]/40 flex items-center justify-center shrink-0 shadow-sm">
                  <Shield className="w-5 h-5 text-[#d4a34b]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-cinzel text-sm sm:text-base font-bold text-[#fae5b5]">
                      {character.house.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3b2713] text-[#d4a34b] border border-[#5c4021]">
                      {character.house.type}
                    </span>
                  </div>
                  {character.house.motto && (
                    <p className="text-[11px] text-[#d4a34b] italic font-serif">
                      « {character.house.motto} »
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleToggleBorrowHouseTrait}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
                    isBorrowedHouseTraitActive
                      ? 'bg-[#8c4e1a] text-white border border-[#c99738]'
                      : 'bg-[#291f14] hover:bg-[#3d2c1c] text-[#d4a34b] border border-[#5c4021]'
                  }`}
                  title="Emprunter le trait de maison pour 1 Impulsion durant la scène"
                >
                  <Zap className="w-3 h-3" />
                  <span>{isBorrowedHouseTraitActive ? 'Trait Actif' : 'Emprunter Trait (1 Impulsion)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsHouseModalOpen(true)}
                  className="px-3 py-1 rounded bg-[#c99738] hover:bg-[#d9a84a] text-black text-xs font-bold flex items-center space-x-1 transition-all shadow"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Personnaliser la Maison</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#121017] p-2.5 rounded-lg border border-[#261f18] space-y-0.5">
                <span className="text-[10px] font-mono text-[#a89885] block uppercase">Monde d’Origine :</span>
                <span className="text-[#fae5b5] font-medium">{character.house.homeworld}</span>
              </div>
              <div className="bg-[#121017] p-2.5 rounded-lg border border-[#261f18] space-y-0.5">
                <span className="text-[10px] font-mono text-[#a89885] block uppercase">Trait Empruntable :</span>
                <span className="text-[#e09145] font-bold">{character.house.reputationTrait}</span>
              </div>
              <div className="bg-[#121017] p-2.5 rounded-lg border border-[#261f18] space-y-0.5">
                <span className="text-[10px] font-mono text-[#a89885] block uppercase">Sceau & Couleurs :</span>
                <span className="text-[#c9b79c] truncate block">{character.house.sigil} • {character.house.colors}</span>
              </div>
              <div className="bg-[#121017] p-2.5 rounded-lg border border-[#261f18] space-y-0.5">
                <span className="text-[10px] font-mono text-[#a89885] block uppercase">Domaine Primaire :</span>
                <span className="text-[#fae5b5] truncate block">{character.house.primaryDomain}</span>
              </div>
            </div>

            {(character.house.bannerDescription || character.house.secondaryDomain || character.house.rulerName) && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#261f18] text-[11px] text-[#a89885]">
                <div className="flex flex-wrap items-center gap-3">
                  {character.house.secondaryDomain && (
                    <span>Domaine Secondaire : <strong className="text-[#c9b79c]">{character.house.secondaryDomain}</strong></span>
                  )}
                  {character.house.rulerName && (
                    <span>Souverain : <strong className="text-[#d4a34b]">{character.house.rulerName}</strong></span>
                  )}
                </div>
                {character.house.bannerDescription && (
                  <span className="italic truncate max-w-md">Bannière : {character.house.bannerDescription}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Narrative text */}
        <div className="bg-[#18161d] p-4 rounded-lg border border-[#2b241b] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider block">
              Récit Biographie Complet :
            </span>
            {isEditMode && (
              <span className="text-[10px] text-[#a89885]">
                Zone de texte éditable librement
              </span>
            )}
          </div>

          {isEditMode ? (
            <textarea
              rows={6}
              value={character.backstory.fullNarrative}
              onChange={(e) => setCharacter((prev) => ({
                ...prev,
                backstory: { ...prev.backstory, fullNarrative: e.target.value }
              }))}
              className="w-full bg-[#0b0c10] border border-[#4a3b2b] rounded-lg p-3 text-xs text-[#e6d8c3] focus:outline-none focus:border-[#d4a34b] leading-relaxed"
            />
          ) : (
            <p className="text-xs text-[#c9b79c] leading-relaxed whitespace-pre-line font-sans">
              {character.backstory.fullNarrative || 'Aucun récit biographique renseigné. Cliquez sur "Mode Modification" pour le rédiger ou sur "Générateur Aléatoire".'}
            </p>
          )}
        </div>
      </div>

      {/* Add Talent & Asset Modals */}
      <AddTalentModal
        isOpen={isAddTalentOpen}
        onClose={() => setIsAddTalentOpen(false)}
        onAddTalent={handleAddTalent}
        existingTalents={character.talents}
        currentVocation={character.vocation}
      />

      <AddAssetModal
        isOpen={isAddAssetOpen}
        onClose={() => setIsAddAssetOpen(false)}
        onAddAsset={handleAddAsset}
        existingAssets={character.assets}
      />

      {/* House Customizer Modal */}
      <HouseCustomizerModal
        isOpen={isHouseModalOpen}
        onClose={() => setIsHouseModalOpen(false)}
        currentHouse={character.house}
        onApplyHouse={handleApplyHouse}
      />
    </div>
  );
};
