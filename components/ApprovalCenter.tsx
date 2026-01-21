import React, { useState, useEffect } from 'react';
import { GiftRequest } from '../types';
import { getRequests, approveRequest, rejectRequest } from '../services/requestService';
import { getTotalScore } from '../services/recordService';
import { useToast } from '../contexts/ToastContext';

interface ApprovalCenterProps {
  familyCode: string;
}

const ApprovalCenter: React.FC<ApprovalCenterProps> = ({ familyCode }) => {
  const toast = useToast();
  const [requests, setRequests] = useState<GiftRequest[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    loadData();
  }, [familyCode]);

  const loadData = async () => {
    setLoading(true);
    const [requestList, score] = await Promise.all([
      getRequests(familyCode),
      getTotalScore(familyCode),
    ]);
    setRequests(requestList);
    setTotalScore(score);
    setLoading(false);
  };

  const handleApprove = async (requestId: string) => {
    const result = await approveRequest(requestId);
    if (result.success) {
      loadData();
    } else {
      toast.error(result.error || '批准失败');
    }
  };

  const handleReject = async (requestId: string) => {
    const confirmed = confirm('确定要拒绝这个申请吗？');
    if (!confirmed) return;

    const result = await rejectRequest(requestId);
    if (result.success) {
      loadData();
    } else {
      toast.error(result.error || '拒绝失败');
    }
  };

  const filteredRequests = filter === 'pending'
    ? requests.filter(r => r.status === 'pending')
    : requests;

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">待审批</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">已批准</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">已拒绝</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === today) return '今天';
    if (dateStr === yesterday) return '昨天';

    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="p-4 md:p-6">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl text-primary-800">兑换审批</h2>
          {pendingCount > 0 && (
            <p className="text-primary-500 text-sm">{pendingCount} 个待处理</p>
          )}
        </div>
        <div className="clay-card px-4 py-2 flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <div>
            <p className="text-primary-400 text-xs">当前余额</p>
            <p className="font-heading text-accent-orange">{totalScore}</p>
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
            filter === 'pending'
              ? 'bg-primary-500 text-white'
              : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
          }`}
        >
          待审批 {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
            filter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
          }`}
        >
          全部记录
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary-300 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="clay-card p-8 text-center">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-primary-500">
            {filter === 'pending' ? '暂无待审批的申请' : '暂无兑换记录'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(request => (
            <div key={request.id} className="clay-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-heading text-primary-800">{request.gift_name}</h4>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-primary-500 text-sm">
                    {formatDate(request.date)} · 需要 {request.score} 小元宝
                  </p>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-medium cursor-pointer hover:bg-red-100"
                    >
                      拒绝
                    </button>
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={totalScore < request.score}
                      className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${
                        totalScore >= request.score
                          ? 'bg-accent-green text-white hover:bg-accent-green/90'
                          : 'bg-primary-100 text-primary-400 cursor-not-allowed'
                      }`}
                    >
                      {totalScore >= request.score ? '批准' : '积分不足'}
                    </button>
                  </div>
                )}
              </div>

              {request.status === 'pending' && totalScore < request.score && (
                <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-700 text-sm">
                    当前余额 {totalScore}，还差 {request.score - totalScore} 个小元宝
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalCenter;
