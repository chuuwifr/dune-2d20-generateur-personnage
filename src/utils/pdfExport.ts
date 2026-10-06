import { jsPDF } from 'jspdf';
import { DuneCharacter, PrincipleName, SkillName } from '../types/dune';

export interface PdfExportOptions {
  theme: 'sables' | 'imperial' | 'eco';
  includeBackstory: boolean;
  includeRulesCheatSheet: boolean;
  includeTalentDescriptions: boolean;
  compactOnePage: boolean;
}

export function exportCharacterToPdf(character: DuneCharacter, options: PdfExportOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isEco = options.theme === 'eco';
  const isImperial = options.theme === 'imperial';

  // Palette
  const colors = {
    bg: isEco ? '#ffffff' : (isImperial ? '#0c0d12' : '#141210'),
    headerBg: isEco ? '#f0f0f0' : (isImperial ? '#1e212b' : '#2d2217'),
    cardBg: isEco ? '#fafafa' : (isImperial ? '#141722' : '#1f1a14'),
    gold: isEco ? '#444444' : '#c99738',
    spice: isEco ? '#222222' : '#d47b2c',
    textMain: isEco ? '#111111' : '#f5ebd9',
    textMuted: isEco ? '#555555' : '#a89885',
    border: isEco ? '#cccccc' : (isImperial ? '#3d3420' : '#453524'),
  };

  // Helper for drawing styled boxes
  const drawBox = (x: number, y: number, w: number, h: number, title?: string) => {
    doc.setFillColor(colors.cardBg);
    doc.setDrawColor(colors.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 1.5, 1.5, 'FD');

    if (title) {
      doc.setFillColor(colors.headerBg);
      doc.roundedRect(x, y, w, 6, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(colors.gold);
      doc.text(title.toUpperCase(), x + 3, y + 4.2);
    }
  };

  // ===================== PAGE 1 =====================
  // Background fill
  if (!isEco) {
    doc.setFillColor(colors.bg);
    doc.rect(0, 0, 210, 297, 'F');
  }

  // Header Banner
  doc.setFillColor(colors.headerBg);
  doc.setDrawColor(colors.gold);
  doc.setLineWidth(0.6);
  doc.rect(10, 10, 190, 24, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(colors.gold);
  doc.text('DUNE : AVENTURES DANS L’IMPERIUM', 15, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textMuted);
  doc.text('FEUILLE DE PERSONNAGE OFFICIELLE (SYSTÈME 2d20)', 15, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.spice);
  doc.text(`MAISON : ${character.house.name.toUpperCase()}`, 135, 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textMuted);
  doc.text(`RÈGNE / TYPE : ${character.house.type}`, 135, 23);

  // Identity Grid
  let y = 38;
  drawBox(10, y, 190, 24, 'Identité & Allégeance');
  doc.setFontSize(8.5);

  const col1 = 14;
  const col2 = 75;
  const col3 = 135;

  doc.setTextColor(colors.textMuted);
  doc.text('Nom :', col1, y + 11);
  doc.setTextColor(colors.textMain);
  doc.setFont('helvetica', 'bold');
  doc.text(character.name || 'Sans Nom', col1 + 12, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textMuted);
  doc.text('Archétype :', col1, y + 17);
  doc.setTextColor(colors.textMain);
  doc.text(character.archetype, col1 + 19, y + 17);

  doc.setTextColor(colors.textMuted);
  doc.text('Vocation :', col2, y + 11);
  doc.setTextColor(colors.textMain);
  doc.text(character.vocation, col2 + 17, y + 11);

  doc.setTextColor(colors.textMuted);
  doc.text('Monde natal :', col2, y + 17);
  doc.setTextColor(colors.textMain);
  doc.text(character.backstory.originPlanet || character.house.homeworld, col2 + 22, y + 17);

  doc.setTextColor(colors.textMuted);
  doc.text('Détermination :', col3, y + 11);
  doc.setTextColor(colors.gold);
  doc.setFont('helvetica', 'bold');
  doc.text(`${character.determination} / 3`, col3 + 24, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textMuted);
  doc.text('Points de progression :', col3, y + 17);
  doc.setTextColor(colors.textMain);
  doc.text(`${character.progressionPoints}`, col3 + 34, y + 17);

  // SECTION: TRAITS (Gestion automatique)
  y += 28;
  drawBox(10, y, 190, 16, 'Traits Personnels & Factions (Gestion Automatique)');
  doc.setFontSize(8);
  let traitX = 14;
  character.traits.forEach((t) => {
    const traitText = `[${t.type.toUpperCase()}] ${t.name}`;
    const tw = doc.getTextWidth(traitText) + 4;
    doc.setFillColor(isEco ? '#e5e5e5' : '#2b2319');
    doc.setDrawColor(colors.border);
    doc.roundedRect(traitX, y + 8, tw, 5.5, 1, 1, 'FD');
    doc.setTextColor(colors.gold);
    doc.setFont('helvetica', 'bold');
    doc.text(traitText, traitX + 2, y + 11.8);
    traitX += tw + 4;
  });

  // SECTION: COMPÉTENCES & PRINCIPES
  y += 20;
  const leftW = 92;
  const rightW = 94;
  const colGap = 4;

  // COMPÉTENCES (Gauche)
  drawBox(10, y, leftW, 64, 'Compétences (4 à 8)');
  const skillNames: SkillName[] = ['Analyse', 'Combat', 'Discipline', 'Mobilité', 'Rhétorique'];
  let skillY = y + 11;

  skillNames.forEach((sName) => {
    const s = character.skills[sName];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(colors.textMain);
    doc.text(sName, 14, skillY);

    // Value box
    doc.setFillColor(isEco ? '#e0e0e0' : '#332719');
    doc.setDrawColor(colors.gold);
    doc.rect(48, skillY - 4, 8, 5.5, 'FD');
    doc.setTextColor(colors.gold);
    doc.text(String(s.value), 51, skillY);

    // Specs
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.textMuted);
    const specsStr = s.specializations && s.specializations.length > 0 ? s.specializations.join(', ') : '—';
    const splitSpecs = doc.splitTextToSize(specsStr, 40);
    doc.text(splitSpecs[0], 59, skillY);

    skillY += 10.5;
  });

  // PRINCIPES & MAXIMES (Droite)
  drawBox(10 + leftW + colGap, y, rightW, 64, 'Principes & Maximes (8, 7, 6, 5, 4)');
  const principleNames: PrincipleName[] = ['Devoir', 'Domination', 'Foi', 'Justice', 'Vérité'];
  let princY = y + 11;

  principleNames.forEach((pName) => {
    const p = character.principles[pName];
    const hasMaxime = p.value >= 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colors.textMain);
    doc.text(pName, 110, princY);

    // Score box
    doc.setFillColor(isEco ? '#e0e0e0' : (hasMaxime ? '#382a17' : '#222222'));
    doc.setDrawColor(hasMaxime ? colors.gold : colors.border);
    doc.rect(130, princY - 4, 8, 5.5, 'FD');
    doc.setTextColor(hasMaxime ? colors.gold : colors.textMuted);
    doc.text(String(p.value), 133, princY);

    // Maxime
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(hasMaxime ? colors.textMain : colors.textMuted);
    const maxText = p.maxime ? `« ${p.maxime} »` : '(Aucune maxime requise)';
    const splitMax = doc.splitTextToSize(maxText, 56);
    doc.text(splitMax[0], 141, princY);

    princY += 10.5;
  });

  // SECTION: TALENTS
  y += 68;
  drawBox(10, y, 190, 52, 'Talents & Disciplines (3)');
  let talY = y + 10;
  character.talents.forEach((tal, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colors.gold);
    doc.text(`${idx + 1}. ${tal.name}`, 14, talY);

    if (tal.category) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(colors.spice);
      doc.text(`[${tal.category}]`, 75, talY);
    }

    if (options.includeTalentDescriptions) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(colors.textMain);
      const splitDesc = doc.splitTextToSize(tal.description, 180);
      doc.text(splitDesc.slice(0, 2), 14, talY + 4.5);
    }
    talY += 13.5;
  });

  // SECTION: ATOUTS
  y += 56;
  drawBox(10, y, 190, 42, 'Atouts & Ressources (Armes, Protections, Outils, Renseignements)');
  let astY = y + 10;
  character.assets.forEach((ast, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colors.gold);
    doc.text(`${idx + 1}. ${ast.name}`, 14, astY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.spice);
    doc.text(`Qualité ${ast.quality} | ${ast.type.toUpperCase()} | ${ast.keywords.join(', ')}`, 80, astY);

    if (ast.description) {
      doc.setTextColor(colors.textMuted);
      const splitDesc = doc.splitTextToSize(ast.description, 180);
      doc.text(splitDesc[0], 14, astY + 4.5);
    }
    astY += 10.5;
  });

  // Footer Page 1
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(colors.textMuted);
  doc.text('Dune 2d20 © Modiphius & Legendary — Généré via l’Assistant Officiel Arrakis', 10, 290);
  doc.text('Page 1 / 2', 190, 290);

  // ===================== PAGE 2 =====================
  if (!options.compactOnePage) {
    doc.addPage();

    if (!isEco) {
      doc.setFillColor(colors.bg);
      doc.rect(0, 0, 210, 297, 'F');
    }

    // Header 2
    doc.setFillColor(colors.headerBg);
    doc.setDrawColor(colors.gold);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 14, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colors.gold);
    doc.text(`HISTORIQUE, AMBITION & CODEX — ${character.name.toUpperCase()}`, 15, 19);

    let p2Y = 28;

    // AMBITION & MOTEUR
    drawBox(10, p2Y, 190, 22, 'Ambition Majeure (Liée au Principe Supérieur)');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(colors.spice);
    doc.text(`Objectif ultime : ${character.ambition || 'À définir'}`, 14, p2Y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.textMuted);
    doc.text('Chaque acte mené en jeu qui fait progresser cette ambition rapporte 1 à 3 points de progression.', 14, p2Y + 17);

    // HISTORIQUE GÉNÉRÉ
    p2Y += 26;
    drawBox(10, p2Y, 190, 85, 'Détails du Background & Chroniques Personnelles');

    doc.setFontSize(8);
    const b = character.backstory;

    doc.setTextColor(colors.gold);
    doc.setFont('helvetica', 'bold');
    doc.text('Origine & Statut :', 14, p2Y + 11);
    doc.setTextColor(colors.textMain);
    doc.setFont('helvetica', 'normal');
    doc.text(`${b.originPlanet} — ${b.birthStatus}`, 45, p2Y + 11);

    doc.setTextColor(colors.gold);
    doc.setFont('helvetica', 'bold');
    doc.text('Événement formateur :', 14, p2Y + 19);
    doc.setTextColor(colors.textMain);
    doc.setFont('helvetica', 'normal');
    const splitFormative = doc.splitTextToSize(b.formativeEvent, 135);
    doc.text(splitFormative, 52, p2Y + 19);

    doc.setTextColor(colors.gold);
    doc.setFont('helvetica', 'bold');
    doc.text('Secret inavouable / Dette :', 14, p2Y + 28);
    doc.setTextColor(colors.textMain);
    doc.setFont('helvetica', 'normal');
    const splitSecret = doc.splitTextToSize(b.darkSecretOrDebt, 135);
    doc.text(splitSecret, 55, p2Y + 28);

    doc.setTextColor(colors.gold);
    doc.setFont('helvetica', 'bold');
    doc.text('Signe distinctif :', 14, p2Y + 37);
    doc.setTextColor(colors.textMain);
    doc.setFont('helvetica', 'normal');
    const splitFeature = doc.splitTextToSize(b.distinctiveFeature, 135);
    doc.text(splitFeature, 45, p2Y + 37);

    doc.setTextColor(colors.gold);
    doc.setFont('helvetica', 'bold');
    doc.text('Objet fétiche / Souvenir :', 14, p2Y + 46);
    doc.setTextColor(colors.textMain);
    doc.setFont('helvetica', 'normal');
    doc.text(b.trinket, 55, p2Y + 46);

    doc.setTextColor(colors.gold);
    doc.setFont('helvetica', 'bold');
    doc.text('Récit biographique complet :', 14, p2Y + 55);
    doc.setTextColor(colors.textMain);
    doc.setFont('helvetica', 'normal');
    const splitNarrative = doc.splitTextToSize(b.fullNarrative || 'Aucun récit renseigné.', 180);
    doc.text(splitNarrative.slice(0, 7), 14, p2Y + 61);

    // FICHE DE RÈGLES RAPIDE (2D20 MEMO)
    if (options.includeRulesCheatSheet) {
      p2Y += 90;
      drawBox(10, p2Y, 190, 80, 'Aide de Jeu Rapide : Système 2d20 de Dune');

      doc.setFontSize(7.5);
      doc.setTextColor(colors.gold);
      doc.setFont('helvetica', 'bold');
      doc.text('1. TEST DE COMPÉTENCE', 14, p2Y + 11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.textMain);
      doc.text('• Seuil de Réussite (SR) = Compétence (4-8) + Principe (4-8).', 14, p2Y + 16);
      doc.text('• Lancez 2d20. Tout dé <= SR donne 1 réussite. Un 1 donne une Réussite Critique (2 réussites).', 14, p2Y + 21);
      doc.text('• Si spécialisation applicable : tout dé <= Compétence devient Critique (2 réussites).', 14, p2Y + 26);
      doc.text('• Tout résultat de 20 engendre 1 Complication (pénalité ou incident).', 14, p2Y + 31);

      doc.setTextColor(colors.gold);
      doc.setFont('helvetica', 'bold');
      doc.text('2. GESTION DES RESSOURCES', 105, p2Y + 11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.textMain);
      doc.text('• Impulsion : chaque réussite au-delà de la difficulté rapporte 1 Impulsion (max 6 en réserve).', 105, p2Y + 16);
      doc.text('• Menace : ressource du MJ pour compliquer les scènes ou achetée par les PJ pour des dés.', 105, p2Y + 21);
      doc.text('• Détermination (max 3) : utilisable si la maxime du principe soutient l’action (1 auto ou relance).', 105, p2Y + 26);
      doc.text('• Bafouer un principe : gagner 1 Détermination mais biffer la maxime jusqu’à rédemption.', 105, p2Y + 31);

      doc.setTextColor(colors.gold);
      doc.setFont('helvetica', 'bold');
      doc.text('3. GESTION DES TRAITS & ATOUTS', 14, p2Y + 41);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.textMain);
      doc.text('• Un trait pertinent rend une action possible/impossible ou ajuste la Difficulté (+1 / -1).', 14, p2Y + 46);
      doc.text('• Les PJ peuvent dépenser 1 Impulsion pour emprunter un trait de leur Maison durant la scène.', 14, p2Y + 51);
      doc.text('• Duel & Conflit : déplacer un atout = diff. 2. Attaquer = test en opposition (tâche étendue).', 14, p2Y + 56);
      doc.text('• Survivre à la défaite : 1 fois/scène, dépenser 1 Impulsion + 1 complication pour rester debout.', 14, p2Y + 61);
      doc.text('• Interaction laser + bouclier Holtzman = explosion sub-nucléaire mutuelle interdite.', 14, p2Y + 66);
    }

    // Footer Page 2
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(colors.textMuted);
    doc.text('Dune 2d20 © Modiphius & Legendary — Version Française Arkhane Asylum', 10, 290);
    doc.text('Page 2 / 2', 190, 290);
  }

  // Save the PDF
  const safeFilename = `${(character.name || 'personnage').toLowerCase().replace(/[^a-z0-9]/g, '_')}_dune_2d20.pdf`;
  doc.save(safeFilename);
}
