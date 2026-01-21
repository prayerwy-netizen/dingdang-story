import React, { useState } from 'react';

interface ParentGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PIN_LENGTH = 4;
const CORRECT_PIN = '1234';

const ParentGate: React.FC<ParentGateProps> = ({ onSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNumberPress = (num: string) => {
    if (pin.length >= PIN_LENGTH) return;

    const newPin = pin + num;
    setPin(newPin);
    setError(false);

    // 自动验证
    if (newPin.length === PIN_LENGTH) {
      if (newPin === CORRECT_PIN) {
        onSuccess();
      } else {
        setError(true);
        // 短暂延迟后清空
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  // 数字按钮样式
  const buttonClass = "w-full aspect-square rounded-2xl bg-gray-100 text-gray-800 text-3xl font-medium flex items-center justify-center cursor-pointer hover:bg-gray-200 active:bg-gray-300 transition-colors select-none";

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading text-gray-800 flex items-center justify-center gap-2">
            <span className="text-3xl">🔐</span>
            家长验证
          </h1>
        </div>

        {/* PIN 点点 */}
        <div className="flex justify-center gap-4 mb-12">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                error
                  ? 'bg-red-500'
                  : i < pin.length
                    ? 'bg-primary-500'
                    : 'bg-primary-300'
              }`}
            />
          ))}
        </div>

        {/* 错误提示 */}
        {error && (
          <p className="text-center text-red-500 text-sm mb-4 animate-pulse">
            密码错误，请重试
          </p>
        )}

        {/* 数字键盘 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 第一行 1-3 */}
          <button onClick={() => handleNumberPress('1')} className={buttonClass}>1</button>
          <button onClick={() => handleNumberPress('2')} className={buttonClass}>2</button>
          <button onClick={() => handleNumberPress('3')} className={buttonClass}>3</button>

          {/* 第二行 4-6 */}
          <button onClick={() => handleNumberPress('4')} className={buttonClass}>4</button>
          <button onClick={() => handleNumberPress('5')} className={buttonClass}>5</button>
          <button onClick={() => handleNumberPress('6')} className={buttonClass}>6</button>

          {/* 第三行 7-9 */}
          <button onClick={() => handleNumberPress('7')} className={buttonClass}>7</button>
          <button onClick={() => handleNumberPress('8')} className={buttonClass}>8</button>
          <button onClick={() => handleNumberPress('9')} className={buttonClass}>9</button>

          {/* 第四行 清除-0-删除 */}
          <button onClick={handleClear} className={`${buttonClass} text-xl`}>清除</button>
          <button onClick={() => handleNumberPress('0')} className={buttonClass}>0</button>
          <button onClick={handleDelete} className={`${buttonClass} text-xl`}>删除</button>
        </div>

        {/* 返回首页 */}
        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentGate;
