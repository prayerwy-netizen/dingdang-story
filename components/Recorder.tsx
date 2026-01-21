import React, { useState, useRef } from 'react';
import { SpinnerIcon } from './Icons';
import { useToast } from '../contexts/ToastContext';

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing: boolean;
}

const Recorder: React.FC<RecorderProps> = ({ onRecordingComplete, isProcessing }) => {
  const toast = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // Use webm for wider support, will assume gemini handles it
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop()); // Stop mic
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-6">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
          isRecording 
            ? 'bg-red-500 animate-pulse border-4 border-red-200' 
            : isProcessing 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-green-500 border-4 border-green-200 hover:bg-green-600'
        }`}
      >
        {isProcessing ? (
           <SpinnerIcon />
        ) : isRecording ? (
          <span className="text-4xl">⏹</span>
        ) : (
          <span className="text-4xl">🎤</span>
        )}
      </button>
      <p className="mt-2 text-gray-600 font-medium">
        {isRecording ? "正在录音... (点击停止)" : isProcessing ? "正在思考..." : "按住回答问题"}
      </p>
    </div>
  );
};

export default Recorder;
