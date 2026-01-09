import React from 'react';
import { Button } from './Button';
import { AspectRatio, ImageSize, GenerationMode } from '../types';
import { Grid2X2, Grid3X3, Zap, Layers, Lock } from 'lucide-react';

interface DirectorDeckProps {
  mode: GenerationMode;
  setMode: (mode: GenerationMode) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  imageSize: ImageSize;
  setImageSize: (size: ImageSize) => void;
  prompt: string;
  setPrompt: (text: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onEnhancePrompt?: () => void;
}

const CINEMATIC_PRESETS = [
    { label: "特写 Close-up", value: "extreme close-up shot, detailed facial features, depth of field" },
    { label: "中景 Medium", value: "medium shot, waist up, interaction focus" },
    { label: "广角 Wide", value: "wide angle shot, establishing shot, environment context" },
    { label: "顶视 Top Down", value: "god's eye view, top-down perspective, high angle" },
    { label: "低昂 Low Angle", value: "low angle shot, looking up, imposing presence" },
    { label: "赛博光 Cyberpunk", value: "neon lighting, blue and pink rim lights, dark atmosphere" },
    { label: "自然光 Natural", value: "soft natural lighting, golden hour, realistic shadows" },
    { label: "电影感 Cinematic", value: "anamorphic lens, film grain, color graded, cinematic lighting" },
];

export const DirectorDeck: React.FC<DirectorDeckProps> = ({
  mode,
  setMode,
  aspectRatio,
  setAspectRatio,
  imageSize,
  setImageSize,
  prompt,
  setPrompt,
  onGenerate,
  isGenerating,
}) => {
  
  // Calculate display resolution based on mode
  const getPerPanelResolution = () => {
      if (mode === GenerationMode.GRID_2x2) {
          return "FHD 1080p (Per Panel)";
      } else if (mode === GenerationMode.GRID_3x3) {
          return "HD 720p (Per Panel)";
      }
      return "4K Source";
  };

  const addPreset = (value: string) => {
      setPrompt((prev) => {
          const prefix = prev.trim().length > 0 ? prev.trim() + ", " : "";
          return prefix + value;
      });
  };

  return (
    <div className="flex flex-col h-full space-y-6 select-none">
      <div className="flex items-center justify-between border-t border-zinc-800/50 pt-5 mt-2">
         <span className="text-cine-text-muted text-[10px] uppercase tracking-[0.2em] font-mono font-bold">02. 导演控制台</span>
         {isGenerating && (
             <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 bg-cine-accent rounded-full animate-pulse"></div>
                 <span className="text-[9px] text-cine-accent font-mono tracking-widest">渲染中</span>
             </div>
         )}
      </div>

      {/* Composition Group */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
            <label className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-3 bg-zinc-700 rounded-sm"></span>
                分镜构图
            </label>
        </div>
        
        <div className="grid grid-cols-1 gap-3 p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-sm">
             {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-1">
                {[
                    { m: GenerationMode.GRID_2x2, icon: Grid2X2, label: "2x2 分镜 (4图)" },
                    { m: GenerationMode.GRID_3x3, icon: Grid3X3, label: "3x3 分镜 (9图)" }
                ].map((item) => (
                    <button
                        key={item.label}
                        onClick={() => setMode(item.m)}
                        className={`flex flex-col items-center justify-center gap-1 py-3 rounded-[2px] border transition-all ${
                            mode === item.m 
                            ? 'bg-zinc-800 border-cine-accent text-cine-accent shadow-sm' 
                            : 'bg-black border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                        }`}
                    >
                        <item.icon size={16} />
                        <span className="text-[10px] uppercase tracking-wider font-mono">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Aspect Ratio */}
             <div className="space-y-1.5 pt-2 border-t border-dashed border-zinc-800">
                <span className="text-[8px] text-zinc-600 font-mono uppercase">画面比例 (Aspect Ratio)</span>
                <div className="grid grid-cols-3 gap-1">
                    {Object.values(AspectRatio).map((ar) => (
                        <button
                            key={ar}
                            onClick={() => setAspectRatio(ar)}
                            className={`text-[9px] h-6 border rounded-[1px] font-mono transition-colors flex items-center justify-center ${
                                aspectRatio === ar 
                                ? 'border-zinc-600 text-white bg-zinc-700' 
                                : 'border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400 bg-black'
                            }`}
                        >
                            {ar}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Quality Group */}
      <div className="space-y-2">
        <label className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-3 bg-zinc-700 rounded-sm"></span>
            输出画质 (切片后)
        </label>
        <div className="flex p-2 bg-black border border-zinc-800 rounded-sm items-center justify-between opacity-80 cursor-not-allowed">
            <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest flex items-center gap-2">
                <Lock size={8} /> 锁定
            </span>
            <span className="text-[9px] text-cine-accent font-bold font-mono tracking-widest">{getPerPanelResolution()}</span>
        </div>
      </div>

      {/* Prompt Area */}
      <div className="space-y-2 flex-1 flex flex-col min-h-[220px]">
        <div className="flex justify-between items-end">
            <label className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-3 bg-cine-accent rounded-sm"></span>
                导演指令
            </label>
        </div>

        {/* Cinematic Presets */}
        <div className="flex flex-wrap gap-1.5 pb-1">
            {CINEMATIC_PRESETS.map((preset) => (
                <button
                    key={preset.label}
                    onClick={() => addPreset(preset.value)}
                    className="text-[9px] px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-[2px] hover:border-zinc-600 hover:text-white transition-colors"
                    title={preset.value}
                >
                    {preset.label}
                </button>
            ))}
        </div>
        
        <div className="relative flex-1 group">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="// 在此描述镜头画面，或使用上方预设..."
                className="w-full h-full absolute inset-0 bg-black border border-zinc-800 rounded-sm p-3 text-sm text-zinc-300 focus:border-cine-accent focus:ring-0 resize-none font-mono leading-relaxed placeholder:text-zinc-700 custom-scrollbar focus:bg-zinc-900/50 transition-colors"
                spellCheck={false}
            />
        </div>
      </div>

      {/* Generate Button */}
      <Button 
        variant="accent" 
        className="w-full py-4 tracking-[0.2em] uppercase font-mono text-[10px] font-bold relative overflow-hidden group shadow-[0_0_20px_-5px_rgba(212,252,121,0.3)] hover:shadow-[0_0_25px_-5px_rgba(212,252,121,0.5)] transition-all"
        onClick={onGenerate}
        disabled={isGenerating || !prompt.trim()}
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
            {isGenerating ? <Zap size={14} className="animate-spin" /> : <Layers size={14} />}
            {isGenerating ? '渲染进行中...' : '执行渲染 (EXECUTE)'}
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </Button>
    </div>
  );
};