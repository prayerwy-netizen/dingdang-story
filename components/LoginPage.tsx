import React, { useState } from 'react';
import { sendSmsOtp, verifySmsOtp } from '../services/authService';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

type LoginStep = 'phone' | 'verify';

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // 格式化手机号显示
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits;
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (phone.length !== 11) {
      setError('请输入正确的手机号');
      return;
    }

    setLoading(true);
    setError('');

    const fullPhone = `+86${phone}`;
    const result = await sendSmsOtp(fullPhone);

    setLoading(false);

    if (result.success) {
      setStep('verify');
      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(result.error || '发送验证码失败');
    }
  };

  // 验证验证码
  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    setLoading(true);
    setError('');

    const fullPhone = `+86${phone}`;
    const result = await verifySmsOtp(fullPhone, code);

    setLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.error || '验证失败');
    }
  };

  // 重新发送验证码
  const handleResend = () => {
    if (countdown === 0) {
      handleSendCode();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-200 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔔</div>
          <h1 className="text-3xl font-bold text-sky-800">叮当学堂</h1>
          <p className="text-sky-600 mt-2">陪伴宝贝快乐成长</p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
          {step === 'phone' ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                手机号登录
              </h2>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">手机号</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-gray-600">
                    +86
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="请输入手机号"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                    maxLength={11}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <button
                onClick={handleSendCode}
                disabled={loading || phone.length !== 11}
                className="w-full py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '发送中...' : '获取验证码'}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                输入验证码
              </h2>
              <p className="text-sm text-gray-500 mb-6 text-center">
                验证码已发送至 +86 {phone}
              </p>

              <div className="mb-4">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="请输入6位验证码"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-400"
                  maxLength={6}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <button
                onClick={handleVerifyCode}
                disabled={loading || code.length !== 6}
                className="w-full py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
              >
                {loading ? '验证中...' : '登录'}
              </button>

              <div className="flex justify-between items-center text-sm">
                <button
                  onClick={() => {
                    setStep('phone');
                    setCode('');
                    setError('');
                  }}
                  className="text-sky-600 hover:text-sky-700"
                >
                  更换手机号
                </button>
                <button
                  onClick={handleResend}
                  disabled={countdown > 0}
                  className={`${
                    countdown > 0 ? 'text-gray-400' : 'text-sky-600 hover:text-sky-700'
                  }`}
                >
                  {countdown > 0 ? `${countdown}秒后重发` : '重新发送'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* 底部提示 */}
        <p className="text-center text-xs text-gray-500 mt-6">
          登录即表示同意《用户协议》和《隐私政策》
        </p>
      </div>
    </div>
  );
}
