import { HouseInfo, HouseType } from '../types/dune';
import { getRandomElement } from './backgroundGenerator';

export const HOUSE_TYPES: HouseType[] = [
  'Maison naissante',
  'Maison mineure',
  'Maison majeure',
  'Grande Maison',
  'Faction / Ordre',
];

export const HOUSE_TRAITS_SUGGESTIONS = [
  'Honorable',
  'Brutale',
  'Impériale',
  'Secrète',
  'Innovatrice',
  'Martiale',
  'Impitoyable',
  'Artistique',
  'Subtile',
  'Opulente',
  'Endurante',
  'Pragmatique',
  'Fière',
  'Mystique',
  'Redoutable',
  'Calculatrice',
  'Marchande',
  'Érudite',
  'Fidèle au désert',
  'Industrieuse',
  'Inflexible',
  'Stratège',
  'Vindicative',
  'Visionnaire',
];

export const HOUSE_COLORS_PRESETS = [
  { label: 'Vert & Noir (Atréides)', colors: 'Vert et Noir (Sinople et Sable)' },
  { label: 'Bleu, Rouge & Noir (Harkonnen)', colors: 'Bleu foncé, Rouge sang et Noir' },
  { label: 'Or & Écarlate (Corrino)', colors: 'Or impérial et Écarlate' },
  { label: 'Cuivre & Améthyste (Ix)', colors: 'Cuivre poli et Améthyste' },
  { label: 'Jaune or & Émeraude (Richese)', colors: 'Jaune d’or et Vert émeraude' },
  { label: 'Argent & Bleu acier (Ginaz)', colors: 'Argent et Bleu acier' },
  { label: 'Écarlate & Sang de fer (Moritani)', colors: 'Écarlate et Gris ardoise (Sang et Fer)' },
  { label: 'Pourpre & Ivoire (Ecaz)', colors: 'Pourpre impériale et Ivoire' },
  { label: 'Blanc & Rouge (Molay)', colors: 'Blanc et Rouge (D’argent et de gueules)' },
  { label: 'Gris perle & Ambre (Fenring)', colors: 'Gris perle et Ambre' },
  { label: 'Émeraude & Cyan (Hagal)', colors: 'Émeraude et Cyan étincelant' },
  { label: 'Bleu nuit & Argent givré (Thorvald)', colors: 'Bleu nuit et Argent givré' },
  { label: 'Bronze & Ocre sable (Mutelli)', colors: 'Bronze et Ocre sable' },
  { label: 'Indigo & Or pâle (Taligari)', colors: 'Indigo et Or pâle' },
  { label: 'Sable, Ocre & Bleu ibad (Fremen)', colors: 'Sable, Ocre et Bleu ibad' },
  { label: 'Noir obsidienne & Argent (Bene Gesserit)', colors: 'Noir obsidienne et Argent' },
  { label: 'Sanguine & Or antique', colors: 'Sanguine et Or antique' },
  { label: 'Cobalt & Platine', colors: 'Cobalt profond et Platine' },
  { label: 'Cendre & Braise', colors: 'Gris cendre et Rouge braise' },
];

export const HOUSE_SIGIL_PRESETS = [
  { name: 'Faucon rouge', banner: 'Faucon rouge stylisé en plein vol sur champ coupé' },
  { name: 'Griffon d’acier', banner: 'Griffon agressif noir et rouge aux serres d’acier dominant des chaînes brisées' },
  { name: 'Lion d’Or', banner: 'Fier Lion d’Or rugissant coiffé de la tiare impériale' },
  { name: 'Double hélice', banner: 'Double hélice cybernétique stylisée d’améthyste sertie sur champ cuivré' },
  { name: 'Sablier solaire', banner: 'Sablier solaire en or pur reposant sur deux roues dentées d’émeraude' },
  { name: 'Deux glaives croisés', banner: 'Deux épées de duel d’acier pur croisées au-dessus d’une vague d’écume' },
  { name: 'Vipère à cornes', banner: 'Vipère à cornes venimeuse lovée sur champ strié de zébrures écarlates' },
  { name: 'Arbre de brume (Fogwood)', banner: 'Arbre stylisé aux branches torsadées ruisselant de sève dorée' },
  { name: 'Parchemin et dague', banner: 'Parchemin immaculé ceint d’un ruban écarlate, tranché par une dague fine' },
  { name: 'Caméléon couronné', banner: 'Caméléon d’ambre posé sur une branche d’argent, ceint d’une couronne princière' },
  { name: 'Gemme prismatique', banner: 'Cristal d’opale taillé rayonnant de mille facettes scintillantes' },
  { name: 'Loup arctique', banner: 'Tête de loup d’argent givré hurlant vers une étoile polaire à huit branches' },
  { name: 'Balance & Épi d’or', banner: 'Balance d’airain pesant des gerbes de blé d’or sur fond ocre' },
  { name: 'Phénix d’azur', banner: 'Phénix d’or étincelant surgissant d’une mer indigo aux reflets stellaires' },
  { name: 'Souris Muad’Dib', banner: 'Silhouette de la souris des sables bondissant devant les deux lunes d’Arrakis' },
  { name: 'Prisme du destin', banner: 'Prisme de cristal projetant les fils du temps sur champ d’obsidienne' },
  { name: 'Taureau noir sanglant', banner: 'Tête de taureau noir aux cornes dorées dégoulinantes d’un ruban écarlate' },
  { name: 'Serpent ouroboros', banner: 'Grand serpent d’émeraude se mordant la queue autour d’une sphère stellaire' },
  { name: 'Rose de fer', banner: 'Rose forgée dans le fer noir entourée d’épines de damacier étincelantes' },
  { name: 'Éclipse stellaire', banner: 'Soleil d’or obscurci par un disque d’obsidienne auréolé de flammes couronnaires' },
  { name: 'Hydre mécanique', banner: 'Hydre à trois têtes articulées d’acier brossé sur champ d’azur' },
];

export const HOUSE_HOMEWORLD_PRESETS = [
  { name: 'Caladan', type: 'Planète-océan', desc: 'Monde tempéré verdoyant, riche en mers houleuses et riz pundi' },
  { name: 'Giedi Prime', type: 'Monde industriel', desc: 'Étouffé sous les forges toxiques, les usines d’esclaves et les arènes' },
  { name: 'Kaitain', type: 'Monde-Trône impérial', desc: 'Capitale somptueuse de l’Imperium et palais d’opale impérial' },
  { name: 'Ix', type: 'Cités souterraines', desc: 'Pôle technologique souterrain bravant les limites des interdits' },
  { name: 'Richese', type: 'Monde technologique', desc: 'Horlogerie de précision stellaire et miniaturisation de pointe' },
  { name: 'Ginaz', type: 'Archipels d’entraînement', desc: 'Îles orageuses dédiées aux académies de maîtres d’armes' },
  { name: 'Grumman', type: 'Monde martial', desc: 'Fief belliqueux miné par les carrières et les garnisons d’assassins' },
  { name: 'Ecaz', type: 'Monde sylvestre', desc: 'Mégalithes de bois de brume, flore luxuriante et sève de semuta' },
  { name: 'Hagal', type: 'Planète des gemmes', desc: 'Grottes de cristal géantes et mines d’opales prismatiques' },
  { name: 'Belégant', type: 'Monde arctique', desc: 'Glaces éternelles, toundra gelée et chantiers navals polaires' },
  { name: 'Salusa Secundus', type: 'Planète-prison', desc: 'Enfer radioactif hostile où sont forgés les impitoyables Sardaukars' },
  { name: 'Arrakis', type: 'Planète des sables', desc: 'Monde désertique hostile, unique source de l’Épice gériatrique' },
  { name: 'Zanovar', type: 'Monde culturel', desc: 'Cités de marbre et de canaux consacrées aux archives et aux arts' },
  { name: 'Gansireed', type: 'Monde agraire & fluvial', desc: 'Plaines céréalières fertiles et carrefours de convois du CHOM' },
  { name: 'Thalassa Prime', type: 'Monde aquatique', desc: 'Archipels flottants et chantiers de barges sous-marines' },
  { name: 'Varanis', type: 'Monde forteresse', desc: 'Bastions de basalte érigés sur des plateaux volcaniques' },
  { name: 'Oros Minora', type: 'Monde minier', desc: 'Canyons arides criblés d’extracteurs de métaux précieux' },
];

export const HOUSE_DOMAIN_AREAS = [
  'Agriculture',
  'Industrie',
  'Armée',
  'Espionnage / Kanly',
  'Science / Technologie',
  'Arts & Culture',
  'Politique & Faveurs',
  'Commerce & Finance (CHOM)',
  'Religion & Foi',
  'Flotte & Navigation',
  'Médecine & Biologie',
  'Épice & Drogues rares',
];

export const HOUSE_DOMAIN_ROLES = [
  'Production',
  'Conception & R&D',
  'Main-d’œuvre & Servitude',
  'Experts & Spécialistes',
  'Brevets & Monopoles',
  'Flotte de transport',
  'Réseau d’infiltration',
  'Comptoirs & Banques',
];

export const HOUSE_RULER_TITLES = [
  'Duc',
  'Duchesse',
  'Baron',
  'Baronne',
  'Comte',
  'Comtesse',
  'Archiduc',
  'Archiduchesse',
  'Vicomte',
  'Vicomtesse',
  'Sire',
  'Dame',
  'Grand Margrave',
  'Chancelier',
  'Matriarche',
  'Gouverneur',
  'Naib',
  'Primus',
];

export const HOUSE_MOTTOS = [
  'Il n’est point de paix sans honneur.',
  'Ce que nous prenons nous appartient.',
  'La loi est la volonté du fer.',
  'Créer ce que nul n’ose concevoir.',
  'La précision gouverne les mondes.',
  'La lame ne tremble jamais.',
  'Le sang lave toute insulte.',
  'La beauté survit aux empires.',
  'Le silence est le plus doux des poisons.',
  'L’ombre dirige la lumière.',
  'Richesses éternelles, volontés d’acier.',
  'Froid comme le roc, implacable comme l’hiver.',
  'Prospérité par l’effort et le pacte.',
  'Fidélité au-delà de la tourmente.',
  'Le désert purifie et forge les justes.',
  'Dans la nuit, nous sommes le roc.',
  'Vaincre sans faiblir, régner sans merci.',
  'Toujours plus haut, jamais asservi.',
  'Le savoir est le poison des tyrans.',
  'Par le bouclier et la dague.',
];

const HOUSE_NAME_PREFIXES = [
  'Thorne', 'Valerius', 'Karsak', 'Morven', 'Al-Khabir', 'Bel-Ami', 'Solis',
  'Caldera', 'D’Aubry', 'Vane', 'Maros', 'Kestral', 'Varian', 'Dray', 'Sulan',
  'Korba', 'Aldor', 'Voronis', 'Tyrell', 'Corian', 'Brandt', 'Elora', 'Ravena',
  'Tarragon', 'Blackthorn', 'Castamir', 'Gherald', 'Valois', 'Nekros', 'Astris'
];

const RULER_GIVEN_NAMES = [
  'Leto', 'Vladimir', 'Dominic', 'Ilban', 'Armand', 'Hundro', 'Cassian', 'Hasimir',
  'Danel', 'Torvald', 'Gael', 'Elad', 'Karr', 'Vorian', 'Darien', 'Renki',
  'Kara', 'Irulan', 'Margot', 'Vivia', 'Tessia', 'Wensicia', 'Elinor', 'Silandra'
];

/**
 * Generates an evocative random Noble House compliant with Dune 2d20 rules
 */
export function generateRandomHouse(typeOverride?: HouseType): HouseInfo {
  const rootName = getRandomElement(HOUSE_NAME_PREFIXES);
  const houseName = `Maison ${rootName}`;
  const houseType: HouseType = typeOverride || getRandomElement(['Maison naissante', 'Maison mineure', 'Maison majeure', 'Grande Maison'] as HouseType[]);
  const homeworldObj = getRandomElement(HOUSE_HOMEWORLD_PRESETS);
  const trait = getRandomElement(HOUSE_TRAITS_SUGGESTIONS);
  const colorPreset = getRandomElement(HOUSE_COLORS_PRESETS);
  const sigilPreset = getRandomElement(HOUSE_SIGIL_PRESETS);
  const area1 = getRandomElement(HOUSE_DOMAIN_AREAS);
  const role1 = getRandomElement(HOUSE_DOMAIN_ROLES);
  const area2 = getRandomElement(HOUSE_DOMAIN_AREAS.filter((a) => a !== area1));
  const role2 = getRandomElement(HOUSE_DOMAIN_ROLES.filter((r) => r !== role1));
  const motto = getRandomElement(HOUSE_MOTTOS);
  const rulerTitle = getRandomElement(HOUSE_RULER_TITLES);
  const rulerName = `${getRandomElement(RULER_GIVEN_NAMES)} ${rootName}`;

  return {
    id: `custom-house-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: houseName,
    type: houseType,
    homeworld: `${homeworldObj.name} (${homeworldObj.type})`,
    reputationTrait: trait,
    primaryDomain: `${area1} (${role1})`,
    secondaryDomain: `${area2} (${role2})`,
    colors: colorPreset.colors,
    sigil: sigilPreset.name,
    bannerDescription: sigilPreset.banner,
    motto,
    rulerTitle,
    rulerName: `${rulerTitle} ${rulerName}`,
    notes: `Fief noble réputé pour sa prédominance en ${area1.toLowerCase()} et ses coutumes héraldiques ancestrales.`,
    isCustom: true,
  };
}

const STORAGE_KEY = 'dune_2d20_custom_houses';

/**
 * Retrieve saved custom houses from localStorage safely
 */
export function getStoredCustomHouses(): HouseInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save or update a custom house in localStorage
 */
export function saveCustomHouseToStorage(house: HouseInfo): HouseInfo[] {
  try {
    const existing = getStoredCustomHouses();
    const houseWithId: HouseInfo = {
      ...house,
      id: house.id || `custom-house-${Date.now()}`,
      isCustom: true,
    };

    const index = existing.findIndex((h) => h.id === houseWithId.id || h.name.toLowerCase() === houseWithId.name.toLowerCase());
    let updated: HouseInfo[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = houseWithId;
    } else {
      updated = [houseWithId, ...existing];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Delete a custom house from localStorage
 */
export function deleteCustomHouseFromStorage(houseIdOrName: string): HouseInfo[] {
  try {
    const existing = getStoredCustomHouses();
    const updated = existing.filter((h) => h.id !== houseIdOrName && h.name !== houseIdOrName);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
