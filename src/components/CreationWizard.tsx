import React, { useState } from 'react';
import { 
  DuneCharacter, 
  SkillName, 
  PrincipleName, 
  VocationType, 
  Asset, 
  Talent 
} from '../types/dune';
import { 
  ARCHETYPES_DATA, 
  VOCATIONS_DATA, 
  TALENTS_LIST, 
  SPECIALIZATIONS_BY_SKILL, 
  COMMON_ASSETS, 
  PRESET_HOUSES, 
  SUGGESTED_MAXIMES,
  SKILLS_INFO,
  PRINCIPLES_INFO
} from '../data/duneData';
import { 
  generateBackstory, 
  generateRandomName 
} from '../utils/backgroundGenerator';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  AlertCircle, 
  Shield, 
  Sword, 
  Compass, 
  Bookmark, 
  Briefcase, 
  UserCheck, 
  HelpCircle,
  Plus,
  Trash2,
  Dice5,
  Bot
} from 'lucide-react';

interface CreationWizardProps {
  character: DuneCharacter;
  setCharacter: React.Dispatch<React.SetStateAction<DuneCharacter>>;
  onFinishWizard: () => void;
  onOpenBackstoryGen: () => void;
  onOpenChatbot?: (prompt?: string) => void;
}

export const CreationWizard: React.FC<CreationWizardProps> = ({
  character,
  setCharacter,
  onFinishWizard,
  onOpenBackstoryGen,
  onOpenChatbot,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Steps definition
  const steps = [
    { num: 1, title: 'Concept & Faction', icon: Compass },
    { num: 2, title: 'Archétype', icon: UserCheck },
    { num: 3, title: 'Compétences', icon: Sword },
    { num: 4, title: 'Spécialisations', icon: Bookmark },
    { num: 5, title: 'Talents', icon: Sparkles },
    { num: 6, title: 'Principes & Maximes', icon: Shield },
    { num: 7, title: 'Atouts', icon: Briefcase },
    { num: 8, title: 'Finitions & Traits', icon: Check },
  ];

  // ================= Step 1: Vocation & Concept =================
  const handleSelectVocation = (voc: VocationType) => {
    const vocData = VOCATIONS_DATA[voc];
    
    // Auto-update traits: update or add faction trait
    let updatedTraits = character.traits.filter((t) => t.type !== 'faction');
    if (vocData.mandatoryTrait) {
      updatedTraits.push({
        id: `trait-vocation-${Date.now()}`,
        name: vocData.mandatoryTrait,
        type: 'faction',
        effectHint: `Accès aux doctrines et capacités exclusives de ${voc}`,
      });
    }

    // Auto-update talents if mandatory
    let updatedTalents = [...character.talents];
    if (vocData.mandatoryTalentIds.length > 0) {
      const mandatoryTalent = TALENTS_LIST.find((t) => t.id === vocData.mandatoryTalentIds[0]);
      if (mandatoryTalent && !updatedTalents.some((t) => t.id === mandatoryTalent.id)) {
        if (updatedTalents.length >= 3) {
          updatedTalents[0] = mandatoryTalent;
        } else {
          updatedTalents.push(mandatoryTalent);
        }
      }
    }

    setCharacter((prev) => ({
      ...prev,
      vocation: voc,
      traits: updatedTraits,
      talents: updatedTalents,
    }));
  };

  // ================= Step 2: Archetype =================
  const handleSelectArchetype = (archKey: string) => {
    const archData = ARCHETYPES_DATA[archKey];
    if (!archData) return;

    // Reset base skill points: Primary = 6, Secondary = 5, Others = 4
    // Plus 5 free points (default: keep existing allocated delta or reset)
    const newSkills: Record<SkillName, { name: SkillName; value: number; specializations: string[] }> = {
      Analyse: { name: 'Analyse', value: 4, specializations: [] },
      Combat: { name: 'Combat', value: 4, specializations: [] },
      Discipline: { name: 'Discipline', value: 4, specializations: [] },
      Mobilité: { name: 'Mobilité', value: 4, specializations: [] },
      Rhétorique: { name: 'Rhétorique', value: 4, specializations: [] },
    };

    newSkills[archData.primarySkill].value = 6;
    newSkills[archData.secondarySkill].value = 5;

    // Pre-fill suggested specs
    archData.suggestedSpecs.forEach((spec) => {
      newSkills[spec.skill].specializations.push(spec.name);
    });

    // Update role trait
    const updatedTraits = character.traits.filter((t) => t.type !== 'rôle');
    updatedTraits.push({
      id: `trait-role-${Date.now()}`,
      name: archData.name,
      type: 'rôle',
      effectHint: `Définit les domaines d’expertise de base et le statut en société`,
    });

    // Auto-add archetype talent if room
    const archTalent = TALENTS_LIST.find((t) => t.id === archData.archetypeTalentId);
    let updatedTalents = [...character.talents];
    if (archTalent && !updatedTalents.some((t) => t.id === archTalent.id)) {
      if (updatedTalents.length < 3) {
        updatedTalents.push(archTalent);
      } else if (character.vocation === 'Standard') {
        updatedTalents[1] = archTalent;
      }
    }

    setCharacter((prev) => ({
      ...prev,
      archetype: archData.name,
      skills: newSkills,
      traits: updatedTraits,
      talents: updatedTalents,
    }));
  };

  // ================= Step 3: Skill Allocation =================
  // Total skill budget: 6 + 5 + 4 + 4 + 4 = 23 base + 5 free = 28 total points
  const totalSkillPoints = Object.values(character.skills).reduce((acc, s) => acc + s.value, 0);
  const remainingSkillPoints = 28 - totalSkillPoints;

  const handleAdjustSkill = (skillName: SkillName, delta: number) => {
    const current = character.skills[skillName].value;
    const next = current + delta;
    if (next < 4 || next > 8) return;
    if (delta > 0 && remainingSkillPoints <= 0) return;

    setCharacter((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillName]: {
          ...prev.skills[skillName],
          value: next,
        },
      },
    }));
  };

  // ================= Step 4: Specializations (Total 4) =================
  const allChosenSpecs = Object.values(character.skills).flatMap((s) => s.specializations);
  const totalSpecsChosen = allChosenSpecs.length;

  const handleToggleSpec = (skillName: SkillName, specName: string) => {
    const currentSpecs = character.skills[skillName].specializations || [];
    const isAlreadyChosen = currentSpecs.includes(specName);

    if (isAlreadyChosen) {
      setCharacter((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          [skillName]: {
            ...prev.skills[skillName],
            specializations: currentSpecs.filter((s) => s !== specName),
          },
        },
      }));
    } else {
      if (totalSpecsChosen >= 4) return;
      setCharacter((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          [skillName]: {
            ...prev.skills[skillName],
            specializations: [...currentSpecs, specName],
          },
        },
      }));
    }
  };

  // ================= Step 5: Talents (Total 3) =================
  const handleToggleTalent = (talent: Talent) => {
    const isChosen = character.talents.some((t) => t.id === talent.id);
    const vocData = VOCATIONS_DATA[character.vocation];

    if (isChosen) {
      // Cannot remove mandatory vocation talent
      if (vocData.mandatoryTalentIds.includes(talent.id)) return;
      setCharacter((prev) => ({
        ...prev,
        talents: prev.talents.filter((t) => t.id !== talent.id),
      }));
    } else {
      if (character.talents.length >= 3) return;
      setCharacter((prev) => ({
        ...prev,
        talents: [...prev.talents, talent],
      }));
    }
  };

  // ================= Step 6: Principles & Maximes =================
  const principleValues = [8, 7, 6, 5, 4];
  const assignedValues = Object.values(character.principles).map((p) => p.value);
  const isValidPrincipleDistribution = 
    [8, 7, 6, 5, 4].every((val) => assignedValues.filter((v) => v === val).length === 1);

  const handleSetPrincipleScore = (pName: PrincipleName, val: number) => {
    setCharacter((prev) => {
      // If another principle already had this score, swap them
      const otherPrinciple = Object.entries(prev.principles).find(([k, v]) => k !== pName && v.value === val);
      const currentVal = prev.principles[pName].value;

      const newPrinciples = { ...prev.principles };
      newPrinciples[pName] = { ...newPrinciples[pName], value: val };

      if (otherPrinciple) {
        const otherKey = otherPrinciple[0] as PrincipleName;
        newPrinciples[otherKey] = { ...newPrinciples[otherKey], value: currentVal };
      }

      return {
        ...prev,
        principles: newPrinciples,
      };
    });
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

  // ================= Step 7: Assets / Atouts =================
  const [customAssetName, setCustomAssetName] = useState('');
  const [customAssetType, setCustomAssetType] = useState<'tangible' | 'intangible'>('tangible');
  const [customAssetKeywords, setCustomAssetKeywords] = useState('');

  const handleAddPredefinedAsset = (asset: Asset) => {
    if (character.assets.some((a) => a.id === asset.id)) return;
    if (character.assets.length >= 5) return;
    setCharacter((prev) => ({
      ...prev,
      assets: [...prev.assets, asset],
    }));
  };

  const handleRemoveAsset = (id: string) => {
    setCharacter((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => a.id !== id),
    }));
  };

  const handleAddCustomAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAssetName.trim()) return;

    const newAst: Asset = {
      id: `custom-asset-${Date.now()}`,
      name: customAssetName.trim(),
      type: customAssetType,
      category: customAssetType === 'tangible' ? 'Équipement' : 'Information',
      quality: 0,
      keywords: customAssetKeywords ? customAssetKeywords.split(',').map((k) => k.trim()) : ['Personnel'],
      description: 'Atout personnalisé de création',
    };

    setCharacter((prev) => ({
      ...prev,
      assets: [...prev.assets, newAst],
    }));

    setCustomAssetName('');
    setCustomAssetKeywords('');
  };

  const hasTangibleAsset = character.assets.some((a) => a.type === 'tangible');

  // Quick random generator hook for the final step
  const handleRandomizeIdentity = () => {
    const gen = generateRandomName(character.gender === 'Homme' ? 'Homme' : 'Femme');
    const bg = generateBackstory(character.vocation, character.archetype, character.house.name);
    
    // Top principle gives ambition flavor
    const topPrinciple = Object.entries(character.principles).find(([_, p]) => p.value === 8)?.[0] || 'Devoir';
    const ambitionsMap: Record<string, string> = {
      Devoir: 'Protéger l’honneur et la lignée de ma Maison à travers tout l’Imperium.',
      Domination: 'Accroître l’ascendant de ma dynastie au sein du Directoire du CHOM.',
      Foi: 'Accomplir les desseins prophétiques et guider mon peuple vers la terre promise.',
      Justice: 'Rendre justice par la vendetta de Kanly contre la Maison ennemie.',
      Vérité: 'Percer les secrets les mieux dissimulés de l’Imperium et déjouer les trahisons.',
    };

    setCharacter((prev) => ({
      ...prev,
      name: gen.name,
      ambition: ambitionsMap[topPrinciple] || 'Triompher dans les intrigues d’Arrakis',
      backstory: bg,
    }));
  };

  // Validation Checks
  const stepValidations = [
    { valid: !!character.concept && !!character.vocation, msg: 'Concept & Vocation' },
    { valid: !!character.archetype, msg: 'Archétype sélectionné' },
    { valid: remainingSkillPoints === 0, msg: `Compétences (5/5 alloués, reste ${remainingSkillPoints})` },
    { valid: totalSpecsChosen === 4, msg: `4 Spécialisations (${totalSpecsChosen}/4)` },
    { valid: character.talents.length === 3, msg: `3 Talents (${character.talents.length}/3)` },
    { valid: isValidPrincipleDistribution && ([8, 7, 6] as const).every((score) => {
      const p = Object.values(character.principles).find((item) => item.value === score);
      return p && p.maxime && p.maxime.trim().length > 0;
    }), msg: 'Principes (8, 7, 6, 5, 4) & 3 Maximes' },
    { valid: character.assets.length >= 3 && hasTangibleAsset, msg: '3 Atouts (dont >= 1 tangible)' },
    { valid: !!character.name && !!character.ambition, msg: 'Nom & Ambition' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Wizard Header & Stepper */}
      <div className="bg-[#141419] rounded-xl border border-[#3d3120] p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292218] pb-4">
          <div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#fae5b5]">
              Assistant de Création Organisée
            </h1>
            <p className="text-xs text-[#a89885] mt-0.5">
              Conforme à 100% aux règles du livre de base (Chapitre 4 : Créer son personnage)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRandomizeIdentity}
              className="px-3 py-1.5 rounded-lg bg-[#241c14] hover:bg-[#382b1c] text-[#d4a34b] border border-[#523d24] text-xs font-semibold flex items-center space-x-1.5 transition-all shadow"
            >
              <Dice5 className="w-3.5 h-3.5" />
              <span>Générer Identité Aléatoire</span>
            </button>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-4">
          {steps.map((st) => {
            const Icon = st.icon;
            const isActive = currentStep === st.num;
            const isCompleted = stepValidations[st.num - 1].valid;

            return (
              <button
                key={st.num}
                onClick={() => setCurrentStep(st.num)}
                className={`p-2 rounded-lg text-center flex flex-col items-center justify-center space-y-1 transition-all border ${
                  isActive
                    ? 'bg-[#c99738]/20 border-[#c99738] text-[#fae5b5] shadow'
                    : isCompleted
                    ? 'bg-[#181a17] border-[#384a29] text-[#9fc48d]'
                    : 'bg-[#121115] border-[#292631] text-[#71695f] hover:text-[#a89885]'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono font-bold">É{st.num}</span>
                </div>
                <span className="text-[10px] leading-tight font-medium hidden sm:block truncate w-full">
                  {st.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= STEP CONTENT ================= */}
      <div className="bg-[#141419] rounded-xl border border-[#3d3120] p-5 sm:p-7 shadow-xl space-y-6">
        
        {/* STEP 1: CONCEPT & FACTION */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                Étape 1 : Le Concept de Personnage & Vocation de Faction
              </h2>
              <p className="text-xs text-[#a89885] mt-1">
                Définissez l’idée directrice de votre personnage et déterminez s’il appartient à une Grande École ou à une faction indépendante.
              </p>
            </div>

            {/* Concept text field */}
            <div className="space-y-2">
              <label className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider block">
                Concept du personnage :
              </label>
              <input
                type="text"
                placeholder="Ex: Héritière de la Maison formée par le Bene Gesserit, fine bretteuse et politicienne masquée"
                value={character.concept}
                onChange={(e) => setCharacter((prev) => ({ ...prev, concept: e.target.value }))}
                className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded-lg px-4 py-2 text-sm text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
              />
            </div>

            {/* House selection */}
            <div className="space-y-2">
              <label className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider block">
                Maison Noble d'allégeance :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PRESET_HOUSES.map((h) => (
                  <div
                    key={h.name}
                    onClick={() => {
                      const updatedTraits = character.traits.filter((t) => t.type !== 'maison');
                      updatedTraits.push({
                        id: `trait-house-${Date.now()}`,
                        name: `${h.name} (${h.reputationTrait})`,
                        type: 'maison',
                        effectHint: `Permet d’emprunter le trait "${h.reputationTrait}" pour 1 Impulsion durant une scène`,
                      });
                      setCharacter((prev) => ({ ...prev, house: h, traits: updatedTraits }));
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      character.house.name === h.name
                        ? 'bg-[#291e13] border-[#d4a34b] text-[#fae5b5] shadow-md'
                        : 'bg-[#18161d] border-[#2e261d] text-[#a89885] hover:border-[#523d24]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-cinzel font-bold text-sm text-[#fae5b5]">{h.name}</span>
                      <span className="text-[10px] text-[#d4a34b] font-mono">{h.type}</span>
                    </div>
                    <p className="text-xs text-[#a89885] mt-1">{h.primaryDomain}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2a241e] text-[11px]">
                      <span>Trait : <strong className="text-[#e09145]">{h.reputationTrait}</strong></span>
                      <span>{h.homeworld}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Faction / Vocation */}
            <div className="space-y-2">
              <label className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider block">
                Vocation & Faction (Grande École / Ordre) :
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(Object.keys(VOCATIONS_DATA) as VocationType[]).map((vocKey) => {
                  const voc = VOCATIONS_DATA[vocKey];
                  const isSelected = character.vocation === vocKey;

                  return (
                    <div
                      key={vocKey}
                      onClick={() => handleSelectVocation(vocKey)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all space-y-1.5 ${
                        isSelected
                          ? 'bg-[#291e13] border-[#d4a34b] text-[#fae5b5] shadow-lg scale-[1.01]'
                          : 'bg-[#18161d] border-[#2e261d] text-[#a89885] hover:border-[#523d24]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel font-bold text-sm text-[#fae5b5]">{voc.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#d4a34b]" />}
                      </div>
                      <p className="text-xs text-[#c9b79c]">{voc.description}</p>
                      {voc.mandatoryTrait && (
                        <div className="text-[10px] pt-1 text-[#e09145]">
                          Trait imposé : <strong>{voc.mandatoryTrait}</strong>
                        </div>
                      )}
                      <div className="text-[10px] text-[#8a7a67]">
                        {voc.talentsExplanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ARCHETYPE */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                Étape 2 : Choix de l'Archétype
              </h2>
              <p className="text-xs text-[#a89885] mt-1">
                L’archétype définit votre rôle, votre compétence primaire (valeur de base 6) et votre compétence secondaire (valeur de base 5).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(ARCHETYPES_DATA).map(([key, arch]) => {
                const isSelected = character.archetype === arch.name;

                return (
                  <div
                    key={key}
                    onClick={() => handleSelectArchetype(key)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-[#291e13] border-[#d4a34b] text-[#fae5b5] shadow-lg scale-[1.01]'
                        : 'bg-[#18161d] border-[#2e261d] text-[#a89885] hover:border-[#523d24]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-cinzel font-bold text-sm text-[#fae5b5]">{arch.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#d4a34b]" />}
                    </div>

                    <p className="text-xs text-[#c9b79c] leading-snug">{arch.description}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-[#29221b] text-xs">
                      <span className="text-[#fae5b5]">
                        Primaire : <strong>{arch.primarySkill}</strong> (6)
                      </span>
                      <span className="text-[#d4a34b]">
                        Secondaire : <strong>{arch.secondarySkill}</strong> (5)
                      </span>
                    </div>

                    <div className="text-[10px] text-[#8a7a67]">
                      Principes suggérés : {arch.suggestedPrinciples.primary} & {arch.suggestedPrinciples.secondary}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: SKILLS ALLOCATION */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                  Étape 3 : Répartition des Compétences
                </h2>
                <p className="text-xs text-[#a89885] mt-1">
                  Base fixée par l’archétype (Primaire : 6, Secondaire : 5, Autres : 4). Répartissez exactement <strong>5 points supplémentaires</strong> (valeur maximale : 8).
                </p>
              </div>

              <div className={`px-4 py-2 rounded-lg border font-mono font-bold text-xs sm:text-sm flex items-center space-x-2 ${
                remainingSkillPoints === 0
                  ? 'bg-green-950/40 border-green-800 text-green-400'
                  : remainingSkillPoints > 0
                  ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                  : 'bg-red-950/40 border-red-800 text-red-300'
              }`}>
                <span>Points libres restants :</span>
                <span className="text-base">{remainingSkillPoints}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['Analyse', 'Combat', 'Discipline', 'Mobilité', 'Rhétorique'] as SkillName[]).map((sName) => {
                const s = character.skills[sName];
                const info = SKILLS_INFO[sName];

                return (
                  <div
                    key={sName}
                    className="bg-[#18161d] rounded-lg border border-[#2e261d] p-4 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <span className="font-cinzel font-bold text-base text-[#fae5b5] block">
                        {sName}
                      </span>
                      <p className="text-xs text-[#a89885] max-w-sm">
                        {info.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleAdjustSkill(sName, -1)}
                        disabled={s.value <= 4}
                        className="w-8 h-8 rounded bg-[#241c14] hover:bg-[#382b1c] disabled:opacity-30 disabled:pointer-events-none text-base font-bold text-[#d4a34b] border border-[#523d24]"
                      >
                        -
                      </button>

                      <div className="w-10 h-10 rounded bg-[#2b2116] border border-[#d4a34b] flex items-center justify-center font-mono font-bold text-lg text-[#fae5b5]">
                        {s.value}
                      </div>

                      <button
                        onClick={() => handleAdjustSkill(sName, 1)}
                        disabled={s.value >= 8 || remainingSkillPoints <= 0}
                        className="w-8 h-8 rounded bg-[#241c14] hover:bg-[#382b1c] disabled:opacity-30 disabled:pointer-events-none text-base font-bold text-[#d4a34b] border border-[#523d24]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: SPECIALIZATIONS */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                  Étape 4 : Sélection des Spécialisations (4 au total)
                </h2>
                <p className="text-xs text-[#a89885] mt-1">
                  Les spécialisations déclenchent des Réussites Critiques lorsque le dé est inférieur ou égal à votre valeur de compétence.
                </p>
              </div>

              <div className={`px-4 py-2 rounded-lg border font-mono font-bold text-xs sm:text-sm flex items-center space-x-2 ${
                totalSpecsChosen === 4
                  ? 'bg-green-950/40 border-green-800 text-green-400'
                  : 'bg-amber-950/40 border-amber-800 text-amber-300'
              }`}>
                <span>Spécialisations choisies :</span>
                <span className="text-base">{totalSpecsChosen} / 4</span>
              </div>
            </div>

            <div className="space-y-6">
              {(['Analyse', 'Combat', 'Discipline', 'Mobilité', 'Rhétorique'] as SkillName[]).map((sName) => {
                const specs = SPECIALIZATIONS_BY_SKILL[sName];
                const chosenInSkill = character.skills[sName].specializations || [];

                return (
                  <div key={sName} className="bg-[#18161d] p-4 rounded-lg border border-[#2e261d] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-cinzel font-bold text-sm text-[#fae5b5]">
                        {sName} (Score: {character.skills[sName].value})
                      </span>
                      <span className="text-xs text-[#8a7a67]">
                        {chosenInSkill.length} active(s)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {specs.map((spec) => {
                        const isSelected = chosenInSkill.includes(spec);

                        return (
                          <button
                            key={spec}
                            type="button"
                            onClick={() => handleToggleSpec(sName, spec)}
                            className={`px-2.5 py-1 rounded text-xs transition-all border ${
                              isSelected
                                ? 'bg-[#c99738] text-black font-bold border-[#c99738] shadow'
                                : totalSpecsChosen >= 4
                                ? 'bg-[#100f13] text-gray-600 border-gray-800 pointer-events-none'
                                : 'bg-[#121115] text-[#a89885] border-[#292631] hover:border-[#523d24] hover:text-[#fae5b5]'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {spec}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: TALENTS */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                  Étape 5 : Sélection des Talents (3 au total)
                </h2>
                <p className="text-xs text-[#a89885] mt-1">
                  Les talents représentent vos dons surhumains, techniques secrètes et atouts personnels distinctifs.
                </p>
              </div>

              <div className={`px-4 py-2 rounded-lg border font-mono font-bold text-xs sm:text-sm flex items-center space-x-2 ${
                character.talents.length === 3
                  ? 'bg-green-950/40 border-green-800 text-green-400'
                  : 'bg-amber-950/40 border-amber-800 text-amber-300'
              }`}>
                <span>Talents choisis :</span>
                <span className="text-base">{character.talents.length} / 3</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {TALENTS_LIST.map((talent) => {
                const isSelected = character.talents.some((t) => t.id === talent.id);
                const isRestricted = talent.restriction && talent.restriction !== character.vocation;
                const vocData = VOCATIONS_DATA[character.vocation];
                const isMandatory = vocData.mandatoryTalentIds.includes(talent.id);

                return (
                  <div
                    key={talent.id}
                    onClick={() => {
                      if (!isRestricted) handleToggleTalent(talent);
                    }}
                    className={`p-3.5 rounded-lg border transition-all space-y-2 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#291e13] border-[#d4a34b] text-[#fae5b5] shadow'
                        : isRestricted
                        ? 'bg-[#101014] border-[#1d1c24] text-gray-600 opacity-40 cursor-not-allowed'
                        : character.talents.length >= 3
                        ? 'bg-[#16141a] border-[#25222b] text-gray-500 opacity-60'
                        : 'bg-[#18161d] border-[#2e261d] text-[#a89885] hover:border-[#523d24] cursor-pointer'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel font-bold text-sm text-[#fae5b5]">{talent.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#d4a34b]" />}
                      </div>

                      {talent.category && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#201911] text-[#d4a34b] font-mono border border-[#42311c] inline-block">
                          {talent.category} {isMandatory && '• OBLIGATOIRE'}
                        </span>
                      )}

                      <p className="text-xs text-[#a89885] leading-relaxed pt-1">
                        {talent.description}
                      </p>
                    </div>

                    {talent.restriction && (
                      <div className="text-[10px] text-[#e09145] font-mono pt-1 border-t border-[#26211a]">
                        Prérequis : {talent.restriction}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: PRINCIPLES & MAXIMES */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                Étape 6 : Principes & Maximes (Valeurs 8, 7, 6, 5, 4)
              </h2>
              <p className="text-xs text-[#a89885] mt-1">
                Classez vos principes : 8 (le plus fondamental), 7, 6, 5, et 4. Les trois principes majeurs (8, 7, 6) requièrent obligatoirement une maxime explicative.
              </p>
            </div>

            <div className="space-y-4">
              {(['Devoir', 'Domination', 'Foi', 'Justice', 'Vérité'] as PrincipleName[]).map((pName) => {
                const p = character.principles[pName];
                const isMajor = p.value >= 6;
                const suggestions = SUGGESTED_MAXIMES[pName];

                return (
                  <div key={pName} className="bg-[#18161d] p-4 rounded-lg border border-[#2e261d] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-cinzel font-bold text-base text-[#fae5b5] mr-2">{pName}</span>
                        <span className="text-xs text-[#8a7a67]">{PRINCIPLES_INFO[pName].description}</span>
                      </div>

                      {/* Selector for 8, 7, 6, 5, 4 */}
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs text-[#a89885] font-mono mr-1">Score :</span>
                        {[8, 7, 6, 5, 4].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleSetPrincipleScore(pName, val)}
                            className={`w-7 h-7 rounded font-mono font-bold text-xs transition-all border ${
                              p.value === val
                                ? 'bg-[#c99738] text-black border-[#c99738] shadow'
                                : 'bg-[#241c14] text-[#a89885] border-[#4a3a28] hover:text-white'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Maxime input if value >= 6 */}
                    {isMajor ? (
                      <div className="space-y-2 pt-2 border-t border-[#262017]">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-[#fae5b5] font-semibold">
                            Maxime obligatoire pour {pName} ({p.value}) :
                          </label>
                          <span className="text-[10px] text-[#d4a34b]">
                            Soutient l'action pour autoriser la Détermination
                          </span>
                        </div>

                        <input
                          type="text"
                          placeholder={`Ex: ${suggestions[0]}`}
                          value={p.maxime || ''}
                          onChange={(e) => handleSetPrincipleMaxime(pName, e.target.value)}
                          className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                        />

                        {/* Quick suggestions pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] text-[#71695f] font-mono self-center">Suggestions :</span>
                          {suggestions.slice(0, 3).map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleSetPrincipleMaxime(pName, sug)}
                              className="px-2 py-0.5 rounded text-[10px] bg-[#121015] hover:bg-[#2b2116] text-[#c9b79c] border border-[#2b241c] truncate max-w-xs"
                            >
                              « {sug} »
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#5e5345] italic">
                        Principe mineur : aucune maxime requise.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: ASSETS */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                  Étape 7 : Atouts & Équipements (Au moins 3, dont 1 tangible)
                </h2>
                <p className="text-xs text-[#a89885] mt-1">
                  Les atouts sont vos armes, boucliers, véhicules ou leviers d’intrigue (chantage, faveurs, informateurs).
                </p>
              </div>

              <div className={`px-4 py-2 rounded-lg border font-mono font-bold text-xs sm:text-sm flex items-center space-x-2 ${
                character.assets.length >= 3 && hasTangibleAsset
                  ? 'bg-green-950/40 border-green-800 text-green-400'
                  : 'bg-amber-950/40 border-amber-800 text-amber-300'
              }`}>
                <span>Atouts : {character.assets.length}</span>
                <span>• {hasTangibleAsset ? '✓ Tangible présent' : '⚠ Aucun tangible'}</span>
              </div>
            </div>

            {/* Currently selected assets */}
            <div className="space-y-2">
              <span className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider block">
                Atouts actuellement sélectionnés :
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {character.assets.map((ast) => (
                  <div key={ast.id} className="bg-[#18161d] p-3 rounded-lg border border-[#3b3022] flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-[#fae5b5]">{ast.name}</span>
                        <span className="text-[10px] px-1 rounded bg-[#291e13] text-[#d4a34b] font-mono">
                          Q{ast.quality} | {ast.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8a7a67]">{ast.keywords.join(', ')}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveAsset(ast.id)}
                      className="text-gray-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Library of Predefined assets */}
            <div className="space-y-2 pt-2 border-t border-[#292218]">
              <span className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider block">
                Ajouter depuis la bibliothèque officielle :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {COMMON_ASSETS.map((ast) => (
                  <button
                    key={ast.id}
                    type="button"
                    onClick={() => handleAddPredefinedAsset(ast)}
                    className="p-2.5 rounded bg-[#121115] hover:bg-[#241c14] border border-[#2b241c] hover:border-[#543d22] text-left text-xs transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-[#fae5b5]">{ast.name}</div>
                      <div className="text-[10px] text-[#8a7a67]">{ast.type} • {ast.category}</div>
                    </div>
                    <Plus className="w-4 h-4 text-[#d4a34b]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Create custom asset */}
            <form onSubmit={handleAddCustomAsset} className="bg-[#18161d] p-3.5 rounded-lg border border-[#382d1f] flex flex-wrap gap-2.5 items-center">
              <input
                type="text"
                placeholder="Nom d'atout sur mesure (ex: Dague familiale de Caladan...)"
                value={customAssetName}
                onChange={(e) => setCustomAssetName(e.target.value)}
                className="flex-1 min-w-[200px] bg-[#0f1015] border border-[#4a3b2b] rounded px-3 py-1.5 text-xs text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
              />
              <select
                value={customAssetType}
                onChange={(e) => setCustomAssetType(e.target.value as 'tangible' | 'intangible')}
                className="bg-[#0f1015] border border-[#4a3b2b] rounded px-2.5 py-1.5 text-xs text-[#fae5b5]"
              >
                <option value="tangible">Tangible (Physique)</option>
                <option value="intangible">Intangible (Social/Secret)</option>
              </select>
              <input
                type="text"
                placeholder="Mots-clés (séparés par virgule)"
                value={customAssetKeywords}
                onChange={(e) => setCustomAssetKeywords(e.target.value)}
                className="w-44 bg-[#0f1015] border border-[#4a3b2b] rounded px-2 py-1.5 text-xs text-[#fae5b5]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-[#c99738] hover:bg-[#d9a84a] text-black font-semibold text-xs"
              >
                Ajouter
              </button>
            </form>
          </div>
        )}

        {/* STEP 8: FINAL DETAILS, AMBITION & BACKGROUND */}
        {currentStep === 8 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                Étape 8 : Finitions, Traits de Réputation & Background
              </h2>
              <p className="text-xs text-[#a89885] mt-1">
                Finalisez l’identité de votre protagoniste, son trait personnel de réputation, son ambition majeure et son historique.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider block">
                    Nom complet :
                  </label>
                  {onOpenChatbot && (
                    <button
                      type="button"
                      onClick={() => onOpenChatbot(`Génère 5 noms nobles et authentiques pour mon personnage (${character.archetype}, ${character.vocation}, au service de la ${character.house.name}). Explique leur origine.`)}
                      className="text-[11px] text-[#d4a34b] hover:text-[#fae5b5] flex items-center space-x-1 font-semibold transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Générer avec le Chatbot IA</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Ex: Kara Molay"
                  value={character.name}
                  onChange={(e) => setCharacter((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded px-3 py-2 text-sm text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider block">
                  Genre :
                </label>
                <select
                  value={character.gender || 'Femme'}
                  onChange={(e) => setCharacter((prev) => ({ ...prev, gender: e.target.value }))}
                  className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded px-3 py-2 text-sm text-[#fae5b5]"
                >
                  <option value="Femme">Femme</option>
                  <option value="Homme">Homme</option>
                  <option value="Autre">Autre / Non-binaire</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-cinzel font-bold text-[#e09145] uppercase tracking-wider block">
                  Ambition Suprême (Liée au principe le plus élevé : {Object.entries(character.principles).find(([_, p]) => p.value === 8)?.[0] || 'Devoir'}) :
                </label>
                <input
                  type="text"
                  placeholder="Ex: Devenir un maître assassin de l'ombre au service de la dynastie"
                  value={character.ambition}
                  onChange={(e) => setCharacter((prev) => ({ ...prev, ambition: e.target.value }))}
                  className="w-full bg-[#0f1015] border border-[#8a4e1b] rounded px-3 py-2 text-sm text-[#fae5b5] focus:outline-none focus:border-[#d4a34b]"
                />
              </div>
            </div>

            {/* Backstory summary with button to open the full generator */}
            <div className="bg-[#18161d] p-4 rounded-lg border border-[#3b3022] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-cinzel font-bold text-sm text-[#fae5b5]">
                  Chroniques & Historique Généré
                </span>
                <button
                  type="button"
                  onClick={onOpenBackstoryGen}
                  className="px-3 py-1 rounded bg-[#2b2014] hover:bg-[#3d2b1b] text-[#d4a34b] border border-[#5c4021] text-xs font-semibold flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Générer un historique aléatoire complet</span>
                </button>
              </div>

              <p className="text-xs text-[#a89885] italic leading-relaxed">
                {character.backstory.fullNarrative || 'Aucun récit d’historique généré. Cliquez sur le bouton ci-dessus pour composer une histoire de Dune.'}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-[#292218]">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-lg bg-[#211a14] hover:bg-[#33261b] disabled:opacity-30 disabled:pointer-events-none text-xs sm:text-sm font-semibold text-[#a89885] hover:text-[#fae5b5] flex items-center space-x-1 border border-[#3d2f1f]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentStep < 8 ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(8, prev + 1))}
                className="px-5 py-2 rounded-lg bg-[#c99738] hover:bg-[#d9a84a] text-black font-bold text-xs sm:text-sm flex items-center space-x-1 shadow-lg"
              >
                <span>Étape Suivante</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onFinishWizard}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#c99738] to-[#9e6224] hover:from-[#d9a84a] hover:to-[#b3702a] text-black font-extrabold text-xs sm:text-sm flex items-center space-x-2 shadow-xl"
              >
                <Check className="w-4 h-4" />
                <span>Terminer et Voir la Fiche</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
