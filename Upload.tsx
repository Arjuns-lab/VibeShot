import React, { useState, useRef, ChangeEvent, useEffect, useCallback, useMemo } from 'react';
import { UploadCloudIcon, TextIcon, TrashIcon, UndoIcon, RedoIcon } from '../constants';
import { TextOverlay } from '../types';

interface UploadProps {
  onPost: (data: { videoFile: File; caption: string; textOverlays: TextOverlay[] }) => void;
  onCancel: () => void;
}

type EditorState = {
  textOverlays: TextOverlay[];
  startTime: number;
  endTime: number;
};

const FILTERS = [
  { name: 'None', class: '' },
  { name: 'Classic', class: 'grayscale' },
  { name: 'Sunset', class: 'sepia' },
  { name: 'Techno', class: 'invert' },
  { name: 'Vivid', class: 'saturate-200 contrast-125' },
  { name: 'Muted', class: 'saturate-50 contrast-75 brightness-125' },
];

const Upload: React.FC<UploadProps> = ({ onPost, onCancel }) => {
  const [step, setStep] = useState<'select' | 'edit' | 'post'>('select');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0].class);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isTrimming, setIsTrimming] = useState<'start' | 'end' | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Text overlay state
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [draggingOverlay, setDraggingOverlay] = useState<{ id: string, offsetX: number, offsetY: number } | null>(null);

  // Undo/Redo state
  const [history, setHistory] = useState<EditorState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trimBarRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const uploadIntervalRef = useRef<number | null>(null);

  const selectedOverlay = useMemo(() => {
    return textOverlays.find(o => o.id === selectedOverlayId);
  }, [textOverlays, selectedOverlayId]);
  
  const recordHistory = useCallback((newState: EditorState) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newState);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  const applyHistoryState = (state: EditorState) => {
    if (!state) return;
    setTextOverlays(state.textOverlays);
    setStartTime(state.startTime);
    setEndTime(state.endTime);
    if (videoRef.current) {
      videoRef.current.currentTime = state.startTime;
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      applyHistoryState(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      applyHistoryState(history[newIndex]);
    }
  };


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStep('edit');
    } else {
      alert('Please select a valid video file.');
    }
  };

  const handleVideoMetadata = () => {
    if (videoRef.current) {
        const videoDuration = videoRef.current.duration;
        setDuration(videoDuration);
        const initialEndTime = videoDuration;
        setEndTime(initialEndTime);

        // Set initial history state
        const initialState: EditorState = {
          textOverlays: [],
          startTime: 0,
          endTime: initialEndTime,
        };
        setHistory([initialState]);
        setHistoryIndex(0);
    }
  };
  
  const handleCancelUpload = () => {
    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current);
      uploadIntervalRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handlePost = () => {
    if (!videoFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    uploadIntervalRef.current = window.setInterval(() => {
        setUploadProgress(prev => {
            const newProgress = prev + Math.floor(Math.random() * 10) + 5;
            if (newProgress >= 100) {
                if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
                // The onPost call will cause this component to unmount,
                // so we don't need to manually reset isUploading state.
                onPost({ videoFile, caption, textOverlays });
                return 100;
            }
            return newProgress;
        });
    }, 200);
  };
  
  const handleBackToSelect = () => {
    setVideoFile(null);
    setPreviewUrl(null);
    setSelectedFilter(FILTERS[0].class);
    setCaption('');
    setStartTime(0);
    setEndTime(0);
    setDuration(0);
    setTextOverlays([]);
    setSelectedOverlayId(null);
    setHistory([]);
    setHistoryIndex(-1);
    if(fileInputRef.current) fileInputRef.current.value = "";
    setStep('select');
  };

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  // Trimming logic
  const handleTrimChange = useCallback((clientX: number) => {
    if (!trimBarRef.current || !duration || !isTrimming) return;

    const bar = trimBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - bar.left) / bar.width));
    const time = percent * duration;
    
    if (isTrimming === 'start') {
        if (time < endTime - 0.5) { // Ensure start is before end with a small buffer
            setStartTime(time);
            if (videoRef.current) videoRef.current.currentTime = time;
        }
    } else if (isTrimming === 'end') {
        if (time > startTime + 0.5) { // Ensure end is after start
            setEndTime(time);
            if (videoRef.current) videoRef.current.currentTime = time;
        }
    }
  }, [duration, endTime, startTime, isTrimming]);

  const handleMouseMove = useCallback((e: MouseEvent) => { handleTrimChange(e.clientX); }, [handleTrimChange]);
  const handleTouchMove = useCallback((e: TouchEvent) => { handleTrimChange(e.touches[0].clientX); }, [handleTrimChange]);
  const handleMouseUp = useCallback(() => {
      if (isTrimming) {
          recordHistory({ textOverlays, startTime, endTime });
      }
      setIsTrimming(null);
  }, [isTrimming, textOverlays, startTime, endTime, recordHistory]);

  useEffect(() => {
    if (isTrimming) {
        window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove); window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove); window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isTrimming, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Video playback loop within trim range
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
        if (video.currentTime >= endTime) {
            video.currentTime = startTime;
            video.play();
        }
    };
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [startTime, endTime]);
  
  // Text Overlay Functions
  const handleAddText = () => {
    const newOverlay: TextOverlay = {
      id: `text-${Date.now()}`,
      text: 'Sample Text',
      color: '#FFFFFF',
      fontSize: 28,
      fontFamily: 'Nunito',
      position: { x: 50, y: 50 },
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, duration),
    };
    const newOverlays = [...textOverlays, newOverlay];
    setTextOverlays(newOverlays);
    setSelectedOverlayId(newOverlay.id);
    recordHistory({ textOverlays: newOverlays, startTime, endTime });
  };
  
  const handleSaveOverlay = (updatedOverlay: TextOverlay) => {
    const newOverlays = textOverlays.map(o => o.id === updatedOverlay.id ? updatedOverlay : o);
    setTextOverlays(newOverlays);
    setSelectedOverlayId(null);
    recordHistory({ textOverlays: newOverlays, startTime, endTime });
  };

  const handleUpdateOverlayPosition = (id: string, position: { x: number; y: number }) => {
    setTextOverlays(textOverlays.map(o => o.id === id ? { ...o, position } : o));
  };
  
  const handleDeleteOverlay = (id: string) => {
    const newOverlays = textOverlays.filter(o => o.id !== id);
    setTextOverlays(newOverlays);
    setSelectedOverlayId(null);
    recordHistory({ textOverlays: newOverlays, startTime, endTime });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.stopPropagation();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const rect = target.getBoundingClientRect();
    setDraggingOverlay({
        id,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
    });
    setSelectedOverlayId(id);
  };
  
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingOverlay || !videoContainerRef.current) return;
    e.stopPropagation();
    const containerRect = videoContainerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - draggingOverlay.offsetX;
    const newY = e.clientY - containerRect.top - draggingOverlay.offsetY;

    const xPercent = (newX / containerRect.width) * 100;
    const yPercent = (newY / containerRect.height) * 100;

    handleUpdateOverlayPosition(draggingOverlay.id, { 
        x: Math.max(0, Math.min(100, xPercent + (draggingOverlay.offsetX / containerRect.width * 100) )),
        y: Math.max(0, Math.min(100, yPercent + (draggingOverlay.offsetY / containerRect.height * 100) ))
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if(draggingOverlay) {
        recordHistory({ textOverlays, startTime, endTime });
    }
    setDraggingOverlay(null);
  };


  const renderHeader = () => {
    const baseButtonClass = "text-lg px-3 py-1 rounded-full transition-colors font-display";
    const primaryButtonClass = `${baseButtonClass} font-bold text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10`;
    const secondaryButtonClass = `${baseButtonClass} hover:bg-[var(--text-color)]/10 font-semibold`;
    
    switch (step) {
      case 'edit':
        return (
          <>
            <div className="flex justify-start">
              <button onClick={handleBackToSelect} className={secondaryButtonClass}>Back</button>
            </div>
            <div className="flex justify-center items-center gap-4">
               <button onClick={handleUndo} disabled={historyIndex <= 0} className="disabled:opacity-30 p-1 rounded-full hover:bg-[var(--text-color)]/10" aria-label="Undo">
                    <UndoIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-black font-display">Editor</h1>
                <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="disabled:opacity-30 p-1 rounded-full hover:bg-[var(--text-color)]/10" aria-label="Redo">
                    <RedoIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="flex justify-end">
                <button onClick={() => setStep('post')} className={primaryButtonClass}>Next</button>
            </div>
          </>
        );
      case 'post':
        return (
          <>
            <div className="flex justify-start">
              <button onClick={() => setStep('edit')} className={secondaryButtonClass}>Back</button>
            </div>
            <h1 className="text-2xl font-black font-display text-center col-start-2">New Post</h1>
            <div className="flex justify-end">
                <button onClick={handlePost} disabled={!videoFile || isUploading} className={`${primaryButtonClass} disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed`}>Post</button>
            </div>
          </>
        );
      case 'select':
      default:
        return (
          <>
            <div className="flex justify-start">
              <button onClick={onCancel} className={secondaryButtonClass}>Cancel</button>
            </div>
            <h1 className="text-2xl font-black font-display text-center col-start-2">New Post</h1>
            <div /> {/* Placeholder for alignment */}
          </>
        );
    }
  };

  const renderContent = () => {
    if (step === 'select') {
      return (
        <div 
          className="w-full h-64 bg-[var(--frame-bg-color)] rounded-3xl flex items-center justify-center cursor-pointer relative overflow-hidden border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent-color)] transition-colors hover:bg-[var(--accent-color)]/5"
          onClick={() => fileInputRef.current?.click()}
          role="button" tabIndex={0} aria-label="Select video to upload"
        >
          <div className="text-center text-[var(--text-color)] opacity-80 flex flex-col items-center">
            <UploadCloudIcon className="w-12 h-12 mb-2" />
            <p className="font-bold font-display text-xl">Tap to select video</p>
            <p className="text-sm">Max file size 100MB</p>
          </div>
          <input type="file" accept="video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" aria-hidden="true" />
        </div>
      );
    }

    if (step === 'edit' || step === 'post') {
      const startPercent = duration ? (startTime / duration) * 100 : 0;
      const endPercent = duration ? (endTime / duration) * 100 : 100;

      return (
        <>
          <div ref={videoContainerRef} className="w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden relative border-4 border-[var(--border-color)]">
            {previewUrl && (
              <video 
                ref={videoRef}
                src={previewUrl} muted loop autoPlay playsInline
                className={`w-full h-full object-cover transition-all duration-300 ${selectedFilter}`}
                onLoadedMetadata={handleVideoMetadata}
              />
            )}
            {textOverlays.map(overlay => {
              if (currentTime >= overlay.startTime && currentTime <= overlay.endTime) {
                return (
                  <div key={overlay.id}
                    className={`absolute p-2 cursor-grab select-none whitespace-pre-wrap text-center ${selectedOverlayId === overlay.id ? 'border-2 border-dashed border-[var(--accent-color)]' : ''}`}
                    style={{
                      left: `${overlay.position.x}%`, top: `${overlay.position.y}%`,
                      transform: 'translate(-50%, -50%)', color: overlay.color,
                      fontSize: `${overlay.fontSize}px`, fontFamily: overlay.fontFamily,
                      fontWeight: '900', textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                    }}
                    onPointerDown={(e) => handlePointerDown(e, overlay.id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  >
                      {overlay.text}
                  </div>
                )
              }
              return null;
            })}
          </div>
          
          {step === 'edit' && (
            <div className="w-full space-y-4 font-display">
               <button onClick={handleAddText} className="w-full flex items-center justify-center gap-2 py-2.5 text-lg font-bold border-2 border-[var(--border-color)] text-[var(--text-color)] rounded-xl transition-colors hover:bg-[var(--text-color)]/10">
                    <TextIcon className="w-6 h-6" /> Add Text
                </button>
              <div>
                  <label className="font-bold text-lg">Filters</label>
                  <div className="filter-list flex items-center gap-2 overflow-x-auto pt-2 pb-1">
                      {FILTERS.map(filter => (
                          <div key={filter.name} onClick={() => setSelectedFilter(filter.class)} className="flex flex-col items-center gap-1 cursor-pointer">
                              <div className={`w-16 h-24 bg-[var(--bg-color)] rounded-xl overflow-hidden border-2 transition-all ${selectedFilter === filter.class ? 'border-[var(--accent-color)]' : 'border-transparent'}`}>
                                  {previewUrl && <video src={previewUrl} muted className={`w-full h-full object-cover ${filter.class}`} />}
                              </div>
                              <span className={`text-sm font-semibold ${selectedFilter === filter.class ? 'font-bold text-[var(--accent-color)]' : 'text-[var(--text-color)]'}`}>{filter.name}</span>
                          </div>
                      ))}
                  </div>
              </div>
              <div>
                 <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-lg">Trim</label>
                    <span className="text-sm font-bold text-[var(--secondary-color)]">
                        {(endTime - startTime).toFixed(1)}s
                    </span>
                 </div>
                 <div className="trim-bar" ref={trimBarRef}>
                    <div className="trim-track">
                        <div className="absolute h-full bg-[var(--accent-color)]/50 rounded-lg" style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }} />
                        <div className="trim-handle" style={{ left: `${startPercent}%`, transform: 'translate(-50%, -50%)' }} onMouseDown={() => setIsTrimming('start')} onTouchStart={() => setIsTrimming('start')} />
                        <div className="trim-handle" style={{ left: `${endPercent}%`, transform: 'translate(-50%, -50%)' }} onMouseDown={() => setIsTrimming('end')} onTouchStart={() => setIsTrimming('end')} />
                    </div>
                 </div>
              </div>
            </div>
          )}

          {step === 'post' && (
            <div className="flex flex-col gap-2 w-full font-display">
              <label htmlFor="caption" className="font-bold text-lg">Caption</label>
              <textarea
                id="caption" value={caption} onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe your video..."
                className="flex-grow bg-[var(--frame-bg-color)]/80 border-2 border-[var(--border-color)] rounded-2xl p-3 text-[var(--text-color)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-medium text-base transition-colors duration-300"
                rows={4}
              />
            </div>
          )}
        </>
      );
    }
    return null; // Should not happen
  };
  
  const TextEditorPanel = () => {
    if (!selectedOverlay) return null;

    const [localOverlay, setLocalOverlay] = useState<TextOverlay>(selectedOverlay);
    const handleLocalUpdate = (updates: Partial<TextOverlay>) => {
        setLocalOverlay(prev => ({...prev, ...updates}));
    }

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex justify-center items-end" onClick={() => setSelectedOverlayId(null)}>
            <div className="bg-[var(--frame-bg-color)] w-full rounded-t-3xl p-4 flex flex-col gap-4 font-display" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center">Edit Text</h3>
                <textarea
                    value={localOverlay.text}
                    onChange={(e) => handleLocalUpdate({ text: e.target.value })}
                    className="w-full bg-[var(--bg-color)] border-2 border-[var(--border-color)] rounded-xl p-2 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                    rows={2}
                    style={{ fontFamily: localOverlay.fontFamily }}
                />
                <div className="flex flex-col gap-1">
                    <label className="font-semibold text-sm">Font Family</label>
                    <div className="flex gap-2 bg-[var(--bg-color)] p-1 rounded-xl">
                        <button
                            onClick={() => handleLocalUpdate({ fontFamily: 'Nunito' })}
                            className={`w-full py-2 font-bold rounded-lg transition-colors ${localOverlay.fontFamily === 'Nunito' ? 'bg-[var(--accent-color)] text-white' : 'bg-[var(--frame-bg-color)] hover:bg-[var(--border-color)]'}`}
                            style={{ fontFamily: 'Nunito' }}
                        >
                            Nunito
                        </button>
                        <button
                            onClick={() => handleLocalUpdate({ fontFamily: 'Orbitron' })}
                            className={`w-full py-2 font-bold rounded-lg transition-colors ${localOverlay.fontFamily === 'Orbitron' ? 'bg-[var(--accent-color)] text-white' : 'bg-[var(--frame-bg-color)] hover:bg-[var(--border-color)]'}`}
                            style={{ fontFamily: 'Orbitron' }}
                        >
                            Orbitron
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="font-semibold text-sm">Color</label>
                        <input type="color" value={localOverlay.color} onChange={(e) => handleLocalUpdate({ color: e.target.value })} className="w-full h-10 rounded-lg bg-[var(--bg-color)] border-2 border-[var(--border-color)]" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-semibold text-sm">Font Size ({localOverlay.fontSize}px)</label>
                        <input type="range" min="12" max="72" value={localOverlay.fontSize} onChange={(e) => handleLocalUpdate({ fontSize: Number(e.target.value) })} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-semibold text-sm">Start Time (s)</label>
                        <input type="number" step="0.1" value={localOverlay.startTime.toFixed(1)} onChange={(e) => handleLocalUpdate({ startTime: Number(e.target.value) })} className="w-full bg-[var(--bg-color)] border-2 border-[var(--border-color)] rounded-xl p-2 font-mono"/>
                    </div>
                     <div className="flex flex-col gap-1">
                        <label className="font-semibold text-sm">End Time (s)</label>
                        <input type="number" step="0.1" value={localOverlay.endTime.toFixed(1)} onChange={(e) => handleLocalUpdate({ endTime: Number(e.target.value) })} className="w-full bg-[var(--bg-color)] border-2 border-[var(--border-color)] rounded-xl p-2 font-mono"/>
                    </div>
                </div>
                 <div className="flex gap-2 mt-2">
                    <button onClick={() => handleDeleteOverlay(selectedOverlay.id)} className="w-full py-2 font-bold text-red-500 bg-red-500/10 rounded-xl flex items-center justify-center gap-2"><TrashIcon className="w-5 h-5"/> Delete</button>
                    <button onClick={() => handleSaveOverlay(localOverlay)} className="w-full py-2 font-bold text-white bg-[var(--accent-color)] rounded-xl">Done</button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full w-full bg-[var(--frame-bg-color)] text-[var(--text-color)] flex flex-col transition-colors duration-300 relative">
      <header className="grid grid-cols-3 items-center p-4 border-b-2 border-[var(--border-color)] flex-shrink-0 h-16 transition-colors duration-300 z-10">
        {renderHeader()}
      </header>
      <main className="flex-grow p-4 flex flex-col gap-6 overflow-y-auto items-center">
        {renderContent()}
      </main>
      {step === 'edit' && <TextEditorPanel />}
      {isUploading && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40 flex flex-col justify-center items-center p-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-10 h-10 border-4 border-white/30 border-t-[var(--accent-color)] rounded-full animate-spin" />
            <h2 className="text-2xl font-black text-white font-display">Uploading Vibe...</h2>
          </div>
          <div className="w-full max-w-xs bg-white/20 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[var(--accent-color)] to-[var(--secondary-color)] h-4 rounded-full transition-all duration-300 ease-linear"
              style={{ width: `${uploadProgress}%` }}
              aria-valuenow={uploadProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            ></div>
          </div>
          <p className="text-white font-bold text-lg mt-2">{Math.min(uploadProgress, 100)}%</p>
          <button 
            onClick={handleCancelUpload}
            className="mt-6 text-white/80 font-bold py-2 px-5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Cancel upload"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Upload;