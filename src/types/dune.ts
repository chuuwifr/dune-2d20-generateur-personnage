/**
 * Types pour le système Dune : Aventures dans l'Imperium (2d20)
 */

export type SkillName = 'Analyse' | 'Combat' | 'Discipline' | 'Mobilité' | 'Rhétorique';

export type PrincipleName = 'Devoir' | 'Domination' | 'Foi' | 'Justice' | 'Vérité';

export type VocationType = 
  | 'Standard' 
  | 'Bene Gesserit' 
  | 'Mentat' 
  | 'Docteur Suk' 
  | 'Fremen' 
  | 'Agent de la Guilde';

export type HouseType = 'Maison naissante' | 'Maison mineure' | 'Maison majeure' | 'Grande Maison';

export interface PrincipleScore {
  name: PrincipleName;
  value: number; // 4 to 8, strictly unique across [8, 7, 6, 5, 4]
  maxime?: string; // Mandatory if value >= 6
  isBroken?: boolean; // When principle is bafoué in play
}

export interface SkillScore {
  name: SkillName;
  value: number; // 4 to 8
  specializations: string[];
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  category?: string;
  restriction?: VocationType | string;
  requiresSkill?: SkillName;
  requiresPrinciple?: PrincipleName;
}

export interface Asset {
  id: string;
  name: string;
  type: 'tangible' | 'intangible';
  category: 'Arme' | 'Protection' | 'Équipement' | 'Véhicule' | 'Contact' | 'Information' | 'Faveur' | 'Autre';
  quality: number; // 0 to 4
  keywords: string[];
  description?: string;
}

export interface CharacterTrait {
  id: string;
  name: string;
  type: 'rôle' | 'réputation' | 'faction' | 'maison' | 'situationnel';
  description?: string;
  effectHint?: string; // ex: "-1 Difficulté pour les interactions diplomatiques"
}

export interface HouseInfo {
  name: string;
  type: HouseType;
  homeworld: string;
  reputationTrait: string;
  primaryDomain: string;
  secondaryDomain: string;
  colors: string;
  sigil: string;
  bannerDescription?: string;
}

export interface BackstoryDetails {
  originPlanet: string;
  birthStatus: string;
  formativeEvent: string;
  darkSecretOrDebt: string;
  distinctiveFeature: string;
  trinket: string;
  fullNarrative: string;
}

export interface DuneCharacter {
  id: string;
  name: string;
  gender?: string;
  concept: string;
  vocation: VocationType;
  archetype: string;
  house: HouseInfo;
  traits: CharacterTrait[];
  skills: Record<SkillName, SkillScore>;
  principles: Record<PrincipleName, PrincipleScore>;
  talents: Talent[];
  assets: Asset[];
  ambition: string; // Linked to highest principle (value 8)
  backstory: BackstoryDetails;
  determination: number; // Max 3 (starts at 1)
  progressionPoints: number;
  personalNotes?: string;
}

export interface ArchetypeData {
  name: string;
  description: string;
  primarySkill: SkillName;
  secondarySkill: SkillName;
  suggestedSpecs: {
    skill: SkillName;
    name: string;
  }[];
  archetypeTalentId: string;
  suggestedPrinciples: {
    primary: PrincipleName;
    secondary: PrincipleName;
  };
}

export interface DiceTestResult {
  characterName: string;
  skillName: SkillName;
  skillValue: number;
  principleName: PrincipleName;
  principleValue: number;
  targetNumber: number; // TN = Skill + Principle
  specializationUsed?: string;
  diceCount: number; // 2 to 5
  difficulty: number; // 0 to 5
  diceRolled: {
    roll: number;
    isSuccess: boolean;
    isCritical: boolean;
    isComplication: boolean;
  }[];
  successCount: number;
  isSuccess: boolean;
  momentumGenerated: number;
  complicationsCount: number;
  timestamp: string;
}
