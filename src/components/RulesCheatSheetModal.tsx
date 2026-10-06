import React from 'react';
import { BookOpen, X, Sparkles, AlertTriangle, Shield, Sword, Compass, Zap } from 'lucide-react';

interface RulesCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesCheatSheetModal: React.FC<RulesCheatSheetModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#15141a] rounded-xl border border-[#523d24] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#382b1c] bg-[#1a1820] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#2b2014] text-[#d4a34b] border border-[#5c4021]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#fae5b5]">
                Aide-Mémoire Officiel : Règles de Dune 2d20
              </h2>
              <p className="text-xs text-[#a89885]">
                Synthèse des Chapitres 5 & 6 (Dune : Aventures dans l’Imperium)
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm text-[#c9b79c]">
          
          {/* Section 1: Tests de compétence */}
          <div className="bg-[#1b1922] p-4 rounded-lg border border-[#332b20] space-y-2">
            <h3 className="font-cinzel font-bold text-sm text-[#fae5b5] flex items-center space-x-1.5">
              <Sword className="w-4 h-4 text-[#d4a34b]" />
              <span>1. Résolution d'un Test de Compétence</span>
            </h3>
            <ul className="space-y-1 list-disc list-inside text-xs leading-relaxed">
              <li><strong>Seuil de Réussite (SR) :</strong> Additionnez la <strong>Compétence</strong> (4 à 8) et le <strong>Principe</strong> (4 à 8) mobilisé.</li>
              <li><strong>Réserve de dés de base :</strong> Lancez <strong>2d20</strong> (jusqu’à 5d20 max par achat d’Impulsion/Menace).</li>
              <li><strong>Réussite :</strong> Tout dé &le; Seuil de Réussite apporte 1 réussite.</li>
              <li><strong>Réussite Critique (2 réussites) :</strong> Tout résultat de <strong>1</strong>. Si une <strong>Spécialisation</strong> s’applique au test, tout dé &le; <strong>Valeur de Compétence</strong> devient aussi une Réussite Critique !</li>
              <li><strong>Complication :</strong> Tout résultat de <strong>20</strong> engendre une complication (incident, blessure, ou 2 Menaces données au MJ).</li>
              <li><strong>Succès du test :</strong> Le nombre total de réussites doit égaler ou dépasser la <strong>Difficulté</strong> (0 à 5).</li>
              <li><strong>Impulsion générée :</strong> Chaque réussite excédentaire au-delà de la difficulté génère 1 point d’Impulsion.</li>
            </ul>
          </div>

          {/* Section 2: Impulsion, Menace, Détermination */}
          <div className="bg-[#1b1922] p-4 rounded-lg border border-[#332b20] space-y-2">
            <h3 className="font-cinzel font-bold text-sm text-[#fae5b5] flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-[#d4a34b]" />
              <span>2. Ressources : Impulsion, Menace & Détermination</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#121116] p-2.5 rounded border border-[#2b241c] space-y-1">
                <strong className="text-[#fae5b5] font-cinzel block">Impulsion (PJ)</strong>
                <p className="text-[11px] text-[#a89885]">
                  Réserve collective (max 6). Dépenses courantes : acheter des d20 (1er=1, 2e=2, 3e=3), Obtenir des informations (1 pt/question), Créer un trait ou atout (2 pts).
                </p>
              </div>

              <div className="bg-[#121116] p-2.5 rounded border border-[#2b241c] space-y-1">
                <strong className="text-[#e09145] font-cinzel block">Menace (MJ)</strong>
                <p className="text-[11px] text-[#a89885]">
                  Utilisée par le MJ pour ajouter des dés aux PNJ, hausser la difficulté, créer des périls ou activer une Maison ennemie (1 pt).
                </p>
              </div>

              <div className="bg-[#121116] p-2.5 rounded border border-[#2b241c] space-y-1">
                <strong className="text-[#d4a34b] font-cinzel block">Détermination</strong>
                <p className="text-[11px] text-[#a89885]">
                  Max 3 (départ 1). Utilisable si la maxime du principe soutient l’action : confère un <strong>1 automatique</strong> ou permet de <strong>relancer toute la réserve</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Principes Bafoués */}
          <div className="bg-[#1b1922] p-4 rounded-lg border border-[#332b20] space-y-2">
            <h3 className="font-cinzel font-bold text-sm text-[#fae5b5] flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-[#d4a34b]" />
              <span>3. Bafouer un Principe & Rédemption</span>
            </h3>
            <p className="text-xs leading-relaxed">
              Si l’action contredit votre maxime, vous pouvez <strong>respecter le principe</strong> (subir une complication immédiate mais conserver la maxime) ou <strong>bafouer le principe</strong> (gagner 1 Détermination mais biffer la maxime). Un principe bafoué ne peut plus être utilisé jusqu’à une introspection ou fin d’aventure pour redéfinir ses priorités.
            </p>
          </div>

          {/* Section 4: Conflits, Atouts & Échelle */}
          <div className="bg-[#1b1922] p-4 rounded-lg border border-[#332b20] space-y-2">
            <h3 className="font-cinzel font-bold text-sm text-[#fae5b5] flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-[#d4a34b]" />
              <span>4. Conflits, Duels & Échelle</span>
            </h3>
            <ul className="space-y-1 list-disc list-inside text-xs leading-relaxed">
              <li><strong>5 types de conflit :</strong> Duel (combat singulier), Escarmouche (groupes d’agents), Guerre (armées & fiefs), Espionnage (surveillance & infiltration), Intrigue (conflit social & secrets).</li>
              <li><strong>Déplacer un atout :</strong> Nécessite un test de compétence de difficulté 2 (avec discrétion pour conserver l’initiative, ou avec audace pour faire réagir l’adversaire).</li>
              <li><strong>Attaquer :</strong> Test en opposition. Contre un PNJ notable ou PJ, c'est une <strong>Tâche Étendue</strong> (conditions = score de compétence clé). Chaque réussite rapporte 2 points + qualité de l’atout.</li>
              <li><strong>Survivre à la défaite :</strong> 1 fois par scène, dépenser 1 point d’Impulsion (ou donner 1 Menace) + subir une complication pour rester en jeu sans être éliminé.</li>
            </ul>
          </div>

          {/* Section 5: Avertissement Spécial Laser + Bouclier */}
          <div className="bg-red-950/40 p-3.5 rounded-lg border border-red-800/80 text-xs text-red-200 space-y-1">
            <div className="flex items-center space-x-2 text-red-300 font-bold font-cinzel">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>INTERDICTION ABSOLUE : INTERACTION LASER + BOUCLIER HOLTZMAN</span>
            </div>
            <p className="leading-relaxed">
              Tout tir de laser frappant un bouclier actif déclenche instantanément une <strong>déflagration sub-nucléaire</strong> anéantissant la zone sur des kilomètres. Cet acte viole la Grande Convention et entraîne l'annihilation immédiate de la Maison coupable par les forces combinées du Landsraad et de l'Empereur.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#382b1c] bg-[#1a1820] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#c99738] hover:bg-[#d9a84a] text-black font-bold text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
