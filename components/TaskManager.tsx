import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { getTasks, createTask, updateTask, deleteTask, toggleTaskEnabled } from '../services/taskService';

interface TaskManagerProps {
  familyCode: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({ familyCode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 表单状态
  const [formName, setFormName] = useState('');
  const [formUnit, setFormUnit] = useState('次');
  const [formScore, setFormScore] = useState(1);
  const [formType, setFormType] = useState<'positive' | 'negative'>('positive');

  useEffect(() => {
    loadData();
  }, [familyCode]);

  const loadData = async () => {
    setLoading(true);
    const taskList = await getTasks(familyCode);
    setTasks(taskList);
    setLoading(false);
  };

  const resetForm = () => {
    setFormName('');
    setFormUnit('次');
    setFormScore(1);
    setFormType('positive');
    setEditingTask(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (task: Task) => {
    setFormName(task.name);
    setFormUnit(task.unit);
    setFormScore(task.score);
    setFormType(task.type);
    setEditingTask(task);
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      alert('请输入任务名称');
      return;
    }

    if (editingTask) {
      // 更新任务
      const result = await updateTask(editingTask.id, {
        name: formName.trim(),
        unit: formUnit,
        score: formScore,
        type: formType,
      });

      if (result.success) {
        setShowAddModal(false);
        resetForm();
        loadData();
      } else {
        alert(result.error || '更新失败');
      }
    } else {
      // 创建任务
      const result = await createTask(familyCode, {
        name: formName.trim(),
        unit: formUnit,
        score: formScore,
        type: formType,
      });

      if (result.success) {
        setShowAddModal(false);
        resetForm();
        loadData();
      } else {
        alert(result.error || '创建失败');
      }
    }
  };

  const handleDelete = async (taskId: string) => {
    const confirmed = confirm('确定要删除这个任务吗？');
    if (!confirmed) return;

    const result = await deleteTask(taskId);
    if (result.success) {
      loadData();
    } else {
      alert(result.error || '删除失败');
    }
  };

  const handleToggle = async (task: Task) => {
    const result = await toggleTaskEnabled(task.id, !task.enabled);
    if (result.success) {
      loadData();
    } else {
      alert(result.error || '操作失败');
    }
  };

  const positiveTasks = tasks.filter(t => t.type === 'positive');
  const negativeTasks = tasks.filter(t => t.type === 'negative');

  return (
    <div className="p-4 md:p-6">
      {/* 标题和添加按钮 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl text-primary-800">任务管理</h2>
        <button
          onClick={openAddModal}
          className="clay-btn px-4 py-2 rounded-xl text-white font-medium cursor-pointer flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加任务
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary-300 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* 加分任务 */}
          <div className="mb-6">
            <h3 className="font-heading text-primary-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent-green/20 text-accent-green text-sm flex items-center justify-center">+</span>
              加分任务
            </h3>
            {positiveTasks.length === 0 ? (
              <p className="text-primary-400 text-sm ml-8">暂无加分任务</p>
            ) : (
              <div className="space-y-2">
                {positiveTasks.map(task => (
                  <div
                    key={task.id}
                    className={`clay-card p-4 flex items-center justify-between ${!task.enabled ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggle(task)}
                        className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${
                          task.enabled ? 'bg-accent-green' : 'bg-primary-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                          task.enabled ? 'left-4' : 'left-0.5'
                        }`} />
                      </button>
                      <div>
                        <p className="font-medium text-primary-800">{task.name}</p>
                        <p className="text-primary-500 text-sm">每{task.unit} +{task.score}分</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-2 text-primary-400 hover:text-primary-600 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-2 text-primary-400 hover:text-red-500 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 扣分任务 */}
          <div>
            <h3 className="font-heading text-primary-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 text-sm flex items-center justify-center">-</span>
              扣分任务
            </h3>
            {negativeTasks.length === 0 ? (
              <p className="text-primary-400 text-sm ml-8">暂无扣分任务</p>
            ) : (
              <div className="space-y-2">
                {negativeTasks.map(task => (
                  <div
                    key={task.id}
                    className={`clay-card p-4 flex items-center justify-between ${!task.enabled ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggle(task)}
                        className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${
                          task.enabled ? 'bg-red-400' : 'bg-primary-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                          task.enabled ? 'left-4' : 'left-0.5'
                        }`} />
                      </button>
                      <div>
                        <p className="font-medium text-primary-800">{task.name}</p>
                        <p className="text-primary-500 text-sm">每{task.unit} -{task.score}分</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-2 text-primary-400 hover:text-primary-600 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-2 text-primary-400 hover:text-red-500 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {/* 添加/编辑弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="clay-card p-6 w-full max-w-md">
            <h3 className="font-heading text-xl text-primary-800 mb-4">
              {editingTask ? '编辑任务' : '添加任务'}
            </h3>

            <div className="space-y-4">
              {/* 任务类型 */}
              <div>
                <label className="block text-primary-600 text-sm mb-2">任务类型</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormType('positive')}
                    className={`flex-1 py-3 rounded-xl font-medium cursor-pointer transition-colors ${
                      formType === 'positive'
                        ? 'bg-accent-green text-white'
                        : 'bg-primary-50 text-primary-600'
                    }`}
                  >
                    加分任务
                  </button>
                  <button
                    onClick={() => setFormType('negative')}
                    className={`flex-1 py-3 rounded-xl font-medium cursor-pointer transition-colors ${
                      formType === 'negative'
                        ? 'bg-red-500 text-white'
                        : 'bg-primary-50 text-primary-600'
                    }`}
                  >
                    扣分任务
                  </button>
                </div>
              </div>

              {/* 任务名称 */}
              <div>
                <label className="block text-primary-600 text-sm mb-2">任务名称</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="如：完成作业、练习钢琴"
                  className="w-full px-4 py-3 rounded-xl border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>

              {/* 单位和分值 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-primary-600 text-sm mb-2">单位</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={e => setFormUnit(e.target.value)}
                    placeholder="次"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
                <div>
                  <label className="block text-primary-600 text-sm mb-2">分值</label>
                  <input
                    type="number"
                    min="1"
                    value={formScore}
                    onChange={e => setFormScore(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 py-3 rounded-xl bg-primary-100 text-primary-600 font-medium cursor-pointer hover:bg-primary-200"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium cursor-pointer hover:bg-primary-600"
              >
                {editingTask ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
