import React, { useState, useEffect } from 'react';
import { PointRecord } from '../types';
import { getRecords, getTotalScore } from '../services/recordService';

interface MyRecordsProps {
  familyCode: string;
}

const MyRecords: React.FC<MyRecordsProps> = ({ familyCode }) => {
  const [records, setRecords] = useState<PointRecord[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');

  useEffect(() => {
    loadData();
  }, [familyCode]);

  const loadData = async () => {
    setLoading(true);
    const [recordList, score] = await Promise.all([
      getRecords(familyCode),
      getTotalScore(familyCode),
    ]);
    setRecords(recordList);
    setTotalScore(score);
    setLoading(false);
  };

  const filteredRecords = records.filter(record => {
    if (filter === 'positive') return record.score > 0;
    if (filter === 'negative') return record.score < 0;
    return true;
  });

  // 按日期分组
  const groupedRecords = filteredRecords.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, PointRecord[]>);

  const sortedDates = Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === today) return '今天';
    if (dateStr === yesterday) return '昨天';

    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <div className="safe-area-top bg-white/80 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="w-12"></div>
          <h1 className="font-heading text-xl md:text-2xl text-primary-800">我的记录</h1>
          <div className="flex items-center gap-2 clay-card px-3 py-1.5">
            <span className="text-lg">💰</span>
            <span className="font-heading text-lg text-accent-orange">{totalScore}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
        {/* 积分统计 */}
        <div className="clay-card p-4 mb-4 bg-gradient-to-br from-accent-orange/10 to-candy-peach/30">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-red-500 font-heading text-xl">
                +{records.filter(r => r.score > 0).reduce((sum, r) => sum + r.score, 0)}
              </p>
              <p className="text-primary-500 text-sm">累计获得</p>
            </div>
            <div className="text-center">
              <p className="text-green-500 font-heading text-xl">
                {records.filter(r => r.score < 0).reduce((sum, r) => sum + r.score, 0)}
              </p>
              <p className="text-primary-500 text-sm">累计消费</p>
            </div>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="flex gap-2 mb-4">
          {(['all', 'positive', 'negative'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                filter === type
                  ? 'bg-primary-500 text-white'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              }`}
            >
              {type === 'all' ? '全部' : type === 'positive' ? '获得' : '消费'}
            </button>
          ))}
        </div>

        {/* 记录列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary-300 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="clay-card p-8 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-primary-500">暂无记录</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => {
              const dayRecords = groupedRecords[date];
              const dayTotal = dayRecords.reduce((sum, r) => sum + r.score, 0);

              return (
                <div key={date}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading text-primary-700">{formatDate(date)}</h3>
                    <span className={`font-heading ${dayTotal >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {dayTotal >= 0 ? '+' : ''}{dayTotal}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayRecords.map(record => (
                      <div
                        key={record.id}
                        className="clay-card p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                            record.score >= 0 ? 'bg-red-50' : 'bg-green-50'
                          }`}>
                            {record.score >= 0 ? '⭐' : '🎁'}
                          </div>
                          <div>
                            <p className="font-medium text-primary-800">{record.task_name}</p>
                            {record.note && (
                              <p className="text-primary-500 text-sm">{record.note}</p>
                            )}
                          </div>
                        </div>
                        <span className={`font-heading text-lg ${
                          record.score >= 0 ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {record.score >= 0 ? '+' : ''}{record.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRecords;
