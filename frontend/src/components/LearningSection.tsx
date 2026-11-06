import React, { useState, useEffect } from 'react';
import { CURRICULUM, RouteWorld, LessonExercise } from '../data/curriculumData';
import { MASTER_ACHIEVEMENTS } from '../data/achievementsData';
import { CyberCityViewport } from './CyberCityViewport';
import { apiFetch } from '../services/api';
import { runPython, loadPython } from '../services/pythonRunner';
import { 
  Sparkles, 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  Play, 
  Zap, 
  Coins, 
  Send, 
  AlertTriangle, 
  Lightbulb, 
  RotateCcw,
  Radio,
  Target,
  Terminal as TerminalIcon,
  Eye
} from 'lucide-react';

interface Props {
  onReward?: (xp: number, coins: number) => void;
}

export const LearningSection: React.FC<Props> = ({ onReward }) => {
  const [selectedRoute, setSelectedRoute] = useState<RouteWorld | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonExercise | null>(null);

  const [studentCode, setStudentCode] = useState('');
  const [evaluationFeedback, setEvaluationFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [isFirstTimeClear, setIsFirstTimeClear] = useState(true);
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const [pythonConsoleOutput, setPythonConsoleOutput] = useState<string[]>([]);
  const [pyStatus, setPyStatus] = useState<'idle' | 'loading' | 'running' | 'ready' | 'offline'>('idle');

  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const saved = await apiFetch('/lessons/my-progress');
        setCompletedLessons(saved);
      } catch (err) {
        console.error('Error cargando progreso:', err);
      }
    };
    loadSavedProgress();
  }, []);

  const startLesson = (lesson: LessonExercise) => {
    setActiveLesson(lesson);
    setStudentCode('');
    setEvaluationFeedback(null);
    setShowRewardModal(false);
    setHintLevel(0);
    setEarnedCoins(0);
    setPythonConsoleOutput([]);
    if (lesson.module === 'python') loadPython().then(() => setPyStatus('ready')).catch(() => setPyStatus('offline'));
  };

  // Comparación tolerante: ignora mayúsculas, espacios y tipo de comillas (idéntico al servidor)
  const norm = (t: string) => t.toLowerCase().replace(/\s+/g, '').replace(/'/g, '"');
  const cleanCode = norm(studentCode);

  const checkObjective = (keywords: string[]) => {
    return keywords.every(k => cleanCode.includes(norm(k)));
  };

  const runPythonCode = async (code: string) => {
    setPyStatus(p => (p === 'ready' ? 'running' : 'loading'));
    try {
      const { output, error } = await runPython(code);
      const lines = output ? output.replace(/\n$/, '').split('\n') : [];
      if (error) lines.push('⚠ ' + error);
      if (lines.length === 0) lines.push('[Programa ejecutado sin salidas print]');
      setPythonConsoleOutput(lines);
      setPyStatus('ready');
    } catch {
      setPyStatus('offline');
      runPythonSimulation(code);
    }
  };

  const buildCssPreview = (code: string) => {
    const css = code.includes('{') ? code : `.escena{${code}}`;
    return `<!doctype html><html><head><meta charset="utf-8"><style>
      h1{font-size:18px;margin:0 0 2px}p{font-size:12px;margin:0 0 6px}body{margin:0;padding:10px;background:#0b1020;color:#e2e8f0;font-family:system-ui,sans-serif}
      .escena{min-height:100px;padding:6px;border:1px dashed #475569;border-radius:10px;margin-bottom:10px}
      .item{background:#6366f1;color:#fff;padding:7px;margin:3px;border-radius:8px;font-weight:700;font-size:13px;text-align:center}
      .item:first-child{background:#ec4899}
      .boton{background:#334155;color:#fff;border:0;padding:6px 14px;border-radius:8px;font-weight:700}
    </style><style>${css}</style></head><body>
      <h1>Título</h1><p>Párrafo de prueba.</p><button class="boton">Botón</button>
      <div class="escena"><div class="item">1</div><div class="item">2</div><div class="item">3</div><div class="item">4</div><div class="item">5</div><div class="item">6</div></div>
    </body></html>`;
  };

  const runPythonSimulation = (code: string) => {
    const lines = code.split('\n');
    const outputs: string[] = [];
    const variables: Record<string, string> = {};

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#')) continue;

      if (line.includes('=') && !line.includes('print')) {
        const parts = line.split('=');
        variables[parts[0].trim()] = parts[1].trim().replace(/['"]/g, '');
      }

      if (line.startsWith('print(') && line.endsWith(')')) {
        const content = line.substring(6, line.length - 1).trim();
        if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
          outputs.push(content.slice(1, -1));
        } else if (variables[content]) {
          outputs.push(variables[content]);
        } else {
          outputs.push(content);
        }
      }
    }

    if (outputs.length === 0) {
      outputs.push('[Programa ejecutado sin salidas print]');
    }
    setPythonConsoleOutput(outputs);
  };

  const handleVerifyCode = () => {
    if (!activeLesson) return;

    if (activeLesson.module === 'python') {
      runPythonCode(studentCode);
    }

    const mainPassed = activeLesson.mainObjectives.every(obj => checkObjective(obj.keywords));
    const bonusPassed = activeLesson.bonusObjective ? checkObjective(activeLesson.bonusObjective.keywords) : false;
    const bonusCoins = bonusPassed ? activeLesson.bonusObjective.rewardCoins : 0;
    const totalCoins = activeLesson.coinReward + bonusCoins;

    if (mainPassed) {
      const alreadyCompleted = completedLessons.includes(activeLesson.id);

      if (!alreadyCompleted) {
        apiFetch('/lessons/complete', {
          method: 'POST',
          body: JSON.stringify({ lesson_id: activeLesson.id, submitted_code: studentCode })
        }).then((res) => {
          // El servidor valida el código y decide las recompensas reales
          setCompletedLessons(prev => [...prev, activeLesson.id]);
          setIsFirstTimeClear(res.first_time !== false);
          setEarnedCoins(res.coins_earned ?? totalCoins);
          if (onReward) {
            onReward(res.xp_earned ?? activeLesson.xpReward, res.coins_earned ?? totalCoins);
          }
        }).catch((err) => {
          setShowRewardModal(false);
          setEvaluationFeedback({ success: false, msg: err.message });
        });
      } else {
        setIsFirstTimeClear(false);
        setEarnedCoins(0);
      }

      setEvaluationFeedback({
        success: true,
        msg: alreadyCompleted 
          ? '¡Repaso completado! (Misión ya recompensada).'
          : `¡MISIÓN CUMPLIDA! Has ganado ${activeLesson.coinReward} monedas ${bonusPassed ? `y +${bonusCoins} monedas de la misión aparte.` : '.'}`
      });
      setShowRewardModal(true);
    } else {
      setEvaluationFeedback({
        success: false,
        msg: 'Aún faltan objetivos por cumplir. Revisa los recuadros verdes en el panel izquierdo.'
      });
    }
  };

  // VISTA 1: LAS 3 ISLAS FLOTANTES
  if (!selectedRoute) {
    return (
      <div className="w-full h-full flex flex-col justify-between py-2 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" />
            Academia de Código Interactivo
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
            ELIGE TU RUTA DE APRENDIZAJE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Supera misiones narrativas con objetivos tácticos y misiones aparte de monedas.
          </p>
        </div>

        {/* 3 ISLAS RESTAURADAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 items-center">
          
          {/* ISLA 1: HTML */}
          <div
            onClick={() => setSelectedRoute(CURRICULUM.html)}
            className="group cursor-pointer relative flex flex-col items-center animate-float-1 transition-transform duration-300 hover:scale-105"
          >
            <div className="absolute w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/40 transition-all" />
            <svg viewBox="0 0 240 200" className="w-56 h-48 drop-shadow-[0_15px_25px_rgba(245,158,11,0.25)]">
              <polygon points="30,110 120,180 210,110 180,95 60,95" fill="#451A03" />
              <polygon points="40,110 120,170 200,110 170,100 70,100" fill="#78350F" />
              <ellipse cx="120" cy="100" rx="85" ry="22" fill="#D97706" />
              <ellipse cx="120" cy="98" rx="80" ry="18" fill="#F59E0B" />
              <rect x="75" y="65" width="8" height="25" fill="#78350F" rx="3" />
              <circle cx="79" cy="60" r="18" fill="#EA580C" />
              <polygon points="120,40 132,85 108,85" fill="#FFF" fillOpacity="0.9" />
            </svg>
            <div className="w-full mt-2 bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 text-center backdrop-blur-md shadow-xl group-hover:border-amber-400 transition">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 uppercase tracking-widest border border-amber-500/30">
                La Ciudad Perdida
              </span>
              <h3 className="text-xl font-black text-white mt-1.5">HTML</h3>
              <p className="text-xs text-amber-200/70">6 Capítulos • 30 Niveles</p>
              <button className="mt-3 w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition tracking-wider shadow-lg shadow-amber-500/30">
                EXPLORAR MUNDO
              </button>
            </div>
          </div>

          {/* ISLA 2: CSS */}
          <div
            onClick={() => setSelectedRoute(CURRICULUM.css)}
            className="group cursor-pointer relative flex flex-col items-center animate-float-2 transition-transform duration-300 hover:scale-105"
          >
            <div className="absolute w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/40 transition-all" />
            <svg viewBox="0 0 240 200" className="w-56 h-48 drop-shadow-[0_15px_25px_rgba(6,182,212,0.25)]">
              <polygon points="30,110 120,185 210,110 180,95 60,95" fill="#083344" />
              <polygon points="40,110 120,175 200,110 170,100 70,100" fill="#0E7490" />
              <ellipse cx="120" cy="100" rx="85" ry="22" fill="#0891B2" />
              <ellipse cx="120" cy="98" rx="80" ry="18" fill="#06B6D4" />
              <polygon points="80,50 90,90 70,90" fill="#67E8F9" />
              <polygon points="120,35 132,88 108,88" fill="#E0F2FE" />
            </svg>
            <div className="w-full mt-2 bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-4 text-center backdrop-blur-md shadow-xl group-hover:border-cyan-400 transition">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 uppercase tracking-widest border border-cyan-500/30">
                La Dimensión del Diseño
              </span>
              <h3 className="text-xl font-black text-white mt-1.5">CSS</h3>
              <p className="text-xs text-cyan-200/70">6 Capítulos • 30 Niveles</p>
              <button className="mt-3 w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition tracking-wider shadow-lg shadow-cyan-500/30">
                EXPLORAR MUNDO
              </button>
            </div>
          </div>

          {/* ISLA 3: PYTHON */}
          <div
            onClick={() => setSelectedRoute(CURRICULUM.python)}
            className="group cursor-pointer relative flex flex-col items-center animate-float-3 transition-transform duration-300 hover:scale-105"
          >
            <div className="absolute w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/40 transition-all" />
            <svg viewBox="0 0 240 200" className="w-56 h-48 drop-shadow-[0_15px_25px_rgba(16,185,129,0.25)]">
              <polygon points="30,110 120,185 210,110 180,95 60,95" fill="#022C22" />
              <polygon points="40,110 120,175 200,110 170,100 70,100" fill="#065F46" />
              <ellipse cx="120" cy="100" rx="85" ry="22" fill="#059669" />
              <ellipse cx="120" cy="98" rx="80" ry="18" fill="#10B981" />
              <rect x="114" y="60" width="12" height="35" fill="#064E3B" rx="4" />
              <circle cx="120" cy="50" r="24" fill="#34D399" />
            </svg>
            <div className="w-full mt-2 bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 text-center backdrop-blur-md shadow-xl group-hover:border-emerald-400 transition">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase tracking-widest border border-emerald-500/30">
                La Guerra de las Máquinas
              </span>
              <h3 className="text-xl font-black text-white mt-1.5">Python</h3>
              <p className="text-xs text-emerald-200/70">6 Capítulos • 30 Niveles</p>
              <button className="mt-3 w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition tracking-wider shadow-lg shadow-emerald-500/30">
                EXPLORAR MUNDO
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VISTA 2: CAMINO DE NIVELES (mapa con desbloqueo progresivo)
  if (selectedRoute && !activeLesson) {
    const flat = selectedRoute.subWorlds.flatMap(sw => sw.lessons);
    const isOpen = (id: string) => {
      const i = flat.findIndex(l => l.id === id);
      return i <= 0 || completedLessons.includes(id) || completedLessons.includes(flat[i - 1].id);
    };
    const total = flat.length;
    const done = flat.filter(l => completedLessons.includes(l.id)).length;
    const nextId = flat.find(l => !completedLessons.includes(l.id) && isOpen(l.id))?.id;
    const offsets = [0, 44, 72, 44, 0, -44, -72, -44];
    const theme = selectedRoute.id === 'html' ? '#F59E0B' : selectedRoute.id === 'css' ? '#06B6D4' : '#10B981';

    return (
      <div className="w-full space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 glass rounded-3xl p-4">
          <button onClick={() => setSelectedRoute(null)} className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
            <ArrowLeft className="w-4 h-4" /> Islas
          </button>
          <div className="flex-1 min-w-[200px]">
            <h2 className="font-display text-2xl font-bold text-white">{selectedRoute.name} <span className="text-sm font-sans font-normal text-slate-400">· {selectedRoute.subtitle}</span></h2>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="flex-1 h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${(done / total) * 100}%`, background: theme }} /></div>
              <span className="text-xs font-black text-slate-300">{done}/{total}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedRoute.subWorlds.map((sub) => {
            const chapterDone = sub.lessons.every(l => completedLessons.includes(l.id));
            const chapterOpen = isOpen(sub.lessons[0].id);
            return (
              <section key={sub.id} className={`glass rounded-3xl p-5 ${chapterOpen ? '' : 'opacity-55'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-display text-xl font-bold text-slate-950" style={{ background: chapterOpen ? theme : '#334155' }}>
                    {chapterDone ? <CheckCircle2 className="w-6 h-6" /> : chapterOpen ? sub.number : <Lock className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="min-w-0"><div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: theme }}>Capítulo {sub.number}</div>
                    <h3 className="font-display text-lg font-bold text-white leading-tight">{sub.title.replace(/^Cap[ií]tulo \d+:\s*/i, '')}</h3>
                    <p className="text-xs text-slate-400">{sub.missionObjective}</p></div>
                </div>

                <div className="flex flex-col items-center gap-3 py-2">
                  {sub.lessons.map((lesson, i) => {
                    const isDone = completedLessons.includes(lesson.id);
                    const open = isOpen(lesson.id);
                    const isBoss = lesson.id.includes('boss');
                    const isNext = lesson.id === nextId;
                    return (
                      <button key={lesson.id} disabled={!open} onClick={() => startLesson(lesson)}
                        style={{ transform: `translateX(${offsets[i % offsets.length]}px)`, ['--btn-edge' as any]: isDone ? '#047857' : isBoss ? '#92400e' : '#312e81' }}
                        className={`btn-3d group relative flex flex-col items-center justify-center rounded-full font-display font-bold ${isBoss ? 'w-24 h-24 text-3xl' : 'w-[72px] h-[72px] text-xl'} ${
                          isDone ? 'bg-emerald-500 text-white' : !open ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : isBoss ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950' : 'bg-indigo-500 text-white'
                        } ${isNext ? 'pulse-ring ring-4 ring-amber-300/70' : ''}`}>
                        {isDone ? <CheckCircle2 className="w-7 h-7" /> : !open ? <Lock className="w-5 h-5" /> : isBoss ? '👑' : lesson.levelNumber}
                        {isNext && <span className="absolute -top-7 px-2 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black whitespace-nowrap pop-in">¡EMPIEZA!</span>}
                        <span className="pointer-events-none absolute left-full ml-3 hidden group-hover:block whitespace-nowrap z-20 bg-slate-950 border border-slate-700 text-white text-[11px] font-sans font-semibold px-3 py-1.5 rounded-xl">{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  }

  // VISTA 3: LABORATORIO DE CÓDIGO
  const hasBonusObjective = activeLesson?.bonusObjective ? checkObjective(activeLesson.bonusObjective.keywords) : false;

  return (
    <div className="w-full space-y-4 text-left select-none">
      
      <div className="flex items-center justify-between border-b border-indigo-950/80 pb-3">
        <button
          onClick={() => setActiveLesson(null)}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Camino
        </button>

        <div className="flex items-center gap-3">
          {completedLessons.includes(activeLesson?.id || '') ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
              <RotateCcw className="w-3.5 h-3.5" /> Modo Repaso Libre
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/40 font-black">
                <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                +{activeLesson?.coinReward} Monedas Base
                {hasBonusObjective && activeLesson?.bonusObjective && (
                  <span className="text-emerald-300 ml-1">(+{activeLesson.bonusObjective.rewardCoins} Bonus)</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-500/40 font-black">
                <Zap className="w-3.5 h-3.5 text-indigo-400" /> +{activeLesson?.xpReward} XP
              </div>
            </>
          )}
        </div>
      </div>

      {activeLesson && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* PANEL IZQUIERDO */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="bg-slate-900/90 border border-amber-500/30 p-4 rounded-3xl space-y-2 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5" /> Transmisión: {activeLesson.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">COM-LINK</span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed pt-1">
                {activeLesson.radioDialogue}
              </div>
            </div>

            <div className="bg-[#0D071E] border border-indigo-900/60 p-4 rounded-3xl space-y-2.5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-black text-indigo-300">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Instrucciones de la Misión:</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                {activeLesson.steps.map((step, idx) => (
                  <div key={idx} className="p-1.5 bg-slate-950/60 rounded-xl border border-slate-900">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* OBJETIVOS EN VIVO */}
            <div className="bg-slate-950/80 border border-indigo-950/80 p-4 rounded-3xl space-y-2 shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                OBJETIVOS TÁCTICOS · {activeLesson.mainObjectives.filter(o => checkObjective(o.keywords)).length}/{activeLesson.mainObjectives.length}
              </span>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden mb-1"><div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500" style={{ width: `${(activeLesson.mainObjectives.filter(o => checkObjective(o.keywords)).length / activeLesson.mainObjectives.length) * 100}%` }} /></div>

              {activeLesson.mainObjectives.map((obj) => {
                const isPassed = checkObjective(obj.keywords);
                return (
                  <div key={obj.id} className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    isPassed ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span>{isPassed ? '✔' : '⬛'}</span>
                      <span>{obj.label}</span>
                    </div>
                  </div>
                );
              })}

              {activeLesson.bonusObjective && (
                <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                  hasBonusObjective
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>{hasBonusObjective ? '✔' : '⬛'}</span>
                    <span>🪙 {activeLesson.bonusObjective.label}</span>
                  </div>
                  <span className="text-[10px] font-black text-amber-400">+{activeLesson.bonusObjective.rewardCoins} 🪙</span>
                </div>
              )}
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 flex items-center gap-1.5 font-bold"><Lightbulb className="w-4 h-4" /> Pistas ({hintLevel}/2)</span>
                <button onClick={() => setHintLevel(h => Math.min(2, h + 1))} disabled={hintLevel >= 2} className="btn-3d px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black disabled:opacity-40" style={{ ['--btn-edge' as any]: '#92400e' }}>
                  {hintLevel === 0 ? 'Pedir pista' : hintLevel === 1 ? 'Otra pista' : 'Sin más'}
                </button>
              </div>
              {hintLevel >= 1 && <div className="p-2.5 bg-indigo-950/40 border border-indigo-500/40 rounded-xl text-indigo-200 pop-in">💡 {activeLesson.hintTier2}</div>}
              {hintLevel >= 2 && <div className="p-2.5 bg-slate-950 border border-amber-500/40 rounded-xl text-amber-200 font-mono pop-in">🔑 {activeLesson.hintTier1}</div>}
            </div>
          </div>

          {/* PANEL DERECHO */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-950 border border-indigo-950/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-[#0C061A] px-4 py-2.5 border-b border-indigo-950/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2 font-mono">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-slate-300 font-bold text-[11px]">{activeLesson.title}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {activeLesson.module === 'python' && (
                    <button onClick={() => runPythonCode(studentCode)} className="px-3 py-1 rounded-lg bg-slate-800 text-emerald-300 font-bold text-[11px] hover:bg-slate-700">
                      ▶ Ejecutar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setStudentCode('');
                      setEvaluationFeedback(null);
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-slate-900 transition"
                  >
                    Limpiar
                  </button>

                  <button
                    onClick={handleVerifyCode}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/30"
                  >
                    <Send className="w-3.5 h-3.5" /> Comprobar <span className="hidden xl:inline opacity-70 font-mono text-[9px]">Ctrl+↵</span>
                  </button>
                </div>
              </div>

              <textarea
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                placeholder="<!-- Escribe tu código desde cero aquí... -->"
                className="w-full h-40 bg-transparent text-emerald-300 font-mono text-sm p-4 outline-none resize-none leading-relaxed placeholder-slate-700"
                spellCheck={false}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleVerifyCode(); return; }
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const target = e.target as HTMLTextAreaElement;
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    setStudentCode(prev => prev.substring(0, start) + '  ' + prev.substring(end));
                    setTimeout(() => {
                      target.selectionStart = target.selectionEnd = start + 2;
                    }, 0);
                  }
                }}
              />
            </div>

            {/* ESCENARIO VISUAL SEGÚN EL MÓDULO */}
            {activeLesson.module === 'html' ? (
              <CyberCityViewport 
                stage={activeLesson.visualStage}
                code={studentCode} 
                hasBonus={hasBonusObjective} 
              />
            ) : activeLesson.module === 'python' ? (
              <div className="bg-slate-950 border border-indigo-950/60 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                <div className="bg-slate-900 px-4 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                    <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" /> Consola de Salida de Python
                  </span>
                </div>
                <div className="p-3 bg-black/90 font-mono text-xs text-emerald-400 h-44 overflow-y-auto space-y-1">
                  <div className="text-slate-600 text-[11px]">
                    {pyStatus === 'loading' ? '⏳ Descargando Python (solo la primera vez)…' : pyStatus === 'running' ? '⚙️ Ejecutando…' : pyStatus === 'offline' ? '📴 Sin conexión: consola simulada (solo print y variables)' : 'Python real · Pyodide'}
                  </div>
                  {pythonConsoleOutput.map((out, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-slate-500">➜</span>
                      <span className={out.startsWith('⚠') ? 'text-rose-400' : ''}>{out}</span>
                    </div>
                  ))}
                  {pythonConsoleOutput.length === 0 && (
                    <div className="text-slate-500 italic">Pulsa ▶ Ejecutar para ver qué hace tu código.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden border border-slate-700 bg-white">
                <div className="bg-slate-900 text-[10px] font-mono text-slate-400 px-3 py-1">Vista previa en vivo</div>
                <iframe title="preview" sandbox="" srcDoc={activeLesson.module === 'css' ? buildCssPreview(studentCode) : studentCode} className="w-full h-64 bg-white" />
                {activeLesson.module === 'css' && <div className="bg-slate-900 text-[10px] text-slate-400 px-3 py-1">Elementos de práctica: <code className="text-amber-300">.escena</code> (contenedor), <code className="text-amber-300">.item</code> (6 cajas), <code className="text-amber-300">.boton</code>, h1 y p. Sin llaves {'{ }'} se aplica a .escena.</div>}
              </div>
            )}

            {evaluationFeedback && (
              <div className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
                evaluationFeedback.success
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              }`}>
                {evaluationFeedback.success ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                )}
                <span>{evaluationFeedback.msg}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE VICTORIA */}
      {showRewardModal && activeLesson && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="relative overflow-hidden bg-slate-900 border border-amber-500/50 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl pop-in">
            {isFirstTimeClear && Array.from({ length: 28 }).map((_, i) => (
              <span key={i} className="confetti" style={{ left: `${(i * 37) % 100}%`, background: ['#FBBF24', '#EC4899', '#6366F1', '#34D399', '#38BDF8'][i % 5], animationDelay: `${(i % 7) * 0.12}s` }} />
            ))}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-500 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
              {activeLesson.id.includes('boss') ? '👑' : '🏆'}
            </div>
            <div>
              <h3 className="text-xl font-black text-white">
                {isFirstTimeClear 
                  ? (activeLesson.id.includes('boss') ? '¡JEFE DE CAPÍTULO DERROTADO!' : '¡MISIÓN CUMPLIDA!') 
                  : '¡MISIÓN REPASADA!'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isFirstTimeClear
                  ? 'Objetivos completados y recompensas guardadas en tu inventario.'
                  : 'Has repasado el nivel. (Modo repaso libre).'}
              </p>
            </div>

            {isFirstTimeClear && (
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-0.5">
                    🎖️ LOGRO DESBLOQUEADO
                  </span>
                  <div className="text-sm font-black text-white">
                    {MASTER_ACHIEVEMENTS[activeLesson.id]?.title || activeLesson.title}
                  </div>
                </div>

                <div className="flex justify-center gap-3 py-1">
                  <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" /> +{earnedCoins} Monedas
                  </div>
                  <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs font-black text-indigo-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-indigo-400" /> +{activeLesson.xpReward} XP
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowRewardModal(false);
                setActiveLesson(null);
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow-lg shadow-indigo-600/30"
            >
              Continuar la Aventura ➔
            </button>
          </div>
        </div>
      )}

    </div>
  );
};