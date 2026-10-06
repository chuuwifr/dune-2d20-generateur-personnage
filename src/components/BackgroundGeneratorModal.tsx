import React, { useState } from 'react';
import { BackstoryDetails, DuneCharacter, VocationType } from '../types/dune';
import { 
  generateBackstory, 
  generateRandomName 
} from '../utils/backgroundGenerator';
import { 
  Sparkles, 
  Dices, 
  Check, 
  Copy, 
  RefreshCw, 
  X, 
  Globe, 
  User, 
  Award, 
  ShieldAlert, 
  Eye, 
  KeyRound,
  Bot
} from 'lucide-react';

interface BackgroundGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: DuneCharacter;
  setCharacter: React.Dispatch<React.SetStateAction<DuneCharacter>>;
}

export const BackgroundGeneratorModal: React.FC<BackgroundGeneratorModalProps> = ({
  isOpen,
  onClose,
  character,
  setCharacter,
}) => {
  const [currentBackstory, setCurrentBackstory] = useState<BackstoryDetails>(() => 
    character.backstory.fullNarrative
      ? character.backstory
      : generateBackstory(character.vocation, character.archetype, character.house.name)
  );

  const [suggestedName, setSuggestedName] = useState(() => character.name || generateRandomName('Femme').name);
  const [copied, setCopied] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Re-generate everything procedurally
  const handleGenerateAll = () => {
    const newBg = generateBackstory(character.vocation, character.archetype, character.house.name);
    const newName = generateRandomName(character.gender === 'Homme' ? 'Homme' : 'Femme').name;
    setCurrentBackstory(newBg);
    setSuggestedName(newName);
    setCopied(false);
  };

  // Re-generate only one aspect
  const handleRegenerateField = (field: keyof BackstoryDetails) => {
    const fresh = generateBackstory(character.vocation, character.archetype, character.house.name);
    setCurrentBackstory((prev) => {
      const updated = {
        ...prev,
        [field]: fresh[field],
      };
      // re-build narrative
      updated.fullNarrative = `Originaire du monde de ${updated.originPlanet}, ce personnage a débuté son existence comme ${updated.birthStatus.toLowerCase()}.
Au cours de ses jeunes années au service de la ${character.house.name}, sa vie a basculé lors d’un tournant décisif : ${updated.formativeEvent.toLowerCase()}
Aujourd’hui reconnu en tant que ${character.archetype.toLowerCase()}, il doit composer avec une menace tapie dans l’ombre : ${updated.darkSecretOrDebt.toLowerCase()}
Physiquement, il se distingue par ${updated.distinctiveFeature.toLowerCase()}
Il conserve précieusement avec lui ${updated.trinket.toLowerCase()}, symbole des serments prêtés et des épreuves traversées dans les sables de l’Imperium.`;
      return updated;
    });
  };

  // Optional AI enrichment using Gemini API via server route
  const handleGenerateAiLore = async () => {
    try {
      setIsAiGenerating(true);
      setAiError(null);

      const prompt = `Tu es un archiviste impérial et auteur de l'univers de Frank Herbert pour le jeu de rôle Dune : Aventures dans l'Imperium.
Rédige un historique immersif, poétique et sombre pour ce personnage :
- Nom : ${character.name || suggestedName}
- Vocation : ${character.vocation}
- Archétype : ${character.archetype}
- Maison : ${character.house.name} (${character.house.reputationTrait})
- Monde d'origine : ${currentBackstory.originPlanet}
- Statut : ${currentBackstory.birthStatus}
- Événement formateur : ${currentBackstory.formativeEvent}
- Secret / Dette : ${currentBackstory.darkSecretOrDebt}

Fournis un texte narratif en français d'environ 3 à 4 paragraphes, empreint du style littéraire de Frank Herbert (faufreluches, épice, dangers, maximes impériales).`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', text: prompt }],
          systemInstruction: "Tu es un archiviste officiel de l'univers de Dune (Frank Herbert). Tu rédiges avec le style épique, littéraire et solennel des chroniques de la Princesse Irulan.",
          model: 'gemini-3.5-flash',
          temperature: 0.85,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur de génération');
      }

      const data = await res.json();
      const text = data.reply || '';
      if (text) {
        setCurrentBackstory((prev) => ({
          ...prev,
          fullNarrative: text.trim(),
        }));
      }
    } catch (err: any) {
      console.warn('Erreur lors de la génération avec le serveur:', err);
      setAiError('Génération locale appliquée.');
      handleGenerateAll();
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Apply to character sheet
  const handleApply = () => {
    setCharacter((prev) => ({
      ...prev,
      name: prev.name || suggestedName,
      backstory: currentBackstory,
    }));
    onClose();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(currentBackstory.fullNarrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#15141a] rounded-xl border border-[#523d24] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#382b1c] bg-[#1a1820] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#2b2014] text-[#d4a34b] border border-[#5c4021]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                Générateur d'Historique Aléatoire (Arrakis Codex)
              </h2>
              <p className="text-xs text-[#a89885]">
                Composé pour {character.archetype} ({character.vocation}) au service de la {character.house.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e1b24] p-3 rounded-lg border border-[#382b1c]">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleGenerateAll}
                className="px-3.5 py-1.5 rounded-lg bg-[#c99738] hover:bg-[#d9a84a] text-black font-bold text-xs flex items-center space-x-1.5 shadow"
              >
                <Dices className="w-4 h-4" />
                <span>Tout Relancer Aléatoirement</span>
              </button>

              <button
                onClick={handleGenerateAiLore}
                disabled={isAiGenerating}
                className="px-3 py-1.5 rounded-lg bg-[#291f14] hover:bg-[#3b2b1a] text-[#d4a34b] border border-[#5a4224] text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Bot className="w-4 h-4" />
                <span>{isAiGenerating ? 'Génération...' : 'Enrichir Style Roman'}</span>
              </button>
            </div>

            <div className="text-[11px] text-[#a89885] italic">
              {aiError && <span className="text-amber-400">{aiError}</span>}
            </div>
          </div>

          {/* Suggested Name */}
          <div className="bg-[#1b1922] p-3 rounded-lg border border-[#332b20] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-[#d4a34b]" />
              <span className="text-xs font-cinzel font-bold text-[#fae5b5]">Nom suggéré :</span>
              <span className="text-sm font-semibold text-[#f5ebd9]">{suggestedName}</span>
            </div>
            <button
              onClick={() => setSuggestedName(generateRandomName(character.gender === 'Homme' ? 'Homme' : 'Femme').name)}
              className="text-[#a89885] hover:text-[#d4a34b] p-1"
              title="Relancer le nom"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards for each aspect */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Origin World */}
            <div className="bg-[#1b1922] p-3 rounded-lg border border-[#332b20] space-y-1 relative group">
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-[11px] font-bold text-[#d4a34b] flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Monde d'Origine</span>
                </span>
                <button
                  onClick={() => handleRegenerateField('originPlanet')}
                  className="text-gray-500 group-hover:text-[#d4a34b] p-0.5"
                  title="Relancer"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-[#fae5b5] font-medium">{currentBackstory.originPlanet}</p>
            </div>

            {/* Birth Status */}
            <div className="bg-[#1b1922] p-3 rounded-lg border border-[#332b20] space-y-1 relative group">
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-[11px] font-bold text-[#d4a34b] flex items-center space-x-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Statut de Naissance</span>
                </span>
                <button
                  onClick={() => handleRegenerateField('birthStatus')}
                  className="text-gray-500 group-hover:text-[#d4a34b] p-0.5"
                  title="Relancer"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-[#fae5b5] font-medium">{currentBackstory.birthStatus}</p>
            </div>

            {/* Formative Event */}
            <div className="bg-[#1b1922] p-3 rounded-lg border border-[#332b20] space-y-1 sm:col-span-2 relative group">
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-[11px] font-bold text-[#d4a34b] flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Événement Formateur Décisif</span>
                </span>
                <button
                  onClick={() => handleRegenerateField('formativeEvent')}
                  className="text-gray-500 group-hover:text-[#d4a34b] p-0.5"
                  title="Relancer"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-[#c9b79c] leading-relaxed">{currentBackstory.formativeEvent}</p>
            </div>

            {/* Dark Secret / Debt */}
            <div className="bg-[#1b1922] p-3 rounded-lg border border-[#332b20] space-y-1 sm:col-span-2 relative group">
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-[11px] font-bold text-[#e09145] flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Secret Inavouable / Dette de Kanly</span>
                </span>
                <button
                  onClick={() => handleRegenerateField('darkSecretOrDebt')}
                  className="text-gray-500 group-hover:text-[#e09145] p-0.5"
                  title="Relancer"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-[#c9b79c] leading-relaxed">{currentBackstory.darkSecretOrDebt}</p>
            </div>

            {/* Distinctive Feature */}
            <div className="bg-[#1b1922] p-3 rounded-lg border border-[#332b20] space-y-1 relative group">
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-[11px] font-bold text-[#d4a34b] flex items-center space-x-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Signe Distinctif</span>
                </span>
                <button
                  onClick={() => handleRegenerateField('distinctiveFeature')}
                  className="text-gray-500 group-hover:text-[#d4a34b] p-0.5"
                  title="Relancer"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-[#c9b79c]">{currentBackstory.distinctiveFeature}</p>
            </div>

            {/* Trinket */}
            <div className="bg-[#1b1922] p-3 rounded-lg border border-[#332b20] space-y-1 relative group">
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-[11px] font-bold text-[#d4a34b] flex items-center space-x-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Objet Fétiche / Souvenir</span>
                </span>
                <button
                  onClick={() => handleRegenerateField('trinket')}
                  className="text-gray-500 group-hover:text-[#d4a34b] p-0.5"
                  title="Relancer"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-[#c9b79c]">{currentBackstory.trinket}</p>
            </div>
          </div>

          {/* Full Narrative Textarea */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider block">
                Récit Biographique Synthétisé (Modifiable) :
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-xs text-[#d4a34b] hover:underline flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
            <textarea
              rows={5}
              value={currentBackstory.fullNarrative}
              onChange={(e) => setCurrentBackstory((prev) => ({ ...prev, fullNarrative: e.target.value }))}
              className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded-lg p-3 text-xs text-[#e6d8c3] focus:outline-none focus:border-[#d4a34b] leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#382b1c] bg-[#1a1820] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#a89885] hover:text-white"
          >
            Annuler
          </button>

          <button
            onClick={handleApply}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#c99738] to-[#9e6224] hover:from-[#d9a84a] hover:to-[#b3702a] text-black font-extrabold text-xs sm:text-sm flex items-center space-x-2 shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span>Appliquer à la Fiche de Personnage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
