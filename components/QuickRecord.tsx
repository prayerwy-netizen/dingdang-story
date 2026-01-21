import React, { useState, useEffect } from 'react';
import { Task, PointRecord } from '../types';
import { getEnabledTasks } from '../services/taskService';
import { addRecord, getRecordsByDate, getTotalScore, deleteRecord } from '../services/recordService';
import { CloseIcon } from './Icons';
import { useToast } from '../contexts/ToastContext';

interface QuickRecordProps {
  familyCode: string;
}

const QuickRecord: React.FC<QuickRecordProps> = ({ familyCode }) => {
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayRecords, setTodayRecords] = useState<PointRecord[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // 每个任务的输入分数，key 是 task.id，用字符串存储以便处理空值
  const [scores, setScores] = useState<Record<string, string>>({});

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, [familyCode]);

  const loadData = async () => {
    setLoading(true);
    const [taskList, records, score] = await Promise.all([
      getEnabledTasks(familyCode),
      getRecordsByDate(familyCode, today),
      getTotalScore(familyCode),
    ]);
    // 按分数从高到低排序
    const sortedTasks = taskList.sort((a, b) => {
      // 正数在前，负数在后；同类型按分数绝对值从高到低
      if (a.type === 'positive' && b.type === 'negative') return -1;
      if (a.type === 'negative' && b.type === 'positive') return 1;
      return b.score - a.score;
    });
    setTasks(sortedTasks);
    setTodayRecords(records);
    setTotalScore(score);
    // 初始化所有任务的分数为空字符串（显示为空）
    const initialScores: Record<string, string> = {};
    sortedTasks.forEach(task => {
      initialScores[task.id] = '';
    });
    setScores(initialScores);
    setLoading(false);
  };

  const handleScoreChange = (taskId: string, value: string) => {
    // 只允许输入数字
    const numericValue = value.replace(/[^0-9]/g, '');
    setScores(prev => ({
      ...prev,
      [taskId]: numericValue,
    }));
  };

  const handleSubmitAll = async () => {
    // 找出所有有输入分数的任务
    const tasksToSubmit = tasks.filter(task => {
      const inputScore = parseInt(scores[task.id]) || 0;
      return inputScore > 0;
    });

    if (tasksToSubmit.length === 0) {
      toast.warning('请先输入要记录的分数');
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    for (const task of tasksToSubmit) {
      const inputScore = parseInt(scores[task.id]) || 0;
      // 负数任务自动转为负分
      const finalScore = task.type === 'positive' ? inputScore : -inputScore;

      const result = await addRecord(familyCode, {
        task_id: task.id,
        task_name: task.name,
        score: finalScore,
      });

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setSubmitting(false);

    if (failCount > 0) {
      toast.warning(`提交完成：${successCount} 条成功，${failCount} 条失败`);
    }

    // 重新加载数据（会重置所有输入）
    loadData();
  };

  const handleDeleteRecord = async (recordId: string) => {
    const confirmed = confirm('确定要删除这条记录吗？');
    if (!confirmed) return;

    const result = await deleteRecord(recordId);
    if (result.success) {
      loadData();
    } else {
      toast.error(result.error || '删除失败');
    }
  };

  // 计算本次预计得分
  const pendingScore = tasks.reduce((sum, task) => {
    const inputScore = parseInt(scores[task.id]) || 0;
    if (inputScore === 0) return sum;
    return sum + (task.type === 'positive' ? inputScore : -inputScore);
  }, 0);

  // 检查是否有输入
  const hasInput = tasks.some(task => (parseInt(scores[task.id]) || 0) > 0);

  return (
    <div className="p-2 md:p-4">
      {/* 积分概览 */}
      <div className="clay-card p-4 mb-4 bg-gradient-to-br from-accent-orange/10 to-candy-peach/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <p className="text-primary-500 text-sm">小元宝余额</p>
              <p className="font-heading text-3xl text-accent-orange">{totalScore}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-primary-500 text-sm">今日</p>
            <p className={`font-heading text-xl ${
              todayRecords.reduce((sum, r) => sum + r.score, 0) > 0 ? 'text-red-500' :
              todayRecords.reduce((sum, r) => sum + r.score, 0) < 0 ? 'text-green-500' : 'text-primary-700'
            }`}>
              {todayRecords.reduce((sum, r) => sum + r.score, 0) > 0 ? '+' : ''}
              {todayRecords.reduce((sum, r) => sum + r.score, 0)}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary-300 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="clay-card p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-primary-500">暂无任务</p>
          <p className="text-primary-400 text-sm mt-1">请先在任务管理中添加任务</p>
        </div>
      ) : (
        <>
          {/* 表格式任务列表 */}
          <div className="clay-card overflow-hidden mb-4">
            {/* 表头 */}
            <div className="bg-primary-500 text-white grid grid-cols-12 gap-2 px-3 py-3 text-sm font-medium">
              <div className="col-span-4">任务名称</div>
              <div className="col-span-3 text-center">计量单位</div>
              <div className="col-span-2 text-center">参考分数</div>
              <div className="col-span-3 text-center">分数</div>
            </div>

            {/* 任务行 */}
            <div className="divide-y divide-primary-100">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="grid grid-cols-12 gap-2 px-3 py-3 items-center hover:bg-primary-50 transition-colors"
                >
                  {/* 任务名称 */}
                  <div className="col-span-4 font-medium text-primary-800 text-sm truncate">
                    {task.name}
                  </div>

                  {/* 计量单位 */}
                  <div className="col-span-3 text-center text-primary-500 text-sm">
                    {task.unit}
                  </div>

                  {/* 参考分数：正数红色，负数绿色 */}
                  <div className={`col-span-2 text-center font-heading text-sm ${
                    task.type === 'positive' ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {task.type === 'positive' ? '+' : '-'}{task.score}
                  </div>

                  {/* 分数输入：直接填分数，负数任务自动转负 */}
                  <div className="col-span-3 flex justify-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={scores[task.id] || ''}
                      onChange={e => handleScoreChange(task.id, e.target.value)}
                      className="w-16 h-9 text-center border-2 border-primary-200 rounded-lg bg-white focus:border-primary-400 focus:outline-none text-primary-800 font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-primary-500">
              本次预计：
              <span className={`font-heading text-lg ml-1 ${
                pendingScore > 0 ? 'text-red-500' : pendingScore < 0 ? 'text-green-500' : 'text-primary-400'
              }`}>
                {pendingScore > 0 ? '+' : ''}{pendingScore}
              </span>
            </div>
            <button
              onClick={handleSubmitAll}
              disabled={submitting || !hasInput}
              className={`px-6 py-3 rounded-xl font-heading text-white transition-colors ${
                submitting || !hasInput
                  ? 'bg-primary-300 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 cursor-pointer'
              }`}
            >
              {submitting ? '提交中...' : '提交记录'}
            </button>
          </div>

          {/* 今日记录 */}
          <div>
            <h3 className="font-heading text-primary-800 mb-3">今日记录</h3>
            {todayRecords.length === 0 ? (
              <div className="clay-card p-6 text-center">
                <p className="text-primary-400">今天还没有记录~</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayRecords.map(record => (
                  <div
                    key={record.id}
                    className="clay-card p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-primary-800">{record.task_name}</p>
                      {record.note && (
                        <p className="text-primary-500 text-sm">{record.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-heading ${record.score > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {record.score > 0 ? '+' : ''}{record.score}
                      </span>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-primary-400 hover:text-red-500 cursor-pointer"
                      >
                        <CloseIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuickRecord;
