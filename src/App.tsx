import React, { useState } from 'react';
import { DuneCharacter, SkillName, PrincipleName } from './types/dune';
import { PRESET_CHARACTERS } from './data/duneData';
import { Header } from './components/Header';
import { CharacterSheet } from './components/CharacterSheet';
import { CreationWizard } from './components/CreationWizard';
import { BackgroundGeneratorModal } from './components/BackgroundGeneratorModal';
import { DiceSimulatorModal } from './components/DiceSimulatorModal';
import { PdfExportModal } from './components/PdfExportModal';
import { RulesCheatSheetModal } from './components/RulesCheatSheetModal';
import { PresetsModal } from './components/PresetsModal';
import { GeminiChatbotModal } from './components/GeminiChatbotModal';
import { 
  Sparkles, 
  Dices, 
  Compass, 
  FileDown, 
  BookOpen, 
  Scroll, 
  Wand2, 
  Shield,
  Bot
} from 'lucide-react';

export default function App() {
  const [character, setCharacter] = useState<DuneCharacter>(() => PRESET_CHARACTERS[0]); // Starts with Kara Molay
  const [currentView, setCurrentView] = useState<'sheet' | 'wizard' | 'generator' | 'presets'>('sheet');

  // Modals state
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [diceModalSkill, setDiceModalSkill] = useState<SkillName>('Combat');
  const [diceModalPrinciple, setDiceModalPrinciple] = useState<PrincipleName>('Devoir');

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isBackstoryModalOpen, setIsBackstoryModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);

  // Chatbot modal state
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);

  // Quick dice test trigger from character sheet
  const handleOpenDiceTest = (skill?: SkillName, principle?: PrincipleName) => {
    if (skill) setDiceModalSkill(skill);
    if (principle) setDiceModalPrinciple(principle);
    setIsDiceModalOpen(true);
  };

  // Open Chatbot with optional pre-filled prompt (e.g. for generating names)
  const handleOpenChatbot = (prompt?: string) => {
    setChatInitialPrompt(prompt);
    setIsChatModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e0d6c3] flex flex-col font-sans selection:bg-[#c99738]/30 selection:text-[#fae5b5]">
      
      {/* Top Header */}
      <Header
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'generator') {
            setIsBackstoryModalOpen(true);
          } else if (view === 'presets') {
            setIsPresetsModalOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        openDiceModal={() => handleOpenDiceTest()}
        openPdfModal={() => setIsPdfModalOpen(true)}
        openRulesModal={() => setIsRulesModalOpen(true)}
        openChatModal={() => handleOpenChatbot()}
        characterName={character.name}
      />

      {/* Thematic Quote Banner */}
      <div className="bg-[#121115] border-b border-[#2b241c] py-2 px-4 text-center no-print">
        <p className="text-[11px] sm:text-xs text-[#a89885] italic max-w-4xl mx-auto font-sans">
          « Arrakis enseigne l'attitude du couteau : couper ce qui est incomplet et dire : "Maintenant, c'est complet, car cela s'achève ici." »
          <span className="text-[#d4a34b] font-cinzel font-semibold not-italic ml-2">— Muad'Dib</span>
        </p>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'sheet' && (
          <CharacterSheet
            character={character}
            setCharacter={setCharacter}
            onOpenDiceTest={handleOpenDiceTest}
            onOpenBackstoryGen={() => setIsBackstoryModalOpen(true)}
            onOpenWizard={() => setCurrentView('wizard')}
            onOpenChatbot={handleOpenChatbot}
          />
        )}

        {currentView === 'wizard' && (
          <CreationWizard
            character={character}
            setCharacter={setCharacter}
            onFinishWizard={() => setCurrentView('sheet')}
            onOpenBackstoryGen={() => setIsBackstoryModalOpen(true)}
            onOpenChatbot={handleOpenChatbot}
          />
        )}
      </main>

      {/* Printable Sheet View (Hidden on screen, activated when user triggers window.print()) */}
      <div className="hidden print-only p-8 text-black bg-white space-y-6">
        <div className="border-b-2 border-black pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-serif uppercase tracking-widest">DUNE : AVENTURES DANS L'IMPERIUM</h1>
            <h2 className="text-sm font-semibold text-gray-700">FEUILLE DE PERSONNAGE (SYSTÈME 2D20)</h2>
          </div>
          <div className="text-right text-xs">
            <div>Maison : <strong>{character.house.name}</strong> ({character.house.type})</div>
            <div>Monde : {character.backstory.originPlanet}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border p-3 text-xs">
          <div><strong>Nom :</strong> {character.name}</div>
          <div><strong>Archétype :</strong> {character.archetype}</div>
          <div><strong>Vocation :</strong> {character.vocation}</div>
          <div className="col-span-3"><strong>Concept :</strong> {character.concept}</div>
          <div className="col-span-3"><strong>Ambition :</strong> {character.ambition}</div>
        </div>

        <div className="border p-3 text-xs space-y-1">
          <strong>TRAITS PERSONNELS & REPUTATION :</strong>
          <div className="flex flex-wrap gap-2 pt-1">
            {character.traits.map((t) => (
              <span key={t.id} className="border px-2 py-0.5 rounded font-mono font-bold">
                [{t.type.toUpperCase()}] {t.name}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="border p-3 space-y-2">
            <strong>COMPÉTENCES (4 à 8) :</strong>
            {Object.values(character.skills).map((s) => (
              <div key={s.name} className="flex justify-between border-b pb-1">
                <span>{s.name} {s.specializations.length > 0 ? `(${s.specializations.join(', ')})` : ''}</span>
                <strong className="text-sm font-mono">{s.value}</strong>
              </div>
            ))}
          </div>

          <div className="border p-3 space-y-2">
            <strong>PRINCIPES & MAXIMES (8, 7, 6, 5, 4) :</strong>
            {Object.values(character.principles).map((p) => (
              <div key={p.name} className="border-b pb-1">
                <div className="flex justify-between">
                  <span>{p.name}</span>
                  <strong className="text-sm font-mono">{p.value}</strong>
                </div>
                {p.maxime && <div className="italic text-[10px] text-gray-700">« {p.maxime} »</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="border p-3 space-y-2">
            <strong>TALENTS (3) :</strong>
            {character.talents.map((t, i) => (
              <div key={i} className="border-b pb-1">
                <strong>{t.name}</strong>
                <p className="text-[10px] text-gray-700">{t.description}</p>
              </div>
            ))}
          </div>

          <div className="border p-3 space-y-2">
            <strong>ATOUTS (3+) :</strong>
            {character.assets.map((a, i) => (
              <div key={i} className="border-b pb-1">
                <div className="flex justify-between">
                  <strong>{a.name}</strong>
                  <span>Q{a.quality} • {a.type}</span>
                </div>
                <div className="text-[10px] text-gray-600">{a.keywords.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="page-break pt-4 border-t border-black text-xs space-y-2">
          <strong>CHRONIQUES ET HISTORIQUE DU PERSONNAGE :</strong>
          <p className="leading-relaxed whitespace-pre-line text-gray-800">
            {character.backstory.fullNarrative}
          </p>
          <div className="pt-2 text-[10px] text-gray-600">
            Détails : {character.backstory.formativeEvent} • Secret : {character.backstory.darkSecretOrDebt} • Signe : {character.backstory.distinctiveFeature}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#292218] bg-[#0c0d12] py-4 text-center text-xs text-[#8a7a67] no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Dune : Aventures dans l’Imperium — Système 2d20 de Modiphius & Arkhane Asylum.
          </p>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsRulesModalOpen(true)} className="hover:text-[#d4a34b] underline">
              Règles 2d20
            </button>
            <button onClick={() => setIsPdfModalOpen(true)} className="hover:text-[#d4a34b] underline">
              Télécharger PDF
            </button>
            <button onClick={() => handleOpenDiceTest()} className="hover:text-[#d4a34b] underline">
              Lancer les dés
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DiceSimulatorModal
        isOpen={isDiceModalOpen}
        onClose={() => setIsDiceModalOpen(false)}
        character={character}
        initialSkill={diceModalSkill}
        initialPrinciple={diceModalPrinciple}
      />

      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        character={character}
      />

      <RulesCheatSheetModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      <BackgroundGeneratorModal
        isOpen={isBackstoryModalOpen}
        onClose={() => setIsBackstoryModalOpen(false)}
        character={character}
        setCharacter={setCharacter}
      />

      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSelectCharacter={(newChar) => {
          setCharacter(newChar);
          setCurrentView('sheet');
        }}
      />

      <GeminiChatbotModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        character={character}
        setCharacter={setCharacter}
        initialPrompt={chatInitialPrompt}
      />
    </div>
  );
}
