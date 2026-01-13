import React, { useState, useEffect } from 'react';
import { Gift, GiftRequest } from '../types';
import { getEnabledGifts } from '../services/giftService';
import { createRequest, getRequests } from '../services/requestService';

interface GiftShopProps {
  familyCode: string;
  totalPoints: number;
}

const GiftShop: React.FC<GiftShopProps> = ({ familyCode, totalPoints }) => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [myRequests, setMyRequests] = useState<GiftRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    loadData();
  }, [familyCode]);

  const loadData = async () => {
    setLoading(true);
    const [giftList, requests] = await Promise.all([
      getEnabledGifts(familyCode),
      getRequests(familyCode),
    ]);
    setGifts(giftList);
    setMyRequests(requests);
    setLoading(false);
  };

  const handleExchange = async (gift: Gift) => {
    if (totalPoints < gift.score) {
      alert('积分不足哦~');
      return;
    }

    const confirmed = confirm(`确定要用 ${gift.score} 个小元宝兑换「${gift.name}」吗？`);
    if (!confirmed) return;

    const result = await createRequest(familyCode, {
      gift_id: gift.id,
      gift_name: gift.name,
      score: gift.score,
    });

    if (result.success) {
      alert('申请已提交，等待家长审批~');
      loadData();
    } else {
      alert(result.error || '申请失败');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">等待审批</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">已批准</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">已拒绝</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <div className="safe-area-top bg-white/80 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="w-12"></div>
          <h1 className="font-heading text-xl md:text-2xl text-primary-800">礼物商城</h1>
          <div className="flex items-center gap-2 clay-card px-3 py-1.5">
            <span className="text-lg">💰</span>
            <span className="font-heading text-lg text-accent-orange">{totalPoints}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
        {/* 切换按钮 */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowRequests(!showRequests)}
            className="clay-btn-secondary px-6 py-2 rounded-xl text-sm cursor-pointer"
          >
            {showRequests ? '查看礼物' : '我的申请'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary-300 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : showRequests ? (
          /* 我的申请列表 */
          <div>
            <h2 className="font-heading text-lg text-primary-800 mb-4">我的兑换申请</h2>
            {myRequests.length === 0 ? (
              <div className="clay-card p-8 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-primary-500">暂无兑换申请</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map(request => (
                  <div key={request.id} className="clay-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-heading text-primary-800">{request.gift_name}</p>
                        <p className="text-primary-500 text-sm">{request.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-accent-orange mb-1">-{request.score}</p>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* 礼物列表 */
          <div>
            <h2 className="font-heading text-lg text-primary-800 mb-4">可兑换礼物</h2>
            {gifts.length === 0 ? (
              <div className="clay-card p-8 text-center">
                <div className="text-4xl mb-3">🎁</div>
                <p className="text-primary-500">暂无可兑换礼物</p>
                <p className="text-primary-400 text-sm mt-1">请让家长添加礼物~</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {gifts.map(gift => {
                  const canAfford = totalPoints >= gift.score;
                  return (
                    <div
                      key={gift.id}
                      className={`clay-card p-4 ${!canAfford ? 'opacity-60' : ''}`}
                    >
                      <div className="aspect-square mb-3 rounded-xl bg-primary-50 flex items-center justify-center text-5xl overflow-hidden">
                        {gift.image?.startsWith('http') ? (
                          <img src={gift.image} alt={gift.name} className="w-full h-full object-cover" />
                        ) : (
                          gift.image || '🎁'
                        )}
                      </div>
                      <h3 className="font-heading text-primary-800 mb-1 truncate">{gift.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-lg">💰</span>
                          <span className="font-heading text-accent-orange">{gift.score}</span>
                        </div>
                        <button
                          onClick={() => handleExchange(gift)}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                            canAfford
                              ? 'bg-primary-500 text-white hover:bg-primary-600'
                              : 'bg-primary-100 text-primary-400 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? '兑换' : '积分不足'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftShop;
