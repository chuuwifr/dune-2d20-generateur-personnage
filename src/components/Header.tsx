import React from 'react';
import { 
  Scroll, 
  Dices, 
  Sparkles, 
  FileDown, 
  BookOpen, 
  Wand2, 
  Compass,
  Users,
  Shield
} from 'lucide-react';

interface HeaderProps {
  currentView: 'wizard' | 'sheet' | 'generator' | 'presets';
  setCurrentView: (view: 'wizard' | 'sheet' | 'generator' | 'presets') => void;
  openDiceModal: () => void;
  openPdfModal: () => void;
  openRulesModal: () => void;
  openHouseModal?: () => void;
  characterName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  openDiceModal,
  openPdfModal,
  openRulesModal,
  openHouseModal,
  characterName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0f1015]/95 backdrop-blur border-b border-[#3d3120] shadow-xl no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('sheet')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-[#d4a34b] via-[#8c4e1a] to-[#2a1b0c] p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-[#121115] rounded-[7px] flex items-center justify-center border border-[#d4a34b]/30">
                <Compass className="w-6 h-6 text-[#d4a34b]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-cinzel text-lg sm:text-xl font-bold tracking-widest text-[#f5ebd9]">
                  DUNE
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#c99738]/20 text-[#d4a34b] font-mono border border-[#c99738]/30 font-semibold">
                  2d20
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#a89885] tracking-wider uppercase font-sans">
                Assistant de Création & Gestionnaire de Traits
              </p>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setCurrentView('sheet')}
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
                currentView === 'sheet'
                  ? 'bg-[#c99738]/20 text-[#fae5b5] border border-[#c99738]/40 shadow-inner'
                  : 'text-[#c2b49d] hover:bg-[#1f1b15] hover:text-[#fae5b5]'
              }`}
            >
              <Scroll className="w-4 h-4 text-[#d4a34b]" />
              <span>Fiche Personnage</span>
            </button>

            <button
              onClick={() => setCurrentView('wizard')}
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
                currentView === 'wizard'
                  ? 'bg-[#c99738]/20 text-[#fae5b5] border border-[#c99738]/40 shadow-inner'
                  : 'text-[#c2b49d] hover:bg-[#1f1b15] hover:text-[#fae5b5]'
              }`}
            >
              <Wand2 className="w-4 h-4 text-[#d4a34b]" />
              <span>Créateur Pas-à-Pas</span>
            </button>

            <button
              onClick={() => setCurrentView('generator')}
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
                currentView === 'generator'
                  ? 'bg-[#c99738]/20 text-[#fae5b5] border border-[#c99738]/40 shadow-inner'
                  : 'text-[#c2b49d] hover:bg-[#1f1b15] hover:text-[#fae5b5]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#d4a34b]" />
              <span>Générateur Background</span>
            </button>

            <button
              onClick={() => setCurrentView('presets')}
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
                currentView === 'presets'
                  ? 'bg-[#c99738]/20 text-[#fae5b5] border border-[#c99738]/40 shadow-inner'
                  : 'text-[#c2b49d] hover:bg-[#1f1b15] hover:text-[#fae5b5]'
              }`}
            >
              <Users className="w-4 h-4 text-[#d4a34b]" />
              <span>Prétirés & Codex</span>
            </button>

            {openHouseModal && (
              <button
                onClick={openHouseModal}
                className="px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 text-[#c2b49d] hover:bg-[#1f1b15] hover:text-[#fae5b5]"
                title="Gérer ou personnaliser votre Maison Noble"
              >
                <Shield className="w-4 h-4 text-[#d4a34b]" />
                <span>Maisons Nobles</span>
              </button>
            )}
          </nav>

          {/* Quick Actions Right */}
          <div className="flex items-center space-x-2">
            <button
              onClick={openDiceModal}
              title="Lancer un test 2d20"
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#261f17] hover:bg-[#382b1c] text-[#fae5b5] border border-[#c99738]/40 text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-md group"
            >
              <Dices className="w-4 h-4 text-[#d4a34b] group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline font-mono font-medium">Test 2d20</span>
            </button>

            <button
              onClick={openRulesModal}
              title="Aide-mémoire des règles"
              className="p-1.5 sm:p-2 rounded-lg bg-[#181920] hover:bg-[#252834] text-[#c2b49d] hover:text-white border border-gray-700/60 transition-all"
            >
              <BookOpen className="w-4 h-4 text-[#a89885]" />
            </button>

            <button
              onClick={openPdfModal}
              title="Exporter en PDF personnalisé"
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-[#c99738] to-[#9e6224] hover:from-[#d9a84a] hover:to-[#b3702a] text-[#120f0a] font-semibold text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-lg hover:shadow-orange-950/40"
            >
              <FileDown className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-[#292218] overflow-x-auto space-x-1">
          <button
            onClick={() => setCurrentView('sheet')}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              currentView === 'sheet' ? 'bg-[#c99738]/20 text-[#fae5b5] font-semibold' : 'text-[#a89885]'
            }`}
          >
            Fiche
          </button>
          <button
            onClick={() => setCurrentView('wizard')}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              currentView === 'wizard' ? 'bg-[#c99738]/20 text-[#fae5b5] font-semibold' : 'text-[#a89885]'
            }`}
          >
            Créateur
          </button>
          <button
            onClick={() => setCurrentView('generator')}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              currentView === 'generator' ? 'bg-[#c99738]/20 text-[#fae5b5] font-semibold' : 'text-[#a89885]'
            }`}
          >
            Background
          </button>
          <button
            onClick={() => setCurrentView('presets')}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              currentView === 'presets' ? 'bg-[#c99738]/20 text-[#fae5b5] font-semibold' : 'text-[#a89885]'
            }`}
          >
            Prétirés
          </button>
          {openHouseModal && (
            <button
              onClick={openHouseModal}
              className="px-2.5 py-1 rounded text-xs whitespace-nowrap text-[#a89885] hover:text-[#fae5b5]"
            >
              Maisons
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
