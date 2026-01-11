import React, { useState, useRef } from 'react';

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing: boolean;
}

const Recorder: React.FC<RecorderProps> = ({ onRecordingComplete, isProcessing }) => {
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
      alert("无法访问麦克风，请检查权限设置");
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
           <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
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
