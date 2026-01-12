import React, { useState, useEffect } from 'react';
import { PointRecord } from '../types';
import { getRecordsByMonth, getDailyScores, getTotalScore } from '../services/recordService';

interface PointsDashboardProps {
  familyCode: string;
  onClose: () => void;
}

const ChevronLeftIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d={direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
    />
  </svg>
);

const PointsDashboard: React.FC<PointsDashboardProps> = ({ familyCode, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [totalScore, setTotalScore] = useState(0);
  const [dailyScores, setDailyScores] = useState<Map<string, number>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<PointRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    loadData();
  }, [familyCode, year, month]);

  const loadData = async () => {
    setLoading(true);
    const [total, scores] = await Promise.all([
      getTotalScore(familyCode),
      getDailyScores(familyCode, year, month),
    ]);
    setTotalScore(total);
    setDailyScores(scores);
    setLoading(false);
  };

  const handleDateClick = async (date: string) => {
    setSelectedDate(date);
    const records = await getRecordsByMonth(familyCode, year, month);
    setSelectedRecords(records.filter(r => r.date === date));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
    setSelectedDate(null);
  };

  // 生成日历数据
  const generateCalendar = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const days: { date: string; day: number; score: number; isToday: boolean }[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < startWeekday; i++) {
      days.push({ date: '', day: 0, score: 0, isToday: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const score = dailyScores.get(dateStr) || 0;
      days.push({
        date: dateStr,
        day: d,
        score,
        isToday: dateStr === today,
      });
    }

    return days;
  };

  const calendarDays = generateCalendar();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <div className="safe-area-top bg-white/80 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 md:p-6">
          <button
            onClick={onClose}
            className="touch-target flex items-center gap-2 text-primary-600 font-semibold cursor-pointer"
          >
            <ChevronLeftIcon />
            <span className="hidden md:inline">返回</span>
          </button>
          <h1 className="font-heading text-xl md:text-2xl text-primary-800">积分日历</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* 总积分卡片 */}
        <div className="clay-card p-6 mb-6 bg-gradient-to-br from-accent-orange/10 to-candy-peach/30">
          <div className="text-center">
            <p className="text-primary-500 text-sm mb-1">小元宝总数</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl">💰</span>
              <span className="font-heading text-5xl text-accent-orange">
                {loading ? '-' : totalScore}
              </span>
            </div>
          </div>
        </div>

        {/* 月份选择器 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="touch-target p-2 rounded-xl text-primary-500 hover:bg-primary-50 cursor-pointer"
          >
            <ChevronIcon direction="left" />
          </button>
          <h2 className="font-heading text-lg text-primary-800">
            {year}年{month}月
          </h2>
          <button
            onClick={nextMonth}
            className="touch-target p-2 rounded-xl text-primary-500 hover:bg-primary-50 cursor-pointer"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>

        {/* 日历 */}
        <div className="clay-card p-4 mb-6">
          {/* 星期头 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekdays.map(day => (
              <div
                key={day}
                className="text-center text-sm font-medium text-primary-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => (
              <button
                key={idx}
                onClick={() => item.date && handleDateClick(item.date)}
                disabled={!item.date}
                className={`
                  aspect-square p-1 rounded-xl flex flex-col items-center justify-center
                  transition-all cursor-pointer
                  ${!item.date ? 'invisible' : ''}
                  ${item.isToday ? 'ring-2 ring-primary-400' : ''}
                  ${selectedDate === item.date ? 'bg-primary-100' : 'hover:bg-primary-50'}
                  ${item.score > 0 ? 'bg-accent-green/10' : ''}
                  ${item.score < 0 ? 'bg-red-50' : ''}
                `}
              >
                <span className={`text-sm ${item.isToday ? 'font-bold text-primary-600' : 'text-primary-700'}`}>
                  {item.day || ''}
                </span>
                {item.score !== 0 && (
                  <span className={`text-xs font-medium ${item.score > 0 ? 'text-accent-green' : 'text-red-500'}`}>
                    {item.score > 0 ? '+' : ''}{item.score}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 选中日期的记录 */}
        {selectedDate && (
          <div className="clay-card p-4">
            <h3 className="font-heading text-primary-800 mb-3">
              {selectedDate} 的记录
            </h3>
            {selectedRecords.length === 0 ? (
              <p className="text-primary-400 text-center py-4">暂无记录</p>
            ) : (
              <div className="space-y-2">
                {selectedRecords.map(record => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-primary-50 rounded-xl"
                  >
                    <div>
                      <p className="text-primary-800 font-medium">{record.task_name}</p>
                      {record.note && (
                        <p className="text-primary-500 text-sm">{record.note}</p>
                      )}
                    </div>
                    <span className={`font-heading text-lg ${record.score >= 0 ? 'text-accent-green' : 'text-red-500'}`}>
                      {record.score >= 0 ? '+' : ''}{record.score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsDashboard;
