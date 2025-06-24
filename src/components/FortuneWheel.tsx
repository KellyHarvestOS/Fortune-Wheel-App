'use client';

import { useState, useEffect } from 'react';
import { Cog, Trash2, PlusCircle, CheckCircle, AlertTriangle, Clock, Dices, Trophy, Play, History as HistoryIcon, X, UserCircle } from 'lucide-react';

// Тип для сектора
interface Slice {
  id: number;
  label: string;
  percentage: number;
  color: string;
}

// Тип для записи в истории (теперь с именем)
interface HistoryEntry {
  id: number;
  label: string;
  timestamp: string; 
  color: string;
  name: string; // <-- НОВОЕ ПОЛЕ
}

const initialSlices: Slice[] = [
    { id: 1, label: '0', percentage: 33, color: '#00b5b5' },
    { id: 2, label: '3 н к', percentage: 7, color: '#42006e' },
    { id: 3, label: 'х2', percentage: 20, color: '#e00096' },
    { id: 4, label: '- все яд.', percentage: 10, color: '#007fb5' },
    { id: 5, label: 'всем +5', percentage: 5, color: '#610041' },
    { id: 6, label: 'х5', percentage: 10, color: '#42006e' },
    { id: 7, label: '30', percentage: 1, color: '#04062e' },
    { id: 8, label: 'до 1 н', percentage: 14, color: '#1b02bd' },
];


const getRandomNeonColor = () => {
    const neonColors = [
        '#39FF14', '#FF14BD', '#14FFEC', '#FF5F1F', '#F8FF14', 
        '#C32AFF', '#FF2A90', '#2AFFD6', '#2AD6FF'
    ];
    return neonColors[Math.floor(Math.random() * neonColors.length)];
};

// Компонент для отрисовки SVG колеса
const WheelSVG = ({ slices }: { slices: Slice[] }) => {
  const size = 384;
  const radius = size / 2 - 10;
  const center = size / 2;
  let accumulatedPercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = center + radius * Math.cos(2 * Math.PI * percent);
    const y = center + radius * Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${center} ${center})`}>
        {slices.map((slice) => {
          const [startX, startY] = getCoordinatesForPercent(accumulatedPercent / 100);
          const slicePercentage = slice.percentage;
          accumulatedPercent += slicePercentage;
          const [endX, endY] = getCoordinatesForPercent(accumulatedPercent / 100);
          const largeArcFlag = slicePercentage > 50 ? 1 : 0;
          const pathData = `M ${center},${center} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;

          const midAngleRad = 2 * Math.PI * (accumulatedPercent - slicePercentage / 2) / 100;
          const textX = center + (radius / 1.6) * Math.cos(midAngleRad);
          const textY = center + (radius / 1.6) * Math.sin(midAngleRad);
          const midAngleDeg = midAngleRad * (180 / Math.PI);

          let textRotation = 90 + midAngleDeg;
          if (midAngleDeg > 90 && midAngleDeg < 270) {
            textRotation += 180;
          }

          return (
            <g key={slice.id}>
              <path d={pathData} fill={slice.color} stroke="#1f2937" strokeWidth="2"/>
              <text
                transform={`rotate(${textRotation} ${textX} ${textY})`}
                x={textX}
                y={textY}
                fill="#fff" 
                textAnchor="middle"
                alignmentBaseline="middle"
                className="font-bold text-xs pointer-events-none select-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
              >
                {slice.label.toUpperCase()}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};


// ----- ОБНОВЛЕННЫЙ КОМПОНЕНТ СТАТИСТИКИ -----
const StatisticsModal = ({ history, onClose, onClear }: { history: HistoryEntry[], onClose: () => void, onClear: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-gray-900/80 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-600/30 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
            <HistoryIcon className="text-cyan-400" />
            История вращений
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto max-h-[60vh] pr-2 space-y-3">
          {history.length === 0 ? (
            <p className="text-center text-gray-400 py-10">История пуста. Пора крутить колесо!</p>
          ) : (
            // Отображаем имя вместе с результатом
            history.map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border-l-4" style={{ borderColor: entry.color }}>
                <div className="flex-grow">
                  <span className="font-bold text-white mr-2" style={{ color: entry.color }}>{entry.name}</span>
                  <span className="text-gray-200">выиграл(а): {entry.label}</span>
                </div>
                <span className="text-sm text-gray-400 flex-shrink-0 ml-4">
                  {new Date(entry.timestamp).toLocaleString('ru-RU')}
                </span>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <button 
            onClick={onClear} 
            className="mt-6 w-full flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-red-500/50 transition-all duration-300"
          >
            <Trash2 size={20} />
            Очистить историю
          </button>
        )}
      </div>
    </div>
  );
};


export default function FortuneWheel() {
  const [slices, setSlices] = useState<Slice[]>(initialSlices);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningSlice, setWinningSlice] = useState<Slice | null>(null);
  const [spinDuration, setSpinDuration] = useState(8);
  
  // ----- НОВЫЙ СТЕЙТ ДЛЯ ИМЕНИ -----
  const [currentName, setCurrentName] = useState('');

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('wheelHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      localStorage.removeItem('wheelHistory');
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('wheelHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const addSlice = () => setSlices([...slices, { id: Date.now(), label: 'НОВЫЙ', percentage: 0, color: getRandomNeonColor() }]);
  const removeSlice = (id: number) => setSlices(slices.filter((s) => s.id !== id));
  const updateSlice = (id: number, field: keyof Omit<Slice, 'id'>, value: string | number) => {
    setSlices(slices.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const totalPercentage = slices.reduce((sum, slice) => sum + (Number(slice.percentage) || 0), 0);
  
  // Проверка, можно ли крутить (теперь включает проверку имени)
  const canSpin = !isSpinning && totalPercentage === 100 && currentName.trim() !== '';

  const handleSpin = () => {
    if (!canSpin) return;

    setIsSpinning(true);
    setWinningSlice(null);

    const randomPercent = Math.random() * 100;
    let accumulatedPercent = 0;
    const winner = slices.find(slice => {
      accumulatedPercent += slice.percentage;
      return randomPercent <= accumulatedPercent;
    }) || slices[slices.length - 1];

    let accumulatedAngle = 0;
    for (const slice of slices) {
      if (slice.id === winner.id) {
        const winnerAngleSize = (winner.percentage / 100) * 360;
        const randomAngleInWinner = Math.random() * (winnerAngleSize - 10) + 5;
        const targetAngle = accumulatedAngle + randomAngleInWinner;
        const fullSpins = 5;
        const finalRotation = rotation - (rotation % 360) + (360 * fullSpins) + (360 - targetAngle);
        setRotation(finalRotation);
        break;
      }
      accumulatedAngle += (slice.percentage / 100) * 360;
    }

    setTimeout(() => {
      setIsSpinning(false);
      setWinningSlice(winner);

      // ----- ДОБАВЛЕНИЕ ЗАПИСИ В ИСТОРИЮ С ИМЕНЕМ -----
      const newHistoryEntry: HistoryEntry = {
        id: Date.now(),
        label: winner.label,
        timestamp: new Date().toISOString(),
        color: winner.color,
        name: currentName.trim() // Сохраняем имя
      };
      setHistory(prevHistory => [newHistoryEntry, ...prevHistory]);

    }, spinDuration * 1000);
  };
  
  const clearHistory = () => {
    if(window.confirm('Вы уверены, что хотите полностью очистить историю вращений?')) {
        setHistory([]);
        setShowStats(false);
    }
  };

  return (
    <>
      {showStats && <StatisticsModal history={history} onClose={() => setShowStats(false)} onClear={clearHistory} />}

      <div className="min-h-screen w-full  flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 p-4 md:p-8 text-white">
        
        <div className="w-full lg:w-1/2 flex flex-col items-center gap-6">

          <div className="relative group w-fit mx-auto ">
            <h2 className="flex items-center justify-center gap-4 text-4xl md:text-7xl font-bold py-4">
              <Dices className="text-cyan-300 animate-[pulse-glow_4s_ease-in-out_infinite]" size={60} />
              <span className="tracking-widest uppercase bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-[aurora_4s_linear_infinite] drop-shadow-lg select-none">
                Фортуна
              </span>
            </h2>
            <div className="absolute top-0 left-0 w-full h-full before:content-[''] before:absolute before:top-0 before:left-0 before:w-0 before:h-0 before:border-t-2 before:border-l-2 before:border-cyan-400 before:opacity-0 before:transition-all before:duration-300 group-hover:before:opacity-100 group-hover:before:w-1/4 group-hover:before:h-1/3 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0 after:border-b-2 after:border-r-2 after:border-fuchsia-500 after:opacity-0 after:transition-all after:duration-300 group-hover:after:opacity-100 group-hover:after:w-1/4 group-hover:after:h-1/3 select-none "></div>
          </div>
          
          {winningSlice && !isSpinning && (
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md border border-cyan-400/50 shadow-[0_0_20px_rgba(0,255,255,0.3)] text-cyan-300 px-6 py-4 rounded-lg relative my-4 z-20 animate-fade-in">
              <Trophy className="text-cyan-400" size={40} />
              <div>
                <strong className="font-bold block text-lg">ПРИЗ ПОЛУЧЕН!</strong>
                <span className="block text-white">Вы выиграли: {winningSlice.label}</span>
              </div>
            </div>
          )}
          <div className="relative w-96 h-96 flex items-center justify-center mt-4 drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]">
            <img src="/14.png" alt="Floating Crystal" className=" select-none absolute top-1/2 -left-45 -translate-y-1/3 w-38 h-38 opacity-80 animate-float pointer-events-none filter drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" style={{ animationDelay: '-5s' }} />
            <img src="/14.png" alt="Floating Crystal" className=" select-none absolute top-1/4 -left-30 -translate-y-1/1 w-28 h-28 opacity-80 animate-float pointer-events-none filter drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" style={{ animationDelay: '-4s' }} />
            <img src="/14.png" alt="Floating Crystal" className=" select-none absolute top-1/1 -left-20 -translate-y-1/1 w-22 h-22 opacity-80 animate-float pointer-events-none filter drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" style={{ animationDelay: '-2s' }} />
            <img src="/14.png" alt="Floating Crystal" className="select-none absolute top-1/3 -right-24 -translate-y-1/2 w-31 h-31 opacity-80 animate-float pointer-events-none filter drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" style={{ animationDelay: '-3s' }} />
            <img src="/14.png" alt="Floating Crystal" className="select-none absolute top-1/1 -right-24 -translate-y-1/2 w-22 h-22 opacity-80 animate-float pointer-events-none filter drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" style={{ animationDelay: '-4s' }} />
            <img src="/14.png" alt="Floating Crystal" className="select-none absolute top-1/2 -right-50 -translate-y-1/3 w-38 h-38 opacity-80 animate-float pointer-events-none filter drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" style={{ animationDelay: '-4s' }} />
            <img src="/11.png" alt="Указатель" className="select-none absolute top-[-32px] left-1/2 -translate-x-1/2 w-25 h-auto z-10 pointer-events-none  drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"/>
            <div
              className="w-full h-full transition-transform"
              style={{ transform: `rotate(${rotation}deg)`, transitionTimingFunction: `cubic-bezier(0.2, 0.8, 0.2, 1)`, transitionDuration: `${spinDuration}s` }}
            >
              <WheelSVG slices={slices} />
            </div>
          </div>
          
          {/* ----- БЛОК УПРАВЛЕНИЯ ВРАЩЕНИЕМ С ПОЛЕМ ИМЕНИ ----- */}
          <div className="mt-8 w-full max-w-sm flex flex-col items-center gap-4">
            <div className="relative w-full">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" size={20} />
              <input 
                type="text"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                placeholder="Введите ваше имя для старта"
                className="w-full p-3 pl-10 bg-slate-900/70 border border-slate-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                disabled={isSpinning}
              />
            </div>

            <div className="w-full flex items-center gap-4">
              <button
                onClick={handleSpin}
                disabled={!canSpin}
                className="flex-grow flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] hover:scale-[1.05] active:scale-100 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100"
              >
                {isSpinning ? <>
                  <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
                  ВРАЩЕНИЕ...
                  </> : <>
                  <Play size={24} />
                  КРУТИТЬ!
                  </>
                }
              </button>
              <button
                onClick={() => setShowStats(true)}
                className="p-4 bg-gray-800/50 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:bg-purple-600/50 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-purple-500/40"
                aria-label="Показать историю вращений"
              >
                <HistoryIcon size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-600/20">
          <h3 className="flex items-center gap-3 text-3xl font-bold mb-8 text-white">
            <Cog className="text-fuchsia-400" size={32} />
            <span className="select-none bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(168,85,247,0.5)]">
              Настройки Секторов
            </span>
          </h3>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2"> 
            {slices.map((slice) => (
              <div key={slice.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-transparent hover:border-purple-500 focus-within:border-purple-500 transition-all duration-300">
                <div className="relative group">
                  <input 
                    type="color" 
                    value={slice.color} 
                    onChange={(e) => updateSlice(slice.id, 'color', e.target.value)} 
                    className="w-10 h-10 border-none cursor-pointer p-0 rounded-md appearance-none bg-transparent"
                  />
                  <div className="absolute inset-0 rounded-md border border-slate-600 group-hover:border-purple-500 transition-all pointer-events-none"></div>
                </div>

                <input 
                  type="text" 
                  value={slice.label} 
                  onChange={(e) => updateSlice(slice.id, 'label', e.target.value)} 
                  placeholder="Название" 
                  className="flex-grow p-2 bg-slate-900/70 border border-slate-700 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" 
                />
                
                <input 
                  type="number" 
                  value={slice.percentage} 
                  onChange={(e) => updateSlice(slice.id, 'percentage', parseInt(e.target.value, 10) || 0)} 
                  placeholder="%" 
                  className="w-20 p-2 bg-slate-900/70 border border-slate-700 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" 
                  min="0"
                />
                
                <button 
                  onClick={() => removeSlice(slice.id)} 
                  className="p-2 text-red-500 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  aria-label="Удалить сектор"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={addSlice} 
            className="select-none w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-bold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_20px_rgba(168,85,247,0.8)] hover:scale-[1.02] transition-all duration-300"
          >
            <PlusCircle size={20} />
            Добавить сектор
          </button>
          
          <div className="mt-8 border-t border-purple-500/20 pt-6 space-y-6 select-none">
            <div>
              <label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium text-purple-300 mb-2">
                <Clock size={16} />
                Длительность вращения (сек):
              </label>
              <input
                type="number" id="duration" value={spinDuration}
                onChange={(e) => setSpinDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
                min="1" 
                className="block w-full p-2 bg-slate-900/70 border border-slate-700 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div className={`
              flex items-center gap-3 text-lg font-bold p-4 rounded-lg transition-all
              ${totalPercentage !== 100 
                ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                : 'bg-green-500/10 text-green-400 border border-green-500/30'}`
            }>
              {totalPercentage !== 100 
                ? <AlertTriangle className="flex-shrink-0" /> 
                : <CheckCircle className="flex-shrink-0" />
              }
              <div>
                <span>Сумма процентов: {totalPercentage}%</span>
                {totalPercentage !== 100 && (
                  <p className="text-xs font-normal text-red-400/80 select-none">
                    Сумма должна быть ровно 100% для старта.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}