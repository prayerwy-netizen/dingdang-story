import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { Trash2, Maximize2, Archive, LayoutGrid, List, Download, UploadCloud, Wand2, MonitorPlay } from 'lucide-react';
import { Button } from './Button';

interface CanvasProps {
  images: GeneratedImage[];
  onSelect: (image: GeneratedImage) => void;
  selectedId: string | undefined;
  onDelete: (id: string) => void;
  onDownloadAll: () => void;
}

type ViewMode = 'grid' | 'table';

export const Canvas: React.FC<CanvasProps> = ({ 
  images, 
  onSelect, 
  selectedId, 
  onDelete, 
  onDownloadAll 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  return (
    <div className="flex flex-col h-full bg-black relative selection:bg-cine-accent selection:text-black">
      {/* Header / Toolbar */}
      <div className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-20 bg-gradient-to-b from-black via-black/90 to-transparent pointer-events-none">
         <div className="flex items-center gap-4 pointer-events-auto">
             <span className="text-cine-text-muted text-[10px] uppercase tracking-[0.2em] font-mono font-bold">
               画布 CANVAS / {images.length} 渲染
             </span>
         </div>
         
         <div className="flex items-center gap-2 pointer-events-auto">
             {/* View Toggles */}
             <div className="flex bg-zinc-900/80 rounded-sm p-0.5 border border-zinc-800 backdrop-blur-sm mr-4">
                 <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-[1px] transition-all ${viewMode === 'grid' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    title="网格视图"
                 >
                     <LayoutGrid size={14} />
                 </button>
                 <button 
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-[1px] transition-all ${viewMode === 'table' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    title="列表视图"
                 >
                     <List size={14} />
                 </button>
             </div>

             {images.length > 0 && (
                 <Button variant="ghost" size="sm" onClick={onDownloadAll} className="flex items-center gap-2 border border-zinc-800 bg-black/50 backdrop-blur hover:bg-zinc-800 text-[10px] h-8">
                     <Archive size={12} />
                     <span className="uppercase tracking-wider">批量下载 ZIP</span>
                 </Button>
             )}
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 pt-20 custom-scrollbar">
        {images.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-10 select-none animate-in fade-in duration-500">
                {/* Hero Section */}
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center justify-center gap-3">
                        <div className="w-3 h-3 bg-cine-accent rounded-sm shadow-[0_0_15px_rgba(212,252,121,0.6)]"></div>
                        DirectorDeck 导演台
                    </h1>
                    <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
                        专业的 AI 影视分镜生成工具。通过简单的指令与参考图，将您的创意转化为影视级的高清分镜画面。
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
                    {/* Step 1 */}
                    <div className="bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-lg flex items-start gap-4 hover:border-zinc-700 transition-colors group">
                        <div className="p-3 bg-black rounded-md border border-zinc-800 text-cine-accent group-hover:bg-cine-accent/10 transition-colors">
                            <UploadCloud size={20} />
                        </div>
                        <div>
                            <h3 className="text-zinc-200 font-bold text-sm mb-1">1. 导入参考素材</h3>
                            <p className="text-zinc-500 text-xs leading-relaxed">
                                将角色设计图或场景参考图拖拽至左侧 <span className="text-zinc-300 font-bold">素材库</span>。建议至少上传 1 张图片以确保风格统一。
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-lg flex items-start gap-4 hover:border-zinc-700 transition-colors group">
                        <div className="p-3 bg-black rounded-md border border-zinc-800 text-cine-accent group-hover:bg-cine-accent/10 transition-colors">
                            <LayoutGrid size={20} />
                        </div>
                        <div>
                            <h3 className="text-zinc-200 font-bold text-sm mb-1">2. 设定分镜模式</h3>
                            <p className="text-zinc-500 text-xs leading-relaxed">
                                在 <span className="text-zinc-300 font-bold">导演控制台</span> 选择 2x2 或 3x3 分镜布局，并确定画面比例 (如 16:9 电影画幅)。
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-lg flex items-start gap-4 hover:border-zinc-700 transition-colors group">
                        <div className="p-3 bg-black rounded-md border border-zinc-800 text-cine-accent group-hover:bg-cine-accent/10 transition-colors">
                            <Wand2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-zinc-200 font-bold text-sm mb-1">3. 输入导演指令</h3>
                            <p className="text-zinc-500 text-xs leading-relaxed">
                                描述镜头内容，或使用上方的快捷镜头预设（如特写、广角）来丰富画面细节。
                            </p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-lg flex items-start gap-4 hover:border-zinc-700 transition-colors group">
                        <div className="p-3 bg-black rounded-md border border-zinc-800 text-cine-accent group-hover:bg-cine-accent/10 transition-colors">
                            <MonitorPlay size={20} />
                        </div>
                        <div>
                            <h3 className="text-zinc-200 font-bold text-sm mb-1">4. 渲染与分析</h3>
                            <p className="text-zinc-500 text-xs leading-relaxed">
                                点击渲染生成 4K 分镜。在右侧 <span className="text-zinc-300 font-bold">监视器</span> 查看分镜大图或进行 AI 图像分析。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <>
                {viewMode === 'grid' ? (
                    // GRID VIEW - Dynamic Aspect Ratios
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-start">
                        {images.map((img) => (
                            <div 
                                key={img.id} 
                                className={`group relative bg-zinc-900 border transition-all duration-200 cursor-pointer overflow-hidden rounded-sm ${
                                    selectedId === img.id 
                                    ? 'border-cine-accent ring-1 ring-cine-accent/50 shadow-[0_0_15px_-3px_rgba(212,252,121,0.1)]' 
                                    : 'border-zinc-800 hover:border-zinc-600'
                                }`}
                                style={{ aspectRatio: img.aspectRatio.replace(':', '/') }}
                                onClick={() => onSelect(img)}
                            >
                                <img 
                                    src={img.url} 
                                    alt="render" 
                                    className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${selectedId === img.id ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}
                                />
                                
                                {/* Status Indicators */}
                                {img.fullGridUrl && (
                                    <div className="absolute top-2 right-2 z-10">
                                        <div className="w-1.5 h-1.5 bg-cine-accent shadow-[0_0_8px_rgba(212,252,121,0.8)] rounded-full" title="Grid Slice"></div>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] text-zinc-400 font-mono tracking-wider">{img.aspectRatio}</span>
                                        <button 
                                            className="text-zinc-500 hover:text-red-500 transition-colors p-1 hover:bg-white/5 rounded"
                                            onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
                                            title="删除"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // TABLE VIEW - Compact but Large Previews
                    <div className="space-y-4 max-w-6xl mx-auto pb-10">
                        {images.map((img) => (
                             <div 
                                key={img.id}
                                onClick={() => onSelect(img)}
                                className={`group flex flex-col sm:flex-row gap-6 p-4 bg-zinc-900/20 border rounded-sm transition-all cursor-pointer ${
                                    selectedId === img.id 
                                    ? 'border-cine-accent bg-zinc-900/40' 
                                    : 'border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/30'
                                }`}
                             >
                                 {/* Large Thumbnail - Dynamic Width based on Height, constrained max-width */}
                                 <div 
                                    className="flex-shrink-0 bg-black border border-zinc-800 relative overflow-hidden h-[280px] w-auto max-w-[45%] self-start rounded-sm"
                                    style={{ aspectRatio: img.aspectRatio.replace(':', '/') }}
                                 >
                                     <img src={img.url} alt="render" className="w-full h-full object-cover" />
                                     {img.fullGridUrl && (
                                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur text-[8px] text-cine-accent border border-cine-accent/20 rounded-sm font-mono tracking-wider">
                                            分镜切片
                                        </div>
                                     )}
                                 </div>

                                 {/* Metadata & Actions */}
                                 <div className="flex-1 flex flex-col min-w-0 py-1">
                                     <div className="flex items-start justify-between mb-3">
                                         <div className="space-y-1">
                                             <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">ID: {img.id.substring(0, 8)}</div>
                                             <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                                                 {new Date(img.timestamp).toLocaleTimeString()} • <span className="text-zinc-300">{img.aspectRatio}</span>
                                             </div>
                                         </div>
                                         <div className="flex gap-2">
                                             <a 
                                                href={img.url} 
                                                download={`cinescout-${img.id}.png`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 text-zinc-500 hover:text-white border border-transparent hover:border-zinc-700 rounded-sm transition-all bg-zinc-900"
                                                title="下载图片"
                                             >
                                                 <Download size={14} />
                                             </a>
                                             <button 
                                                onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
                                                className="p-2 text-zinc-500 hover:text-red-500 border border-transparent hover:border-red-900/30 rounded-sm transition-all bg-zinc-900"
                                                title="删除"
                                             >
                                                 <Trash2 size={14} />
                                             </button>
                                         </div>
                                     </div>
                                     
                                     <div className="flex-1 bg-black/40 border border-zinc-800/50 p-4 rounded-sm overflow-hidden group-hover:border-zinc-700 transition-colors">
                                         <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest block mb-2">生成提示词</span>
                                         <p className="text-zinc-300 text-sm font-mono leading-relaxed whitespace-pre-wrap">
                                             {img.prompt}
                                         </p>
                                     </div>
                                 </div>
                             </div>
                        ))}
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};