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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

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
    setLoading(false);
  };

  const handleQuickAdd = async (task: Task) => {
    const score = task.type === 'positive' ? task.score : -task.score;
    const result = await addRecord(familyCode, {
      task_id: task.id,
      task_name: task.name,
      score,
    });

    if (result.success) {
      loadData();
    } else {
      alert(result.error || '添加失败');
    }
  };

  const handleAddWithQuantity = async () => {
    if (!selectedTask) return;

    const score = selectedTask.type === 'positive'
      ? selectedTask.score * quantity
      : -selectedTask.score * quantity;

    const result = await addRecord(familyCode, {
      task_id: selectedTask.id,
      task_name: `${selectedTask.name} x${quantity}`,
      score,
      note: note || undefined,
    });

    if (result.success) {
      setShowAddModal(false);
      setSelectedTask(null);
      setQuantity(1);
      setNote('');
      loadData();
    } else {
      alert(result.error || '添加失败');
    }
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

  const openAddModal = (task: Task) => {
    setSelectedTask(task);
    setQuantity(1);
    setNote('');
    setShowAddModal(true);
  };

  const positiveTasks = tasks.filter(t => t.type === 'positive');
  const negativeTasks = tasks.filter(t => t.type === 'negative');

  return (
    <div className="p-4 md:p-6">
      {/* 积分概览 */}
      <div className="clay-card p-4 mb-6 bg-gradient-to-br from-accent-orange/10 to-candy-peach/30">
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
      ) : (
        <>
          {/* 加分任务 */}
          {positiveTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="font-heading text-primary-800 mb-3 flex items-center gap-2">
                <span className="text-accent-green">+</span> 加分任务
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {positiveTasks.map(task => (
                  <div key={task.id} className="clay-card p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-primary-800 truncate">{task.name}</span>
                      <span className="text-accent-green font-heading">+{task.score}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleQuickAdd(task)}
                        className="flex-1 py-2 bg-accent-green/10 text-accent-green rounded-lg text-sm font-medium cursor-pointer hover:bg-accent-green/20 transition-colors"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => openAddModal(task)}
                        className="px-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm cursor-pointer hover:bg-primary-100 transition-colors"
                      >
                        ...
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 扣分任务 */}
          {negativeTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="font-heading text-primary-800 mb-3 flex items-center gap-2">
                <span className="text-red-500">-</span> 扣分任务
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {negativeTasks.map(task => (
                  <div key={task.id} className="clay-card p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-primary-800 truncate">{task.name}</span>
                      <span className="text-red-500 font-heading">-{task.score}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleQuickAdd(task)}
                        className="flex-1 py-2 bg-red-50 text-red-500 rounded-lg text-sm font-medium cursor-pointer hover:bg-red-100 transition-colors"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => openAddModal(task)}
                        className="px-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm cursor-pointer hover:bg-primary-100 transition-colors"
                      >
                        ...
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="clay-card p-8 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-primary-500">暂无任务</p>
              <p className="text-primary-400 text-sm mt-1">请先在任务管理中添加任务</p>
            </div>
          )}

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

      {/* 添加弹窗 */}
      {showAddModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="clay-card p-6 w-full max-w-md">
            <h3 className="font-heading text-xl text-primary-800 mb-4">
              {selectedTask.name}
            </h3>

            <div className="mb-4">
              <label className="block text-primary-600 text-sm mb-2">数量</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 font-bold cursor-pointer hover:bg-primary-200"
                >
                  -
                </button>
                <span className="font-heading text-2xl text-primary-800 w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 font-bold cursor-pointer hover:bg-primary-200"
                >
                  +
                </button>
                <span className={`font-heading text-xl ml-auto ${selectedTask.type === 'positive' ? 'text-accent-green' : 'text-red-500'}`}>
                  {selectedTask.type === 'positive' ? '+' : '-'}{selectedTask.score * quantity}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-primary-600 text-sm mb-2">备注（可选）</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="添加备注..."
                className="w-full px-4 py-3 rounded-xl border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl bg-primary-100 text-primary-600 font-medium cursor-pointer hover:bg-primary-200"
              >
                取消
              </button>
              <button
                onClick={handleAddWithQuantity}
                className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium cursor-pointer hover:bg-primary-600"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickRecord;
