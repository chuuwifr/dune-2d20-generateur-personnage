import { BackstoryDetails, VocationType } from '../types/dune';

const PLANETS = [
  { name: 'Arrakis (Dune)', type: 'Planète-désert', note: 'Monde rude, sans pluie, foyer exclusif du Mélange et des vers des sables géants.' },
  { name: 'Caladan', type: 'Planète-océan', note: 'Monde tempéré verdoyant, berceau ancestral de la Maison Atréides, riche en riz pundi et vignes.' },
  { name: 'Giedi Prime', type: 'Monde industriel', note: 'Planète étouffée sous les forges toxiques et les arènes de gladiateurs de la Maison Harkonnen.' },
  { name: 'Kaitain', type: 'Monde-trône impérial', note: 'Capitale somptueuse de l’Imperium, siège du Palais d’Opale et du Trône du Lion d’Or.' },
  { name: 'Salusa Secundus', type: 'Planète-prison', note: 'Monde dévasté par l’atome, enfer radioactif où sont forgés les impitoyables Sardaukars.' },
  { name: 'Ix', type: 'Cités souterraines', note: 'Pôle technologique souterrain de la Maison Vernius, contournant l’esprit du Jihad Butlérien.' },
  { name: 'Wallach IX', type: 'Planète-école', note: 'Siège pluvieux du Chapitre de la Communauté des Sœurs du Bene Gesserit et de leurs archives génétiques.' },
  { name: 'Richese', type: 'Monde technologique', note: 'Planète d’horlogers et de miniaturisation poussée, rivale historique d’Ix dans le Landsraad.' },
  { name: 'Ecaz', type: 'Planète sylvestre', note: 'Jungle luxuriante fournissant le jus de sapho, le bois d’elacca sculpté et les narcotiques rares.' },
  { name: 'Poritrin', type: 'Monde agraire', note: 'Ancien refuge des Vagabonds zensunni devenu grand marché agricole et fief de servitude.' },
  { name: 'Ginaz', type: 'Monde marécageux', note: 'Archipels d’entraînement rigoureux où sont formées les plus fines lames de l’Imperium.' },
];

const SOCIAL_STATUSES = [
  'Héritier présomptif d’une lignée noble majeure',
  'Cadet de famille noble sans droit direct de succession',
  'Fils ou fille illégitime dissimulé dans l’entourage d’un seigneur',
  'Pyon (citoyen ouvrier héréditaire sous le joug féodal d’une Maison)',
  'Artisan ou contremaître réputé racheté par contrat au CHOM',
  'Esclave évadé des fosses de chasse de Giedi Prime',
  'Enfant du désert adopté par un sietch fremen',
  'Pupille élevée dans un couvent du Bene Gesserit',
  'Orphelin de guerre recruté pour ses aptitudes computationnelles précoces',
  'Négociant de classe marchande intermédiaire',
];

const FORMATIVE_EVENTS = [
  'A survécu miraculeusement à une tentative d’assassinat au chaumurky lors d’un banquet de fiançailles.',
  'A échappé à une tempête Coriolis de 800 km/h en se terrant sous un affleurement rocheux pendant trois jours.',
  'A abattu en duel rituel au premier sang un duelliste réputé qui avait insulté les armoiries de sa famille.',
  'A découvert par hasard une cellule d’espions rivaux dissimulée parmi le personnel domestique de la demeure.',
  'A été le témoin direct de l’émergence terrifiante de Shai-Hulud engloutissant une moissonneuse à épice de 400 mètres.',
  'A déjoué un chantage financier complexe menaçant de ruiner la quote-part de sa Maison au sein du CHOM.',
  'A subi une épreuve mentale et physique extrême dans une Grande École dont il porte encore la marque indélébile.',
  'A escorté une cargaison clandestine d’épice à travers les blocus de la Guilde au péril de sa vie.',
  'A dû exécuter un ordre impitoyable ordonné par son suzerain pour préserver l’honneur de la Maison.',
  'A été secouru in extremis par des Fremen après le crash d’un ornithoptère abattu dans les Terres Brisées.',
];

const DARK_SECRETS_AND_DEBTS = [
  'Possède des preuves compromettantes sur la trahison d’un haut dignitaire de la cour impériale.',
  'A une dette d’eau sacrée contractée auprès d’un Naib fremen qui peut la réclamer à tout instant.',
  'A dissimulé un membre de sa famille accusé d’hérésie contre la Bible Catholique Orange.',
  'Est traqué en secret par un assassin d’élite dans le cadre d’une vendetta de Kanly ancestrale.',
  'A trempé dans un trafic de contrebande d’épice pour éponger une dette de jeu monumentale sur Kaitain.',
  'Garde en mémoire un code secret chiffré volé aux archives de la Banque de la Guilde Spatiale.',
  'A involontairement causé la disgrâce et l’exil d’un camarade d’enfance loyal.',
  'Est lié par un pacte de sang avec un maître de clan dissident sur une lune éloignée.',
];

const DISTINCTIVE_FEATURES = [
  'Une cicatrice rouge brique laissée par une lacération de fouet au vinencre sur la mâchoire.',
  'Yeux de l’Ibad d’un bleu sombre total, signe d’une saturation prolongée au Mélange.',
  'Un tatouage de diamant noir Suk au centre du front, symbole du Conditionnement Impérial.',
  'Les lèvres délicatement teintées d’un rouge rubis caractéristique, trace de la consommation de jus de sapho.',
  'Une démarche souple et silencieuse de félin, vestige d’un conditionnement prana-bindu poussé.',
  'Un regard d’acier froid et calculateur qui ne cligne presque jamais des yeux lors des négociations.',
  'Une mèche de cheveux blancs apparue après une nuit de terreur dans les sables du désert profond.',
  'Une bague chevalière forgée dans du damacier antique, gravée d’un chiffre héraldique secret.',
];

const TRINKETS = [
  'Un éclat de dent de ver des sables (cristal de krys brut) enveloppé dans un tissu imprégné de cannelle.',
  'Une montre solaire d’Arrakis à affichage d’anomalie gravitationnelle.',
  'Un flacon miniature d’Eau de Vie purifiée scellé par une résine d’Ecaz.',
  'Une broche en forme de scarabée d’or ayant appartenu à une ancêtre de la cour de Corrin.',
  'Une spire de shigavrille argentée conservant l’enregistrement du dernier poème d’un frère disparu.',
  'Un paracompas fremen ouvragé avec des rustines de cuir de ver tanné.',
  'Un dé à vingt faces sculpté dans de la carapace de cymek fossilisée.',
  'Un cylindre de communication chiffré Bene Gesserit avec languettes en braille tactile.',
];

const FIRST_NAMES_MALE = [
  'Tarek', 'Vorian', 'Darien', 'Duncan', 'Gurney', 'Miles', 'Thufir', 'Kaunos', 'Renki',
  'Alik', 'Bionbir', 'Stilgar', 'Liet', 'Oren', 'Karr', 'Zavir', 'Jorin', 'Hadad', 'Pardot',
  'Feyd', 'Rabban', 'Leto', 'Hasimir', 'Wellington', 'Cbaoth', 'Otheym', 'Jamis', 'Shimun',
  'Tark', 'Nafud', 'Kynes', 'Vander', 'Rhombur', 'Camil', 'Soran', 'Elrood', 'Shando'
];

const FIRST_NAMES_FEMALE = [
  'Kara', 'Chani', 'Catriona', 'Elinor', 'Faroula', 'Honora', 'Irulan', 'Jessica', 'Lina',
  'Murbella', 'Peronel', 'Roya', 'Silandra', 'Talaith', 'Wanna', 'Anirul', 'Dalia', 'Siona',
  'Harah', 'Ghanima', 'Alia', 'Margot', 'Lucilla', 'Tessia', 'Wensicia', 'Chalice', 'Kareefa',
  'Tamalane', 'Bellonda', 'Shadout', 'Ramallo', 'Vivia', 'Iriana', 'Savannah', 'Yueh'
];

const FAMILY_NAMES = [
  'Molay', 'Atréides', 'Harkonnen', 'Corrino', 'Vernius', 'Richese', 'Ferreyra', 'Moritani',
  'Hawat', 'Ghurani', 'Kynes', 'Vinal', 'Metzos', 'Terro', 'Antaya', 'Pilru', 'Rund', 'Dinari',
  'Fenring', 'Yueh', 'Mapes', 'Idaho', 'Halleck', 'Teg', 'Novi', 'Varan', 'Ecazi', 'Ginaz',
  'Taraza', 'Nodong', 'Talani', 'Boro', 'Sardau', 'Grumman', 'Corrin', 'Caladan'
];

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateRandomName(gender: 'Homme' | 'Femme' | 'Autre' = 'Femme'): { name: string; firstName: string; lastName: string } {
  const isFemale = gender === 'Femme' || (gender === 'Autre' && Math.random() > 0.5);
  const firstName = getRandomElement(isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE);
  const lastName = getRandomElement(FAMILY_NAMES);
  return {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
  };
}

export function generateBackstory(vocation: VocationType, archetype: string, houseName: string): BackstoryDetails {
  // Planetary bias based on vocation
  let planet = getRandomElement(PLANETS);
  if (vocation === 'Fremen') {
    planet = PLANETS[0]; // Arrakis
  } else if (vocation === 'Bene Gesserit' && Math.random() > 0.5) {
    planet = PLANETS[6]; // Wallach IX
  } else if (vocation === 'Docteur Suk' && Math.random() > 0.6) {
    planet = PLANETS[3]; // Kaitain
  }

  const birthStatus = getRandomElement(SOCIAL_STATUSES);
  const formativeEvent = getRandomElement(FORMATIVE_EVENTS);
  const darkSecretOrDebt = getRandomElement(DARK_SECRETS_AND_DEBTS);
  let distinctiveFeature = getRandomElement(DISTINCTIVE_FEATURES);
  const trinket = getRandomElement(TRINKETS);

  // Vocation-specific distinctive features adjustments
  if (vocation === 'Fremen') {
    distinctiveFeature = 'Yeux de l’Ibad d’un bleu sombre total sans blanc, parfum subtil d’épice et de créosote.';
  } else if (vocation === 'Mentat') {
    distinctiveFeature = 'Lèvres délicatement teintées de rouge rubis par le jus de sapho, regard calculateur perçant.';
  } else if (vocation === 'Docteur Suk') {
    distinctiveFeature = 'Tatouage de diamant noir Suk au centre du front, certifiant le Conditionnement Impérial inviolable.';
  } else if (vocation === 'Bene Gesserit') {
    distinctiveFeature = 'Démarche féline et fluide issue du prana-bindu, port de tête aristocratique et voix posée.';
  }

  const fullNarrative = `Originaire du monde de ${planet.name} (${planet.type}), ce personnage a débuté son existence comme ${birthStatus.toLowerCase()}.
Au cours de ses jeunes années au service de la ${houseName}, sa vie a basculé lors d’un tournant décisif : ${formativeEvent.toLowerCase()}
Aujourd’hui reconnu en tant que ${archetype.toLowerCase()}, il doit composer avec une menace tapie dans l’ombre : ${darkSecretOrDebt.toLowerCase()}
Physiquement, il se distingue par ${distinctiveFeature.toLowerCase()}
Il conserve précieusement avec lui ${trinket.toLowerCase()}, symbole des serments prêtés et des épreuves traversées dans les sables de l’Imperium.`;

  return {
    originPlanet: planet.name,
    birthStatus,
    formativeEvent,
    darkSecretOrDebt,
    distinctiveFeature,
    trinket,
    fullNarrative,
  };
}
