import React, { useState } from 'react';

interface FamilyCodeEntryProps {
  onCodeSubmit: (code: string) => void;
}

export default function FamilyCodeEntry({ onCodeSubmit }: FamilyCodeEntryProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmedCode = code.trim();
    if (trimmedCode.length < 4) {
      setError('请输入至少4位家庭码');
      return;
    }
    if (trimmedCode.length > 20) {
      setError('家庭码最多20位');
      return;
    }
    onCodeSubmit(trimmedCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-200 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔔</div>
          <h1 className="text-3xl font-bold text-sky-800">宝贝学堂</h1>
          <p className="text-sky-600 mt-2">陪伴宝贝快乐成长</p>
        </div>

        {/* 输入卡片 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            输入家庭码
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center">
            在所有设备输入相同的家庭码，数据自动同步
          </p>

          <div className="mb-4">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              placeholder="例如：dingdang2024"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
              maxLength={20}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={code.trim().length < 4}
            className="w-full py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            进入学堂
          </button>

          {/* 重要提示 */}
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 text-lg">🔐</span>
              <div className="text-xs text-amber-700">
                <p className="font-medium mb-1">请牢记您的家庭码</p>
                <p>您的数据将使用家庭码加密存储，任何人（包括管理员）都无法查看您的原始数据。如果忘记家庭码，数据将无法恢复。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
