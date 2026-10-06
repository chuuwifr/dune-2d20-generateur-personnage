import React, { useState, useRef, useEffect } from 'react';
import { DuneCharacter } from '../types/dune';
import { generateRandomName } from '../utils/backgroundGenerator';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  X, 
  Check, 
  User, 
  Cpu, 
  BookOpen, 
  Shield, 
  Zap, 
  Compass, 
  RefreshCw,
  Copy,
  ChevronDown
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  extractedNames?: string[];
}

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: DuneCharacter;
  setCharacter: React.Dispatch<React.SetStateAction<DuneCharacter>>;
  initialPrompt?: string;
}

type BotPersonaKey = 'mentat' | 'bene-gesserit' | 'fremen' | 'heraut';

interface BotPersona {
  id: BotPersonaKey;
  name: string;
  title: string;
  avatarIcon: any;
  greeting: string;
  systemInstruction: string;
}

const PERSONAS: Record<BotPersonaKey, BotPersona> = {
  mentat: {
    id: 'mentat',
    name: 'Thufir-Beta',
    title: 'Mentat & Conseiller Logique',
    avatarIcon: Cpu,
    greeting: 'Mes paramètres cognitifs sont prêts. C’est par la volonté seule que j’agis. Quelle analyse de patronyme ou calcul de probabilité requérez-vous pour votre personnage ?',
    systemInstruction: `Tu es Thufir-Beta, un Mentat hautement qualifié au service des grandes institutions de l'Imperium dans l'univers de Dune (Frank Herbert).
Tu t'exprimes avec la rigueur analytique, la froideur calculée et l'élégance intellectuelle d'un ordinateur humain. Tes lèvres portent les reflets du jus de sapho.
Tu es expert en :
- Génération de noms et patronymes féodaux crédibles selon les faufreluches impériales (Maison Corrino, Atréides, Harkonnen, Vernius, Richese, etc.)
- Étymologies, titres, et probabilités d'ascendance
- Analyse des compétences, principes et maximes du jeu de rôle Dune 2d20.

Quand on te demande de générer un nom :
1. Donne 3 à 5 suggestions distinctes et marquantes adaptées au genre, à la faction et à la Maison du personnage.
2. Pour chaque nom, mets-le clairement en valeur (ex: "**Nom Prénom**") et explique son origine féodale ou sa résonance dans l'Imperium.
3. Reste toujours fidèle à l'univers de Frank Herbert (pas de fantasy générique, uniquement le lore de Dune).`,
  },
  'bene-gesserit': {
    id: 'bene-gesserit',
    name: 'Mère Supérieure Gaius',
    title: 'Archiviste du Bene Gesserit',
    avatarIcon: Sparkles,
    greeting: 'Que la paix soit sur ton esprit, voyageur. Les archives génétiques de Wallach IX conservent la trace de millions de lignées. Quel nom ou destin cherches-tu à réveiller ?',
    systemInstruction: `Tu es une Révérende Mère et archiviste de la Communauté des Sœurs du Bene Gesserit sur Wallach IX.
Tu t'exprimes avec calme, sagesse ancestrale et une pointe de mystère impérial. Tu possèdes la mémoire de tes ancêtres.
Tu excelles à proposer des noms nobles raffinés, des patronymes aux échos historiques anciens, des prénoms féminins et masculins aristocratiques, et à suggérer des ambitions secrètes pour les serviteurs de l'Imperium.
Mets en valeur les noms proposés en gras (ex: "**Nom Prénom**") pour que le joueur puisse les identifier facilement.`,
  },
  fremen: {
    id: 'fremen',
    name: 'Stilgar du Sietch',
    title: 'Naib & Voix du Désert',
    avatarIcon: Compass,
    greeting: 'Ya hya chouhada ! Par Shai-Hulud et par l’eau de notre tribu, parle en vérité. Tu cherches un nom du désert ou un nom secret en Chakobsa ?',
    systemInstruction: `Tu es un chef (Naib) Fremen respecté du désert profond d'Arrakis (Dune).
Tu parles avec gravité, poésie aride et la franchise absolue de la discipline de l'eau. Tu saupoudres naturellement ton discours de termes authentiques de Dune et du dialecte Chakobsa (Shai-Hulud, sietch, Naib, krys, lisan al-gaib, tahaddi, etc.).
Quand on te demande un nom :
- Propose des noms authentiques fremen, des noms de sietch ou des noms de guerre sacrés.
- Explique leur sens poétique en rapport avec le désert, les vers, les lunes d'Arrakis ou les étoiles.
- Mets les noms suggérés en valeur en gras (ex: "**Nom Prénom**").`,
  },
  heraut: {
    id: 'heraut',
    name: 'Héraut du Landsraad',
    title: 'Chancelier des Armoiries Impériales',
    avatarIcon: Shield,
    greeting: 'Au nom de Sa Majesté Impériale Shaddam IV et du Haut Conseil du Landsraad, je tiens le registre des lignages et des bannières. Quel titre et patronyme désirez-vous inscrire aux registres ?',
    systemInstruction: `Tu es le Héraut officiel de la cour impériale de Kaitain et du Landsraad.
Tu maîtrises parfaitement l'héraldique, les rangs féodaux des faufreluches (Siridar-Baron, Comte, Duc, etc.), les Maisons majeures et mineures, et les convenances de la Grande Convention.
Tu suggères des noms pompeux, prestigieux et impeccables pour les diplomates, officiers et aristocrates de l'univers de Dune.
Mets toujours les noms suggérés en valeur en gras (ex: "**Nom Prénom**").`,
  },
};

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({
  isOpen,
  onClose,
  character,
  setCharacter,
  initialPrompt,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<BotPersonaKey>('mentat');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.1-flash-lite' | 'gemini-3.5-flash' | 'gemini-3.1-pro-preview'>('gemini-3.5-flash');
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appliedNameNotice, setAppliedNameNotice] = useState<string | null>(null);

  // Initialize conversation thread with greeting
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      role: 'model',
      text: PERSONAS['mentat'].greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // When initialPrompt changes upon opening, auto-send or set it
  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInputText(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  // Helper to extract potential names wrapped in **...**
  const extractNamesFromText = (text: string): string[] => {
    const boldRegex = /\*\*([A-ZÀ-Ÿ][a-zA-ZÀ-ÿ'\- ]{2,30})\*\*/g;
    const matches: string[] = [];
    let match;
    while ((match = boldRegex.exec(text)) !== null) {
      const candidate = match[1].trim();
      // filter out common formatting words
      if (
        !candidate.includes(':') &&
        !['Important', 'Note', 'Option', 'Règle', 'Conseil', 'Attention'].includes(candidate) &&
        candidate.split(' ').length >= 1 &&
        candidate.split(' ').length <= 4
      ) {
        if (!matches.includes(candidate)) {
          matches.push(candidate);
        }
      }
    }
    return matches.slice(0, 6);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setInputText('');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const persona = PERSONAS[selectedPersona];

      // Build context of active character
      const characterContext = `
CONTEXTE DU PERSONNAGE ACTUEL DU JOUEUR :
- Nom actuel : ${character.name || 'Non défini'}
- Genre : ${character.gender || 'Femme'}
- Vocation : ${character.vocation}
- Archétype : ${character.archetype}
- Maison : ${character.house.name} (${character.house.reputationTrait}, ${character.house.type})
- Monde d'origine : ${character.backstory.originPlanet || character.house.homeworld}
- Compétences clés : ${Object.entries(character.skills).filter(([_, s]) => s.value >= 6).map(([k, s]) => `${k} ${s.value}`).join(', ')}
- Ambition : ${character.ambition || 'Non définie'}
`;

      const completeSystemInstruction = `${persona.systemInstruction}\n\n${characterContext}`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, text: m.text })),
          systemInstruction: completeSystemInstruction,
          model: selectedModel,
          temperature: 0.8,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur (${res.status})`);
      }

      const data = await res.json();
      const replyText = data.reply || 'Aucune réponse reçue.';
      const extracted = extractNamesFromText(replyText);

      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extractedNames: extracted.length > 0 ? extracted : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Impossible de joindre le Conseiller IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyName = (suggestedName: string) => {
    setCharacter((prev) => ({
      ...prev,
      name: suggestedName,
    }));
    setAppliedNameNotice(`Nom "${suggestedName}" appliqué avec succès à votre fiche !`);
    setTimeout(() => setAppliedNameNotice(null), 3000);
  };

  const handleSwitchPersona = (pKey: BotPersonaKey) => {
    setSelectedPersona(pKey);
    const persona = PERSONAS[pKey];
    setMessages((prev) => [
      ...prev,
      {
        id: `switch-${Date.now()}`,
        role: 'model',
        text: `[Changement d'interlocuteur : ${persona.name} (${persona.title})]\n${persona.greeting}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleClearChat = () => {
    const persona = PERSONAS[selectedPersona];
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'model',
        text: persona.greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#131217] rounded-xl border border-[#523d24] max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-3 sm:p-4 border-b border-[#382b1c] bg-[#1a1720] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#291f14] border border-[#5c4021] flex items-center justify-center text-[#d4a34b] shadow">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-cinzel text-base sm:text-lg font-bold text-[#fae5b5]">
                  Conseiller IA de l'Imperium
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#c99738]/20 text-[#d4a34b] font-mono border border-[#c99738]/40">
                  Gemini Multi-Turn
                </span>
              </div>
              <p className="text-[11px] text-[#a89885]">
                Interlocuteur actuel : <strong className="text-[#fae5b5]">{PERSONAS[selectedPersona].name}</strong> ({PERSONAS[selectedPersona].title})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Model Selector */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-[#0f1015] border border-[#4a3b2b] rounded px-2.5 py-1 text-xs text-[#fae5b5] font-mono"
              title="Sélectionner le modèle Gemini"
            >
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-rapide)</option>
              <option value="gemini-3.5-flash">gemini-3.5-flash (Général)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Tasks)</option>
            </select>

            <button
              onClick={handleClearChat}
              className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
              title="Effacer l'historique de discussion"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Persona Switcher Bar */}
        <div className="bg-[#17151e] border-b border-[#2d2419] px-4 py-2 flex items-center space-x-2 overflow-x-auto">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#a89885] mr-1 whitespace-nowrap">
            Rôle IA :
          </span>
          {(Object.keys(PERSONAS) as BotPersonaKey[]).map((pKey) => {
            const p = PERSONAS[pKey];
            const Icon = p.avatarIcon;
            const isCurrent = selectedPersona === pKey;

            return (
              <button
                key={pKey}
                onClick={() => handleSwitchPersona(pKey)}
                className={`px-2.5 py-1 rounded-full text-xs flex items-center space-x-1.5 transition-all whitespace-nowrap border ${
                  isCurrent
                    ? 'bg-[#c99738] text-black font-bold border-[#c99738] shadow'
                    : 'bg-[#100f13] text-[#c2b49d] border-[#2e261d] hover:border-[#5a4224]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Applied Name Notification */}
        {appliedNameNotice && (
          <div className="bg-green-950/80 border-b border-green-800 text-green-300 text-xs px-4 py-2 flex items-center justify-between animate-fadeIn">
            <span className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-400" />
              <strong>{appliedNameNotice}</strong>
            </span>
            <button onClick={() => setAppliedNameNotice(null)} className="text-green-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Chat Messages Thread */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const persona = PERSONAS[selectedPersona];
            const Icon = persona.avatarIcon;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#291f14] border border-[#5c4021] flex items-center justify-center text-[#d4a34b] shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-xl p-3.5 space-y-2 shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-[#946124] to-[#6d4013] text-white border border-[#b87d36]/60 rounded-br-sm'
                      : 'bg-[#1b1922] text-[#e6d8c3] border border-[#382d20] rounded-bl-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-70 border-b border-white/10 pb-1">
                    <span className="font-semibold font-mono">
                      {isUser ? 'Vous (Agent de la Maison)' : `${persona.name} (${persona.title})`}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message body */}
                  <div className="leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                    {msg.text}
                  </div>

                  {/* Interactive Name Badges: Click to apply to character! */}
                  {!isUser && msg.extractedNames && msg.extractedNames.length > 0 && (
                    <div className="pt-2 border-t border-[#362c20] space-y-1.5">
                      <span className="text-[10px] uppercase font-cinzel font-bold text-[#d4a34b] tracking-wider block">
                        ✨ Noms détectés — Cliquez pour appliquer à votre personnage :
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.extractedNames.map((name, nIdx) => (
                          <button
                            key={nIdx}
                            onClick={() => handleApplyName(name)}
                            className="px-2.5 py-1 rounded bg-[#2e2316] hover:bg-[#d4a34b] hover:text-black text-[#fae5b5] border border-[#d4a34b]/60 text-xs font-bold flex items-center space-x-1.5 transition-all shadow group"
                          >
                            <Sparkles className="w-3 h-3 text-[#d4a34b] group-hover:text-black" />
                            <span>Adopter « {name} »</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#3d2712] border border-[#8a4e1b] flex items-center justify-center text-[#fae5b5] shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-[#291f14] border border-[#5c4021] flex items-center justify-center text-[#d4a34b] shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#1b1922] p-3 rounded-lg border border-[#382d20] text-xs text-[#a89885] flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#d4a34b]" />
                <span>Le Conseiller traite vos données et consulte les archives de Dune...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="bg-red-950/80 border-t border-red-800 text-red-200 text-xs px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="font-semibold block">{errorMessage}</span>
              <p className="text-[11px] text-red-300/80">
                Sur Netlify : configurez la variable <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-red-200">GEMINI_API_KEY</code> dans vos paramètres de site Netlify (Site settings &gt; Environment variables).
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const names = [
                    generateRandomName(character.gender === 'Homme' ? 'Homme' : 'Femme').name,
                    generateRandomName(character.gender === 'Homme' ? 'Homme' : 'Femme').name,
                    generateRandomName(character.gender === 'Homme' ? 'Homme' : 'Femme').name,
                  ];
                  const botMsg: ChatMessage = {
                    id: `msg-${Date.now()}-fallback`,
                    role: 'model',
                    text: `[Génération hors-ligne]\nVoici 3 suggestions de noms impériaux pour votre personnage :\n- **${names[0]}**\n- **${names[1]}**\n- **${names[2]}**`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    extractedNames: names,
                  };
                  setMessages((prev) => [...prev, botMsg]);
                  setErrorMessage(null);
                }}
                className="px-2.5 py-1 rounded bg-[#2e2316] text-[#fae5b5] hover:bg-[#3d2b1b] border border-[#5c4021] text-xs font-semibold whitespace-nowrap"
              >
                Générer hors-ligne (secours)
              </button>
              <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white px-1">✕</button>
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="bg-[#141219] border-t border-[#29221b] px-3 sm:px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-[#8a7a67] font-mono whitespace-nowrap">Suggestions :</span>
          
          <button
            onClick={() => handleSendMessage(`Génère 5 noms nobles et authentiques pour mon personnage (${character.archetype}, ${character.vocation}, au service de la ${character.house.name}). Explique leur origine.`)}
            className="px-2.5 py-1 rounded bg-[#201c27] hover:bg-[#322c3e] text-[#fae5b5] border border-[#3d3448] whitespace-nowrap flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3 text-[#d4a34b]" />
            <span>5 Noms nobles adaptés</span>
          </button>

          <button
            onClick={() => handleSendMessage(`Propose-moi 5 noms fremen authentiques avec leurs équivalents en dialecte Chakobsa et leur signification poétique liée au désert.`)}
            className="px-2.5 py-1 rounded bg-[#201c27] hover:bg-[#322c3e] text-[#fae5b5] border border-[#3d3448] whitespace-nowrap flex items-center space-x-1"
          >
            <Compass className="w-3 h-3 text-[#d4a34b]" />
            <span>Noms Fremen Chakobsa</span>
          </button>

          <button
            onClick={() => handleSendMessage(`Génère 5 noms mystérieux pour une Sœur du Bene Gesserit ou un Mentat calculateur avec une devise personnelle.`)}
            className="px-2.5 py-1 rounded bg-[#201c27] hover:bg-[#322c3e] text-[#fae5b5] border border-[#3d3448] whitespace-nowrap flex items-center space-x-1"
          >
            <Zap className="w-3 h-3 text-[#d4a34b]" />
            <span>Noms Bene Gesserit / Mentat</span>
          </button>

          <button
            onClick={() => handleSendMessage(`Analyse mon personnage (${character.name || 'Sans nom'}, ${character.archetype}, Maison ${character.house.name}) et propose une ambition secrète redoutable.`)}
            className="px-2.5 py-1 rounded bg-[#201c27] hover:bg-[#322c3e] text-[#fae5b5] border border-[#3d3448] whitespace-nowrap flex items-center space-x-1"
          >
            <BookOpen className="w-3 h-3 text-[#d4a34b]" />
            <span>Idées d'Ambition Secrète</span>
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-[#382b1c] bg-[#1a1720]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Demandez à ${PERSONAS[selectedPersona].name} de générer un nom, une devise ou un secret...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-[#0f1015] border border-[#4a3b2b] rounded-lg px-4 py-2.5 text-xs sm:text-sm text-[#fae5b5] focus:outline-none focus:border-[#d4a34b] disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#c99738] to-[#9e6224] hover:from-[#d9a84a] hover:to-[#b3702a] text-black font-extrabold text-xs sm:text-sm flex items-center space-x-1.5 disabled:opacity-40 shadow transition-all"
            >
              <span>Envoyer</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
