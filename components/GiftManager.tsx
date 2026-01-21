import React, { useState, useEffect } from 'react';
import { Gift } from '../types';
import { getGifts, createGift, updateGift, deleteGift, toggleGiftEnabled } from '../services/giftService';
import { PlusIcon, EditIcon, TrashIcon } from './Icons';
import { useToast } from '../contexts/ToastContext';

interface GiftManagerProps {
  familyCode: string;
}

// 默认 emoji 选项
const EMOJI_OPTIONS = ['🎁', '🍭', '🍦', '🎮', '📱', '🎬', '🎡', '🎪', '🎨', '📚', '🧸', '🎹', '⚽', '🏀', '🎯', '🎲'];

const GiftManager: React.FC<GiftManagerProps> = ({ familyCode }) => {
  const toast = useToast();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);

  // 表单状态
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('🎁');
  const [formScore, setFormScore] = useState(10);

  useEffect(() => {
    loadData();
  }, [familyCode]);

  const loadData = async () => {
    setLoading(true);
    const giftList = await getGifts(familyCode);
    setGifts(giftList);
    setLoading(false);
  };

  const resetForm = () => {
    setFormName('');
    setFormImage('🎁');
    setFormScore(10);
    setEditingGift(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (gift: Gift) => {
    setFormName(gift.name);
    setFormImage(gift.image);
    setFormScore(gift.score);
    setEditingGift(gift);
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.warning('请输入礼物名称');
      return;
    }

    if (editingGift) {
      // 更新礼物
      const result = await updateGift(editingGift.id, {
        name: formName.trim(),
        image: formImage,
        score: formScore,
      });

      if (result.success) {
        setShowAddModal(false);
        resetForm();
        loadData();
      } else {
        toast.error(result.error || '更新失败');
      }
    } else {
      // 创建礼物
      const result = await createGift(familyCode, {
        name: formName.trim(),
        image: formImage,
        score: formScore,
      });

      if (result.success) {
        setShowAddModal(false);
        resetForm();
        loadData();
      } else {
        toast.error(result.error || '创建失败');
      }
    }
  };

  const handleDelete = async (giftId: string) => {
    const confirmed = confirm('确定要删除这个礼物吗？');
    if (!confirmed) return;

    const result = await deleteGift(giftId);
    if (result.success) {
      loadData();
    } else {
      toast.error(result.error || '删除失败');
    }
  };

  const handleToggle = async (gift: Gift) => {
    const result = await toggleGiftEnabled(gift.id, !gift.enabled);
    if (result.success) {
      loadData();
    } else {
      toast.error(result.error || '操作失败');
    }
  };

  const enabledGifts = gifts.filter(g => g.enabled);
  const disabledGifts = gifts.filter(g => !g.enabled);

  return (
    <div className="p-4 md:p-6">
      {/* 标题和添加按钮 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl text-primary-800">礼物管理</h2>
        <button
          onClick={openAddModal}
          className="clay-btn px-4 py-2 rounded-xl text-white font-medium cursor-pointer flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          添加礼物
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary-300 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : gifts.length === 0 ? (
        <div className="clay-card p-8 text-center">
          <div className="text-5xl mb-3">🎁</div>
          <p className="text-primary-500">暂无礼物</p>
          <p className="text-primary-400 text-sm mt-1">点击上方按钮添加礼物</p>
        </div>
      ) : (
        <>
          {/* 启用的礼物 */}
          {enabledGifts.length > 0 && (
            <div className="mb-6">
              <h3 className="font-heading text-primary-700 mb-3">可兑换礼物</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {enabledGifts.map(gift => (
                  <div key={gift.id} className="clay-card p-4">
                    <div className="aspect-square mb-3 rounded-xl bg-primary-50 flex items-center justify-center text-4xl">
                      {gift.image?.startsWith('http') ? (
                        <img src={gift.image} alt={gift.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        gift.image || '🎁'
                      )}
                    </div>
                    <h4 className="font-heading text-primary-800 truncate mb-1">{gift.name}</h4>
                    <p className="text-accent-orange font-heading mb-3">💰 {gift.score}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggle(gift)}
                        className="flex-1 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm cursor-pointer hover:bg-primary-100"
                      >
                        下架
                      </button>
                      <button
                        onClick={() => openEditModal(gift)}
                        className="p-2 bg-primary-50 text-primary-600 rounded-lg cursor-pointer hover:bg-primary-100"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(gift.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-lg cursor-pointer hover:bg-red-100"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 已下架的礼物 */}
          {disabledGifts.length > 0 && (
            <div>
              <h3 className="font-heading text-primary-500 mb-3">已下架</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {disabledGifts.map(gift => (
                  <div key={gift.id} className="clay-card p-4 opacity-60">
                    <div className="aspect-square mb-3 rounded-xl bg-primary-50 flex items-center justify-center text-4xl grayscale">
                      {gift.image?.startsWith('http') ? (
                        <img src={gift.image} alt={gift.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        gift.image || '🎁'
                      )}
                    </div>
                    <h4 className="font-heading text-primary-800 truncate mb-1">{gift.name}</h4>
                    <p className="text-primary-500 font-heading mb-3">💰 {gift.score}</p>
                    <button
                      onClick={() => handleToggle(gift)}
                      className="w-full py-2 bg-accent-green/10 text-accent-green rounded-lg text-sm cursor-pointer hover:bg-accent-green/20"
                    >
                      上架
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 添加/编辑弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="clay-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-heading text-xl text-primary-800 mb-4">
              {editingGift ? '编辑礼物' : '添加礼物'}
            </h3>

            <div className="space-y-4">
              {/* 礼物名称 */}
              <div>
                <label className="block text-primary-600 text-sm mb-2">礼物名称</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="如：看一集动画片"
                  className="w-full px-4 py-3 rounded-xl border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>

              {/* 礼物图标 */}
              <div>
                <label className="block text-primary-600 text-sm mb-2">选择图标</label>
                <div className="grid grid-cols-8 gap-2 mb-2">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setFormImage(emoji)}
                      className={`aspect-square rounded-lg text-2xl flex items-center justify-center cursor-pointer transition-colors ${
                        formImage === emoji
                          ? 'bg-primary-100 ring-2 ring-primary-400'
                          : 'bg-primary-50 hover:bg-primary-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-primary-400 text-xs">或输入图片链接：</p>
                <input
                  type="text"
                  value={formImage.startsWith('http') ? formImage : ''}
                  onChange={e => setFormImage(e.target.value || '🎁')}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 mt-1 rounded-xl border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                />
              </div>

              {/* 所需积分 */}
              <div>
                <label className="block text-primary-600 text-sm mb-2">所需小元宝</label>
                <input
                  type="number"
                  min="1"
                  value={formScore}
                  onChange={e => setFormScore(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 rounded-xl border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
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
                {editingGift ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftManager;
