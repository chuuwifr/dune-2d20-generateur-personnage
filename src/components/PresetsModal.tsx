import React from 'react';
import { DuneCharacter, VocationType, SkillName, PrincipleName, CharacterTrait } from '../types/dune';
import { 
  PRESET_CHARACTERS, 
  ARCHETYPES_DATA, 
  VOCATIONS_DATA, 
  TALENTS_LIST, 
  SPECIALIZATIONS_BY_SKILL, 
  COMMON_ASSETS, 
  PRESET_HOUSES,
  SUGGESTED_MAXIMES
} from '../data/duneData';
import { 
  generateBackstory, 
  generateRandomName, 
  getRandomElement 
} from '../utils/backgroundGenerator';
import { 
  Users, 
  X, 
  Sparkles, 
  Dice5, 
  Check, 
  RotateCcw,
  Shield
} from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter: (char: DuneCharacter) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectCharacter,
}) => {
  if (!isOpen) return null;

  // Generate an instant 100% compliant random character
  const handleGenerateInstantCharacter = () => {
    const vocations: VocationType[] = ['Standard', 'Bene Gesserit', 'Mentat', 'Docteur Suk', 'Fremen', 'Agent de la Guilde'];
    const vocation = getRandomElement(vocations);
    const archKeys = Object.keys(ARCHETYPES_DATA);
    const archKey = getRandomElement(archKeys);
    const arch = ARCHETYPES_DATA[archKey];
    const house = getRandomElement(PRESET_HOUSES);
    const gender = Math.random() > 0.5 ? 'Femme' : 'Homme';
    const nameGen = generateRandomName(gender);

    // Skills: Primary 6, Secondary 5, others 4 + 5 free points allocated
    const skills: Record<SkillName, { name: SkillName; value: number; specializations: string[] }> = {
      Analyse: { name: 'Analyse', value: 4, specializations: [] },
      Combat: { name: 'Combat', value: 4, specializations: [] },
      Discipline: { name: 'Discipline', value: 4, specializations: [] },
      Mobilité: { name: 'Mobilité', value: 4, specializations: [] },
      Rhétorique: { name: 'Rhétorique', value: 4, specializations: [] },
    };
    skills[arch.primarySkill].value = 6;
    skills[arch.secondarySkill].value = 5;

    // Distribute 5 points
    let pointsToGive = 5;
    const allSkills: SkillName[] = ['Analyse', 'Combat', 'Discipline', 'Mobilité', 'Rhétorique'];
    while (pointsToGive > 0) {
      const targetSkill = getRandomElement(allSkills);
      if (skills[targetSkill].value < 8) {
        skills[targetSkill].value += 1;
        pointsToGive -= 1;
      }
    }

    // Specializations: 4 total
    // 2 from archetype
    arch.suggestedSpecs.forEach((spec) => {
      skills[spec.skill].specializations.push(spec.name);
    });
    // 2 more from skills
    let specsAdded = 2;
    while (specsAdded < 4) {
      const s = getRandomElement(allSkills);
      const possible = SPECIALIZATIONS_BY_SKILL[s];
      const picked = getRandomElement(possible);
      if (!skills[s].specializations.includes(picked)) {
        skills[s].specializations.push(picked);
        specsAdded++;
      }
    }

    // Principles: unique values [8, 7, 6, 5, 4]
    const shuffledValues = [8, 7, 6, 5, 4].sort(() => Math.random() - 0.5);
    const principleNames: PrincipleName[] = ['Devoir', 'Domination', 'Foi', 'Justice', 'Vérité'];
    const principles: any = {};

    principleNames.forEach((pName, idx) => {
      const val = shuffledValues[idx];
      const maximesList = SUGGESTED_MAXIMES[pName];
      principles[pName] = {
        name: pName,
        value: val,
        maxime: val >= 6 ? getRandomElement(maximesList) : undefined,
      };
    });

    // Talents: 3 talents
    const vocData = VOCATIONS_DATA[vocation];
    const talents: any[] = [];
    if (vocData.mandatoryTalentIds.length > 0) {
      const man = TALENTS_LIST.find((t) => t.id === vocData.mandatoryTalentIds[0]);
      if (man) talents.push(man);
    }
    const archTalent = TALENTS_LIST.find((t) => t.id === arch.archetypeTalentId);
    if (archTalent && !talents.some((t) => t.id === archTalent.id)) {
      talents.push(archTalent);
    }
    while (talents.length < 3) {
      const available = TALENTS_LIST.filter((t) => (!t.restriction || t.restriction === vocation) && !talents.some((at) => at.id === t.id));
      if (available.length > 0) {
        talents.push(getRandomElement(available));
      } else {
        break;
      }
    }

    // Assets: 3 assets (at least 1 tangible)
    const tangibles = COMMON_ASSETS.filter((a) => a.type === 'tangible');
    const intangibles = COMMON_ASSETS.filter((a) => a.type === 'intangible');
    const assets = [
      getRandomElement(tangibles),
      getRandomElement(COMMON_ASSETS),
      getRandomElement(intangibles),
    ];

    // Traits
    const traits: CharacterTrait[] = [
      { id: 't1', name: arch.name, type: 'rôle', effectHint: 'Domaine d’action de base' },
      { id: 't2', name: getRandomElement(['Honorable', 'Fier', 'Insondable', 'Résolu', 'Implacable', 'Perspicace']), type: 'réputation' },
    ];
    if (vocData.mandatoryTrait) {
      traits.push({ id: 't3', name: vocData.mandatoryTrait, type: 'faction' });
    }
    traits.push({ id: 't4', name: `${house.name} (${house.reputationTrait})`, type: 'maison' });

    // Ambition based on top principle
    const topPrinciple = Object.entries(principles).find(([_, p]: any) => p.value === 8)?.[0] as PrincipleName || 'Devoir';
    const ambitionsMap: Record<PrincipleName, string> = {
      Devoir: 'Élever la gloire de ma Maison et protéger ma lignée sur Arrakis.',
      Domination: 'Accroître le monopole commercial de ma Maison au CHOM.',
      Foi: 'Suivre les voies du destin et faire triompher les prophéties anciennes.',
      Justice: 'Exécuter le Kanly sacré et venger le sang de mes ancêtres.',
      Vérité: 'Lever le voile sur les complots impériaux et déjouer les trahisons.',
    };

    const backstory = generateBackstory(vocation, arch.name, house.name);

    const generatedChar: DuneCharacter = {
      id: `random-${Date.now()}`,
      name: nameGen.name,
      gender,
      concept: `${arch.name} ${vocation !== 'Standard' ? vocation : 'loyal'} au service de la ${house.name}`,
      vocation,
      archetype: arch.name,
      house,
      traits,
      skills,
      principles,
      talents,
      assets,
      ambition: ambitionsMap[topPrinciple],
      backstory,
      determination: 1,
      progressionPoints: 0,
    };

    onSelectCharacter(generatedChar);
    onClose();
  };

  const handleResetBlank = () => {
    const blankChar: DuneCharacter = {
      id: `new-${Date.now()}`,
      name: '',
      gender: 'Femme',
      concept: '',
      vocation: 'Standard',
      archetype: 'Commandant',
      house: PRESET_HOUSES[0],
      traits: [
        { id: 't1', name: 'Commandant', type: 'rôle' },
        { id: 't2', name: 'Honorable', type: 'réputation' },
        { id: 't3', name: `${PRESET_HOUSES[0].name} (${PRESET_HOUSES[0].reputationTrait})`, type: 'maison' },
      ],
      skills: {
        Analyse: { name: 'Analyse', value: 4, specializations: [] },
        Combat: { name: 'Combat', value: 5, specializations: ['Tactique'] },
        Discipline: { name: 'Discipline', value: 4, specializations: [] },
        Mobilité: { name: 'Mobilité', value: 4, specializations: [] },
        Rhétorique: { name: 'Rhétorique', value: 6, specializations: ['Commandement'] },
      },
      principles: {
        Devoir: { name: 'Devoir', value: 8, maxime: 'Je sers le bon vouloir de ma Maison.' },
        Domination: { name: 'Domination', value: 7, maxime: 'J’obtiens ce que je veux.' },
        Foi: { name: 'Foi', value: 6, maxime: 'Ma famille me fait confiance.' },
        Justice: { name: 'Justice', value: 5 },
        Vérité: { name: 'Vérité', value: 4 },
      },
      talents: [
        TALENTS_LIST.find((t) => t.id === 'specialiste-guerre')!,
        TALENTS_LIST.find((t) => t.id === 'imperieux')!,
        TALENTS_LIST.find((t) => t.id === 'audacieux')!,
      ],
      assets: [
        COMMON_ASSETS[0], // Kindjal
        COMMON_ASSETS[5], // Bouclier
        COMMON_ASSETS[12], // Chantage
      ],
      ambition: 'Faire prospérer ma Maison dans les sables d’Arrakis',
      backstory: {
        originPlanet: 'Caladan',
        birthStatus: 'Cadet de famille noble',
        formativeEvent: 'A survécu à un duel rituel pour protéger les bannières familiales',
        darkSecretOrDebt: 'Détient des preuves sur une trahison au sein du conseil',
        distinctiveFeature: 'Regard déterminé et démarche droite',
        trinket: 'Kindjal d’apparat gravé',
        fullNarrative: '',
      },
      determination: 1,
      progressionPoints: 0,
    };

    onSelectCharacter(blankChar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#15141a] rounded-xl border border-[#523d24] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#382b1c] bg-[#1a1820] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#2b2014] text-[#d4a34b] border border-[#5c4021]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                Prétirés Officiels & Générateur Rapide
              </h2>
              <p className="text-xs text-[#a89885]">
                Chargez un archétype canonique du livre de base ou composez un personnage aléatoire complet
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* Quick Instant Random Generator */}
          <div className="bg-gradient-to-r from-[#241a12] via-[#2d2116] to-[#1c1510] p-4 rounded-xl border border-[#6b4c27] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <span className="font-cinzel font-bold text-sm text-[#fae5b5] flex items-center space-x-1.5">
                <Dice5 className="w-4 h-4 text-[#d4a34b]" />
                <span>Génération Aléatoire Instantanée Complète</span>
              </span>
              <p className="text-xs text-[#a89885] max-w-lg">
                Crée en 1 clic un personnage aléatoire 100% conforme : compétences valides (28 pts), 4 spécialisations, 3 talents, maximes soignées, 3 atouts et historique immersif complet.
              </p>
            </div>

            <button
              onClick={handleGenerateInstantCharacter}
              className="px-4 py-2 rounded-lg bg-[#c99738] hover:bg-[#d9a84a] text-black font-extrabold text-xs whitespace-nowrap shadow flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Générer un Personnage Aléatoire</span>
            </button>
          </div>

          {/* Canon Characters List */}
          <div className="space-y-3">
            <span className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider block">
              Personnages Prétirés du Livre de Base :
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRESET_CHARACTERS.map((preset) => (
                <div
                  key={preset.id}
                  className="bg-[#18161d] p-4 rounded-lg border border-[#2e261d] hover:border-[#634827] transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-cinzel font-bold text-sm text-[#fae5b5]">{preset.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#291f14] text-[#d4a34b] font-mono">
                        {preset.archetype}
                      </span>
                    </div>

                    <p className="text-xs text-[#c9b79c] leading-snug">{preset.concept}</p>

                    <div className="text-[11px] text-[#8a7a67] pt-1">
                      Maison : <strong className="text-[#fae5b5]">{preset.house.name}</strong> • Vocation : <strong className="text-[#fae5b5]">{preset.vocation}</strong>
                    </div>

                    <div className="pt-1.5 border-t border-[#29221b] text-[10px] space-y-0.5 text-[#a89885]">
                      <div>Compétences clés : {Object.entries(preset.skills).filter(([_, s]) => s.value >= 6).map(([k, s]) => `${k} (${s.value})`).join(', ')}</div>
                      <div>Atout phare : {preset.assets[0]?.name}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectCharacter(preset);
                      onClose();
                    }}
                    className="w-full py-1.5 rounded bg-[#241c14] hover:bg-[#3b2b1a] text-[#d4a34b] hover:text-[#fae5b5] border border-[#543d22] text-xs font-semibold flex items-center justify-center space-x-1 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Charger cette Fiche</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#382b1c] bg-[#1a1820] flex items-center justify-between">
          <button
            onClick={handleResetBlank}
            className="text-xs text-[#a89885] hover:text-red-400 flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser une Fiche Vierge</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-[#fae5b5] bg-[#291f14] border border-[#4a3a28] hover:bg-[#382b1c]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
