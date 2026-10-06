import React, { useState } from 'react';
import { 
  DiceTestResult, 
  DuneCharacter, 
  PrincipleName, 
  SkillName 
} from '../types/dune';
import { 
  SKILLS_INFO, 
  PRINCIPLES_INFO 
} from '../data/duneData';
import { 
  Dices, 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Info,
  Flame
} from 'lucide-react';

interface DiceSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: DuneCharacter;
  initialSkill?: SkillName;
  initialPrinciple?: PrincipleName;
}

export const DiceSimulatorModal: React.FC<DiceSimulatorModalProps> = ({
  isOpen,
  onClose,
  character,
  initialSkill = 'Combat',
  initialPrinciple = 'Devoir',
}) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillName>(initialSkill);
  const [selectedPrinciple, setSelectedPrinciple] = useState<PrincipleName>(initialPrinciple);
  const [selectedSpec, setSelectedSpec] = useState<string>('');
  const [difficulty, setDifficulty] = useState<number>(1);
  const [extraDiceCount, setExtraDiceCount] = useState<number>(0); // 0 to 3 (total dice = 2 + extra)
  const [paymentSource, setPaymentSource] = useState<'Impulsion' | 'Menace'>('Impulsion');
  const [useDetermination, setUseDetermination] = useState(false);
  const [lastResult, setLastResult] = useState<DiceTestResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  if (!isOpen) return null;

  const currentSkillScore = character.skills[selectedSkill].value;
  const currentPrincipleScore = character.principles[selectedPrinciple].value;
  const targetNumber = currentSkillScore + currentPrincipleScore;
  const availableSpecs = character.skills[selectedSkill].specializations || [];
  const activeMaxime = character.principles[selectedPrinciple].maxime;
  const isPrincipleBroken = character.principles[selectedPrinciple].isBroken;

  // Extra dice cost in 2d20: 1st=1, 2nd=2, 3rd=3. Cumulative: 1=1, 2=3, 3=6
  const extraDiceCost = [0, 1, 3, 6][extraDiceCount];

  const handleRoll = () => {
    setIsRolling(true);
    setLastResult(null);

    setTimeout(() => {
      const totalDice = 2 + extraDiceCount;
      const rolls: { roll: number; isSuccess: boolean; isCritical: boolean; isComplication: boolean }[] = [];
      let successCount = 0;
      let complicationsCount = 0;

      for (let i = 0; i < totalDice; i++) {
        // If Determination used for 1st die, it's an automatic 1
        let rollVal = Math.floor(Math.random() * 20) + 1;
        if (useDetermination && i === 0) {
          rollVal = 1;
        }

        const isSuccess = rollVal <= targetNumber;
        // Critical: roll == 1, OR (specialization applies AND roll <= skill value)
        const isCritical = rollVal === 1 || (!!selectedSpec && rollVal <= currentSkillScore);
        const isComplication = rollVal === 20;

        if (isComplication) complicationsCount++;

        if (isCritical) {
          successCount += 2;
        } else if (isSuccess) {
          successCount += 1;
        }

        rolls.push({
          roll: rollVal,
          isSuccess,
          isCritical,
          isComplication,
        });
      }

      const isSuccess = successCount >= difficulty;
      const momentumGenerated = isSuccess ? Math.max(0, successCount - difficulty) : 0;

      const result: DiceTestResult = {
        characterName: character.name,
        skillName: selectedSkill,
        skillValue: currentSkillScore,
        principleName: selectedPrinciple,
        principleValue: currentPrincipleScore,
        targetNumber,
        specializationUsed: selectedSpec || undefined,
        diceCount: totalDice,
        difficulty,
        diceRolled: rolls,
        successCount,
        isSuccess,
        momentumGenerated,
        complicationsCount,
        timestamp: new Date().toLocaleTimeString(),
      };

      setLastResult(result);
      setIsRolling(false);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#15141a] rounded-xl border border-[#523d24] max-w-2xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#382b1c] bg-[#1a1820] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#2b2014] text-[#d4a34b] border border-[#5c4021]">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                Simulateur de Test 2d20 de Dune
              </h2>
              <p className="text-xs text-[#a89885]">
                Résolution officielle : Seuil de Réussite = Compétence ({currentSkillScore}) + Principe ({currentPrincipleScore}) = {targetNumber}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* Skill & Principle Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Skill */}
            <div className="space-y-1.5">
              <label className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider block">
                1. Compétence :
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => {
                  const s = e.target.value as SkillName;
                  setSelectedSkill(s);
                  setSelectedSpec('');
                }}
                className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded-lg px-3 py-2 text-sm text-[#fae5b5]"
              >
                {(['Analyse', 'Combat', 'Discipline', 'Mobilité', 'Rhétorique'] as SkillName[]).map((s) => (
                  <option key={s} value={s}>
                    {s} ({character.skills[s].value})
                  </option>
                ))}
              </select>
            </div>

            {/* Principle */}
            <div className="space-y-1.5">
              <label className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider block">
                2. Principe mobilisé :
              </label>
              <select
                value={selectedPrinciple}
                onChange={(e) => setSelectedPrinciple(e.target.value as PrincipleName)}
                className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded-lg px-3 py-2 text-sm text-[#fae5b5]"
              >
                {(['Devoir', 'Domination', 'Foi', 'Justice', 'Vérité'] as PrincipleName[]).map((p) => (
                  <option key={p} value={p}>
                    {p} ({character.principles[p].value}) {character.principles[p].isBroken ? '• BAFOUÉ' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Maxime indicator */}
          <div className="bg-[#1b1922] p-3 rounded-lg border border-[#332b20] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#d4a34b] font-cinzel">Maxime de {selectedPrinciple} :</span>
              {isPrincipleBroken && (
                <span className="text-[10px] text-red-400 font-bold uppercase">Principe bafoué</span>
              )}
            </div>
            <p className="text-xs italic text-[#e6d8c3]">
              {activeMaxime ? `« ${activeMaxime} »` : '(Principe mineur sans maxime)'}
            </p>
          </div>

          {/* Specialization & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Specialization */}
            <div className="space-y-1.5">
              <label className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider block">
                Spécialisation applicable (Critique si &le; {currentSkillScore}) :
              </label>
              <select
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
                className="w-full bg-[#0f1015] border border-[#4a3b2b] rounded-lg px-3 py-2 text-sm text-[#fae5b5]"
              >
                <option value="">Aucune spécialisation</option>
                {availableSpecs.map((sp) => (
                  <option key={sp} value={sp}>
                    ★ {sp}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-cinzel font-bold text-[#fae5b5] uppercase tracking-wider block">
                Difficulté du test (0 à 5) :
              </label>
              <div className="flex items-center space-x-2">
                {[0, 1, 2, 3, 4, 5].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 rounded font-mono font-bold text-xs transition-all border ${
                      difficulty === d
                        ? 'bg-[#c99738] text-black border-[#c99738] shadow'
                        : 'bg-[#241c14] text-[#a89885] border-[#4a3a28]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Extra d20s & Momentum/Menace buy */}
          <div className="bg-[#1b1922] p-3.5 rounded-lg border border-[#332b20] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="font-cinzel text-xs font-bold text-[#fae5b5] block">
                  Acheter des d20 supplémentaires (max 5d20 au total) :
                </span>
                <span className="text-[11px] text-[#8a7a67]">
                  Coût officiel : 1er dé = 1 pt, 2e dé = 2 pts, 3e dé = 3 pts
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                {[0, 1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setExtraDiceCount(num)}
                    className={`px-2.5 py-1 rounded font-mono text-xs border ${
                      extraDiceCount === num
                        ? 'bg-[#d4a34b] text-black font-bold border-[#d4a34b]'
                        : 'bg-[#261f16] text-[#a89885] border-[#473926]'
                    }`}
                  >
                    {num === 0 ? '2d20 de base' : `+${num}d20 (${[0, 1, 3, 6][num]} pts)`}
                  </button>
                ))}
              </div>
            </div>

            {extraDiceCount > 0 && (
              <div className="flex items-center space-x-3 pt-2 border-t border-[#29221a] text-xs">
                <span className="text-[#a89885]">Régler le coût ({extraDiceCost} pts) via :</span>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    checked={paymentSource === 'Impulsion'}
                    onChange={() => setPaymentSource('Impulsion')}
                    className="accent-[#d4a34b]"
                  />
                  <span className="text-[#fae5b5]">Réserve d’Impulsion</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    checked={paymentSource === 'Menace'}
                    onChange={() => setPaymentSource('Menace')}
                    className="accent-[#e09145]"
                  />
                  <span className="text-[#e09145]">Donner Menace au MJ (+{extraDiceCost})</span>
                </label>
              </div>
            )}

            {/* Determination toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-[#29221a]">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDetermination}
                  onChange={(e) => setUseDetermination(e.target.checked)}
                  disabled={character.determination <= 0 || !activeMaxime || isPrincipleBroken}
                  className="accent-[#d4a34b]"
                />
                <span className="text-xs text-[#fae5b5] flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-[#d4a34b] fill-[#d4a34b]" />
                  <span>Dépenser 1 Détermination (1er dé = 1 automatique)</span>
                </span>
              </label>
              <span className="text-[11px] text-[#8a7a67]">
                Dispo : {character.determination} pt(s)
              </span>
            </div>
          </div>

          {/* Roll Button */}
          <button
            onClick={handleRoll}
            disabled={isRolling}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[#c99738] to-[#9e6224] hover:from-[#d9a84a] hover:to-[#b3702a] text-black font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-xl transition-all"
          >
            <Dices className="w-5 h-5 animate-pulse" />
            <span>{isRolling ? 'Lancement des dés...' : `Lancer ${2 + extraDiceCount}d20 (Seuil : ${targetNumber})`}</span>
          </button>

          {/* Test Results Display */}
          {lastResult && (
            <div className={`p-4 rounded-xl border space-y-4 animate-fadeIn ${
              lastResult.isSuccess
                ? 'bg-[#152014] border-green-800/80 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                : 'bg-[#201414] border-red-800/80 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
            }`}>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {lastResult.isSuccess ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                  <div>
                    <span className="font-cinzel text-base font-bold text-white">
                      {lastResult.isSuccess ? 'SUCCÈS !' : 'ÉCHEC'}
                    </span>
                    <span className="text-xs text-gray-300 ml-2">
                      ({lastResult.successCount} réussite{lastResult.successCount > 1 ? 's' : ''} / {lastResult.difficulty} requise{lastResult.difficulty > 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                {lastResult.momentumGenerated > 0 && (
                  <div className="px-3 py-1 rounded-full bg-green-950 text-green-300 border border-green-700 text-xs font-mono font-bold flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-green-400" />
                    <span>+{lastResult.momentumGenerated} Impulsion</span>
                  </div>
                )}
              </div>

              {/* Dice Cards */}
              <div className="flex flex-wrap gap-2.5 justify-center py-2">
                {lastResult.diceRolled.map((d, dIdx) => (
                  <div
                    key={dIdx}
                    className={`w-14 h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                      d.isCritical
                        ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.5)] scale-105'
                        : d.isComplication
                        ? 'bg-red-950/80 border-red-500 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                        : d.isSuccess
                        ? 'bg-green-950/60 border-green-500 text-green-200'
                        : 'bg-gray-900 border-gray-700 text-gray-400'
                    }`}
                  >
                    <span className="text-xl font-bold font-mono">{d.roll}</span>
                    <span className="text-[9px] uppercase font-mono tracking-tighter">
                      {d.isCritical ? '2 Réussites' : d.isSuccess ? '1 Réussite' : d.isComplication ? 'Complication' : 'Rien'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Complications Alert */}
              {lastResult.complicationsCount > 0 && (
                <div className="bg-red-950/60 p-2.5 rounded-lg border border-red-800 text-xs text-red-200 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>
                    <strong>{lastResult.complicationsCount} Complication(s) générée(s) (20s) !</strong> Le meneur de jeu peut ajouter un désagrément ou 2 points de Menace par complication.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
