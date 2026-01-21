import React, { useState, useEffect } from 'react';
import { Task, PointRecord } from '../types';
import { getEnabledTasks } from '../services/taskService';
import { addRecord, getRecordsByDate, getTotalScore, deleteRecord } from '../services/recordService';

interface QuickRecordProps {
  familyCode: string;
}

const QuickRecord: React.FC<QuickRecordProps> = ({ familyCode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayRecords, setTodayRecords] = useState<PointRecord[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // 每个任务的输入数量，key 是 task.id
  const [quantities, setQuantities] = useState<Record<string, number>>({});

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
    setTasks(taskList);
    setTodayRecords(records);
    setTotalScore(score);
    // 初始化所有任务的数量为 0
    const initialQuantities: Record<string, number> = {};
    taskList.forEach(task => {
      initialQuantities[task.id] = 0;
    });
    setQuantities(initialQuantities);
    setLoading(false);
  };

  const handleQuantityChange = (taskId: string, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [taskId]: Math.max(0, value),
    }));
  };

  const handleSubmitAll = async () => {
    // 找出所有数量 > 0 的任务
    const tasksToSubmit = tasks.filter(task => quantities[task.id] > 0);

    if (tasksToSubmit.length === 0) {
      alert('请先输入要记录的分数');
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    for (const task of tasksToSubmit) {
      const qty = quantities[task.id];
      const score = task.type === 'positive' ? task.score * qty : -task.score * qty;
      const taskName = qty > 1 ? `${task.name} x${qty}` : task.name;

      const result = await addRecord(familyCode, {
        task_id: task.id,
        task_name: taskName,
        score,
      });

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setSubmitting(false);

    if (failCount > 0) {
      alert(`提交完成：${successCount} 条成功，${failCount} 条失败`);
    }

    // 重新加载数据（会重置所有输入为 0）
    loadData();
  };

  const handleDeleteRecord = async (recordId: string) => {
    const confirmed = confirm('确定要删除这条记录吗？');
    if (!confirmed) return;

    const result = await deleteRecord(recordId);
    if (result.success) {
      loadData();
    } else {
      alert(result.error || '删除失败');
    }
  };

  // 计算本次预计得分
  const pendingScore = tasks.reduce((sum, task) => {
    const qty = quantities[task.id] || 0;
    if (qty === 0) return sum;
    return sum + (task.type === 'positive' ? task.score * qty : -task.score * qty);
  }, 0);

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
            <p className="font-heading text-xl text-primary-700">
              {todayRecords.reduce((sum, r) => sum + r.score, 0) >= 0 ? '+' : ''}
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

                  {/* 参考分数 */}
                  <div className={`col-span-2 text-center font-heading text-sm ${
                    task.type === 'positive' ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {task.type === 'positive' ? '+' : '-'}{task.score}
                  </div>

                  {/* 分数输入 */}
                  <div className="col-span-3 flex justify-center">
                    <input
                      type="number"
                      min="0"
                      value={quantities[task.id] || 0}
                      onChange={e => handleQuantityChange(task.id, parseInt(e.target.value) || 0)}
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
                pendingScore >= 0 ? 'text-accent-green' : 'text-red-500'
              }`}>
                {pendingScore >= 0 ? '+' : ''}{pendingScore}
              </span>
            </div>
            <button
              onClick={handleSubmitAll}
              disabled={submitting || pendingScore === 0}
              className={`px-6 py-3 rounded-xl font-heading text-white transition-colors ${
                submitting || pendingScore === 0
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
                      <span className={`font-heading ${record.score >= 0 ? 'text-accent-green' : 'text-red-500'}`}>
                        {record.score >= 0 ? '+' : ''}{record.score}
                      </span>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-primary-400 hover:text-red-500 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
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
