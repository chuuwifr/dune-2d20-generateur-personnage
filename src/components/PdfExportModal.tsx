import React, { useState } from 'react';
import { DuneCharacter } from '../types/dune';
import { exportCharacterToPdf, PdfExportOptions } from '../utils/pdfExport';
import { 
  FileDown, 
  Printer, 
  X, 
  Check, 
  Palette, 
  FileText, 
  Sliders, 
  BookOpen,
  Sparkles,
  Shield
} from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: DuneCharacter;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  character,
}) => {
  const [options, setOptions] = useState<PdfExportOptions>({
    theme: 'sables',
    includeBackstory: true,
    includeRulesCheatSheet: true,
    includeTalentDescriptions: true,
    compactOnePage: false,
  });

  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    setIsExporting(true);
    try {
      exportCharacterToPdf(character, options);
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#15141a] rounded-xl border border-[#523d24] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#382b1c] bg-[#1a1820] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#2b2014] text-[#d4a34b] border border-[#5c4021]">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                Exportation PDF Personnalisable
              </h2>
              <p className="text-xs text-[#a89885]">
                Configurez la mise en page, les thèmes visuels et les annexes pour {character.name || 'votre personnage'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* Visual Theme Selection */}
          <div className="space-y-2">
            <label className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider flex items-center space-x-1.5">
              <Palette className="w-4 h-4 text-[#d4a34b]" />
              <span>1. Thème Visuel du Document :</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'sables', name: 'Sables d’Arrakis', desc: 'Teintes ocre, épice chaude et brun parchemin', border: 'border-[#d4a34b]' },
                { id: 'imperial', name: 'Lion d’Or Impérial', desc: 'Noir obsidienne et or de Kaitain', border: 'border-yellow-600' },
                { id: 'eco', name: 'Éco Imprimable', desc: 'Noir et blanc pur, idéal pour impression papier économique', border: 'border-gray-500' },
              ].map((th) => (
                <div
                  key={th.id}
                  onClick={() => setOptions((prev) => ({ ...prev, theme: th.id as any }))}
                  className={`p-3 rounded-lg border cursor-pointer transition-all space-y-1 ${
                    options.theme === th.id
                      ? `bg-[#241c14] ${th.border} text-[#fae5b5] shadow`
                      : 'bg-[#18161d] border-[#29221b] text-[#8a7a67] hover:border-[#473b2d]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{th.name}</span>
                    {options.theme === th.id && <Check className="w-3.5 h-3.5 text-[#d4a34b]" />}
                  </div>
                  <p className="text-[11px] leading-tight opacity-80">{th.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Document Format */}
          <div className="space-y-2">
            <label className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-[#d4a34b]" />
              <span>2. Format et Nombre de Pages :</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setOptions((prev) => ({ ...prev, compactOnePage: false }))}
                className={`p-3 rounded-lg border cursor-pointer transition-all space-y-1 ${
                  !options.compactOnePage
                    ? 'bg-[#241c14] border-[#d4a34b] text-[#fae5b5] shadow'
                    : 'bg-[#18161d] border-[#29221b] text-[#8a7a67] hover:border-[#473b2d]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Format Officiel Complet (2 Pages)</span>
                  {!options.compactOnePage && <Check className="w-3.5 h-3.5 text-[#d4a34b]" />}
                </div>
                <p className="text-[11px] opacity-80">
                  Page 1 : Statistiques, Compétences, Principes, Traits, Atouts & Talents.<br />
                  Page 2 : Chroniques de l’Imperium, Background enrichi & Aide-mémoire 2d20.
                </p>
              </div>

              <div
                onClick={() => setOptions((prev) => ({ ...prev, compactOnePage: true }))}
                className={`p-3 rounded-lg border cursor-pointer transition-all space-y-1 ${
                  options.compactOnePage
                    ? 'bg-[#241c14] border-[#d4a34b] text-[#fae5b5] shadow'
                    : 'bg-[#18161d] border-[#29221b] text-[#8a7a67] hover:border-[#473b2d]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Format Synthèse de Combat (1 Page)</span>
                  {options.compactOnePage && <Check className="w-3.5 h-3.5 text-[#d4a34b]" />}
                </div>
                <p className="text-[11px] opacity-80">
                  Page 1 uniquement, parfaite pour garder sur la table de jeu durant les conflits et escarmouches.
                </p>
              </div>
            </div>
          </div>

          {/* Content Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-[#d4a34b]" />
              <span>3. Options de Contenu Inclus :</span>
            </label>
            <div className="bg-[#1b1922] p-3.5 rounded-lg border border-[#332b20] space-y-2.5">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeTalentDescriptions}
                  onChange={(e) => setOptions((prev) => ({ ...prev, includeTalentDescriptions: e.target.checked }))}
                  className="accent-[#d4a34b] w-4 h-4"
                />
                <span className="text-xs text-[#fae5b5]">
                  Inclure la description mécanique complète des Talents & Disciplines
                </span>
              </label>

              {!options.compactOnePage && (
                <>
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeBackstory}
                      onChange={(e) => setOptions((prev) => ({ ...prev, includeBackstory: e.target.checked }))}
                      className="accent-[#d4a34b] w-4 h-4"
                    />
                    <span className="text-xs text-[#fae5b5]">
                      Inclure l’historique généré, les secrets et le récit biographique (Page 2)
                    </span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeRulesCheatSheet}
                      onChange={(e) => setOptions((prev) => ({ ...prev, includeRulesCheatSheet: e.target.checked }))}
                      className="accent-[#d4a34b] w-4 h-4"
                    />
                    <span className="text-xs text-[#fae5b5]">
                      Inclure le mémo des règles 2d20 (Seuil, Réussite critique, Impulsion, Conflits) en bas de page
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Preview Box */}
          <div className="bg-[#100f13] p-3 rounded-lg border border-[#2b241c] text-xs text-[#a89885] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#d4a34b]" />
              <span>
                Document prêt : <strong>{options.compactOnePage ? '1 Page A4' : '2 Pages A4'}</strong> • Thème : <em>{options.theme.toUpperCase()}</em>
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#fae5b5]">
              {character.name || 'personnage'}_dune_2d20.pdf
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#382b1c] bg-[#1a1820] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleNativePrint}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#291f14] hover:bg-[#3b2b1a] text-[#d4a34b] border border-[#5a4224] text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / Aperçu Navigateur</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs text-[#a89885] hover:text-white"
            >
              Fermer
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#c99738] to-[#9e6224] hover:from-[#d9a84a] hover:to-[#b3702a] text-black font-extrabold text-xs sm:text-sm flex items-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExporting ? 'Génération...' : 'Télécharger le PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
