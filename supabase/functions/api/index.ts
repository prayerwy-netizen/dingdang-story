// Supabase Edge Function - 统一 API 中间层
// 所有数据库操作都通过这个函数，前端不再直接访问数据库

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 表名常量
const TABLES = {
  PROFILES: 'dingdang_study_profiles',
  DIARIES: 'dingdang_study_diaries',
  CUSTOM_CONTENTS: 'dingdang_study_custom_contents',
  LEARNING_RECORDS: 'dingdang_study_learning_records',
  TASKS: 'dingdang_tasks',
  GIFTS: 'dingdang_gifts',
  RECORDS: 'dingdang_records',
  REQUESTS: 'dingdang_requests',
};

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 使用 service_role key 创建管理员客户端
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { action, params } = await req.json();

    // 验证 family_code 必须存在
    if (!params?.familyCode && !['deleteRecord', 'deleteRequest', 'approveRequest', 'rejectRequest', 'deleteDiary', 'deleteCustomContent', 'deleteTask', 'deleteGift', 'toggleTaskEnabled', 'toggleGiftEnabled', 'textToSpeech'].includes(action)) {
      return new Response(
        JSON.stringify({ error: '缺少 family_code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    switch (action) {
      // ========== Profile ==========
      case 'getOrCreateProfile': {
        const { familyCode } = params;
        // 先尝试获取
        const { data: existing } = await supabaseAdmin
          .from(TABLES.PROFILES)
          .select('*')
          .eq('family_code', familyCode)
          .single();

        if (existing) {
          result = existing;
        } else {
          // 不存在则创建
          const { data: created, error } = await supabaseAdmin
            .from(TABLES.PROFILES)
            .insert({ family_code: familyCode })
            .select()
            .single();
          if (error) throw error;
          result = created;
        }
        break;
      }

      case 'updateProfile': {
        const { familyCode, updates } = params;
        const { error } = await supabaseAdmin
          .from(TABLES.PROFILES)
          .update(updates)
          .eq('family_code', familyCode);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // ========== Diary ==========
      case 'getDiaries': {
        const { familyCode } = params;
        const { data, error } = await supabaseAdmin
          .from(TABLES.DIARIES)
          .select('*')
          .eq('family_code', familyCode)
          .order('date', { ascending: false });
        if (error) throw error;
        result = data;
        break;
      }

      case 'createDiary': {
        const { familyCode, diary } = params;
        const { data, error } = await supabaseAdmin
          .from(TABLES.DIARIES)
          .insert({
            family_code: familyCode,
            date: diary.date,
            content: diary.content,
            photos: diary.photos || [],
            is_draft: diary.is_draft || false,
          })
          .select()
          .single();
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      case 'updateDiary': {
        const { diaryId, updates } = params;
        const { error } = await supabaseAdmin
          .from(TABLES.DIARIES)
          .update(updates)
          .eq('id', diaryId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'deleteDiary': {
        const { diaryId } = params;
        const { error } = await supabaseAdmin
          .from(TABLES.DIARIES)
          .delete()
          .eq('id', diaryId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // ========== Custom Content ==========
      case 'getCustomContents': {
        const { familyCode } = params;
        const { data, error } = await supabaseAdmin
          .from(TABLES.CUSTOM_CONTENTS)
          .select('*')
          .eq('family_code', familyCode)
          .order('sort_order', { ascending: true });
        if (error) throw error;
        result = data;
        break;
      }

      case 'createCustomContent': {
        const { familyCode, content, sortOrder } = params;
        const { data, error } = await supabaseAdmin
          .from(TABLES.CUSTOM_CONTENTS)
          .insert({
            family_code: familyCode,
            title: content.title,
            text: content.text,
            pinyin: content.pinyin || null,
            sort_order: sortOrder,
          })
          .select()
          .single();
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      case 'deleteCustomContent': {
        const { contentId } = params;
        const { error } = await supabaseAdmin
          .from(TABLES.CUSTOM_CONTENTS)
          .delete()
          .eq('id', contentId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // ========== Learning Records ==========
      case 'getLearningRecords': {
        const { familyCode } = params;
        const { data, error } = await supabaseAdmin
          .from(TABLES.LEARNING_RECORDS)
          .select('*')
          .eq('family_code', familyCode);
        if (error) throw error;
        result = data;
        break;
      }

      case 'markCourseAsLearned': {
        const { familyCode, courseId } = params;
        const { error } = await supabaseAdmin
          .from(TABLES.LEARNING_RECORDS)
          .upsert(
            { family_code: familyCode, course_id: courseId },
            { onConflict: 'family_code,course_id' }
          );
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'resetCourseProgress': {
        const { familyCode, newOffset } = params;
        // 更新 offset
        await supabaseAdmin
          .from(TABLES.PROFILES)
          .update({ course_offset: newOffset })
          .eq('family_code', familyCode);
        // 删除学习记录
        await supabaseAdmin
          .from(TABLES.LEARNING_RECORDS)
          .delete()
          .eq('family_code', familyCode);
        result = { success: true };
        break;
      }

      // ========== Tasks ==========
      case 'getTasks': {
        const { familyCode, enabledOnly } = params;
        let query = supabaseAdmin
          .from(TABLES.TASKS)
          .select('*')
          .eq('family_code', familyCode);
        if (enabledOnly) {
          query = query.eq('enabled', true);
        }
        const { data, error } = await query.order('created_at', { ascending: true });
        if (error) throw error;
        result = data;
        break;
      }

      case 'createTask': {
        const { familyCode, task } = params;
        const { data, error } = await supabaseAdmin
          .from(TABLES.TASKS)
          .insert({
            family_code: familyCode,
            name: task.name,
            unit: task.unit,
            score: task.score,
            type: task.type,
            enabled: true,
          })
          .select()
          .single();
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      case 'updateTask': {
        const { taskId, updates } = params;
        const { error } = await supabaseAdmin
          .from(TABLES.TASKS)
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', taskId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'toggleTaskEnabled': {
        const { taskId, enabled } = params;
        const { error } = await supabaseAdmin
          .from(TABLES.TASKS)
          .update({ enabled, updated_at: new Date().toISOString() })
          .eq('id', taskId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'deleteTask': {
        const { taskId } = params;
        const { error } = await supabaseAdmin
          .from(TABLES.TASKS)
          .delete()
          .eq('id', taskId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // ========== Gifts ==========
      case 'getGifts': {
        const { familyCode, enabledOnly } = params;
        let query = supabaseAdmin
          .from(TABLES.GIFTS)
          .select('*')
          .eq('family_code', familyCode);
        if (enabledOnly) {
          query = query.eq('enabled', true).order('score', { ascending: true });
        } else {
          query = query.order('created_at', { ascending: true });
        }
        const { data, error } = await query;
        if (error) throw error;
        result = data;
        break;
      }

      case 'createGift': {
        const { familyCode, gift } = params;
        const { data, error } = await supabaseAdmin
          .from(TABLES.GIFTS)
          .insert({
            family_code: familyCode,
            name: gift.name,
            image: gift.image,
            score: gift.score,
            enabled: true,
          })
          .select()
          .single();
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      case 'updateGift': {
        const { giftId, updates } = params;
        const { error } = await supabaseAdmin
          .from(TABLES.GIFTS)
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', giftId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'toggleGiftEnabled': {
        const { giftId, enabled } = params;
        const { error } = await supabaseAdmin
          .from(TABLES.GIFTS)
          .update({ enabled, updated_at: new Date().toISOString() })
          .eq('id', giftId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'deleteGift': {
        const { giftId } = params;
        const { error } = await supabaseAdmin
          .from(TABLES.GIFTS)
          .delete()
          .eq('id', giftId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // ========== Records ==========
      case 'getRecords': {
        const { familyCode } = params;
        const { data, error } = await supabaseAdmin
          .from(TABLES.RECORDS)
          .select('*')
          .eq('family_code', familyCode)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false });
        if (error) throw error;
        result = data;
        break;
      }

      case 'getRecordsByMonth': {
        const { familyCode, year, month } = params;
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
        const { data, error } = await supabaseAdmin
          .from(TABLES.RECORDS)
          .select('*')
          .eq('family_code', familyCode)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });
        if (error) throw error;
        result = data;
        break;
      }

      case 'getRecordsByDate': {
        const { familyCode, date } = params;
        const { data, error } = await supabaseAdmin
          .from(TABLES.RECORDS)
          .select('*')
          .eq('family_code', familyCode)
          .eq('date', date)
          .order('created_at', { ascending: false });
        if (error) throw error;
        result = data;
        break;
      }

      case 'addRecord': {
        const { familyCode, record } = params;
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabaseAdmin
          .from(TABLES.RECORDS)
          .insert({
            family_code: familyCode,
            task_id: record.task_id,
            task_name: record.task_name,
            score: record.score,
            note: record.note,
            date: record.date || today,
          })
          .select()
          .single();
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      case 'deleteRecord': {
        const { recordId } = params;
        const { error } = await supabaseAdmin
          .from(TABLES.RECORDS)
          .delete()
          .eq('id', recordId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'getTotalScore': {
        const { familyCode } = params;
        const { data, error } = await supabaseAdmin
          .from(TABLES.RECORDS)
          .select('score')
          .eq('family_code', familyCode);
        if (error) throw error;
        const total = (data || []).reduce((sum, r) => sum + (r.score || 0), 0);
        result = { total };
        break;
      }

      // ========== Requests ==========
      case 'getRequests': {
        const { familyCode, pendingOnly } = params;
        let query = supabaseAdmin
          .from(TABLES.REQUESTS)
          .select('*')
          .eq('family_code', familyCode);
        if (pendingOnly) {
          query = query.eq('status', 'pending');
        }
        const { data, error } = await query.order('date', { ascending: false });
        if (error) throw error;
        result = data;
        break;
      }

      case 'createRequest': {
        const { familyCode, request } = params;
        // 检查积分
        const { data: records } = await supabaseAdmin
          .from(TABLES.RECORDS)
          .select('score')
          .eq('family_code', familyCode);
        const totalScore = (records || []).reduce((sum, r) => sum + (r.score || 0), 0);
        if (totalScore < request.score) {
          result = { success: false, error: '积分不足' };
          break;
        }

        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabaseAdmin
          .from(TABLES.REQUESTS)
          .insert({
            family_code: familyCode,
            gift_id: request.gift_id,
            gift_name: request.gift_name,
            score: request.score,
            status: 'pending',
            date: today,
          })
          .select()
          .single();
        if (error) throw error;
        result = { success: true, data };
        break;
      }

      case 'approveRequest': {
        const { requestId } = params;
        // 获取申请详情
        const { data: request, error: fetchError } = await supabaseAdmin
          .from(TABLES.REQUESTS)
          .select('*')
          .eq('id', requestId)
          .single();
        if (fetchError || !request) {
          result = { success: false, error: '申请不存在' };
          break;
        }

        // 检查积分
        const { data: records } = await supabaseAdmin
          .from(TABLES.RECORDS)
          .select('score')
          .eq('family_code', request.family_code);
        const totalScore = (records || []).reduce((sum, r) => sum + (r.score || 0), 0);
        if (totalScore < request.score) {
          result = { success: false, error: '积分不足，无法批准' };
          break;
        }

        // 更新状态
        await supabaseAdmin
          .from(TABLES.REQUESTS)
          .update({ status: 'approved' })
          .eq('id', requestId);

        // 扣除积分（gift_name 已经是加密的，直接传递）
        await supabaseAdmin
          .from(TABLES.RECORDS)
          .insert({
            family_code: request.family_code,
            task_name: request.gift_name, // 已加密
            score: -request.score,
            note: 'ENC:gift_exchange', // 简单标记
            date: new Date().toISOString().split('T')[0],
          });

        result = { success: true };
        break;
      }

      case 'rejectRequest': {
        const { requestId } = params;
        const { error } = await supabaseAdmin
          .from(TABLES.REQUESTS)
          .update({ status: 'rejected' })
          .eq('id', requestId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'deleteRequest': {
        const { requestId } = params;
        const { error } = await supabaseAdmin
          .from(TABLES.REQUESTS)
          .delete()
          .eq('id', requestId)
          .eq('status', 'pending');
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'getPendingCount': {
        const { familyCode } = params;
        const { count, error } = await supabaseAdmin
          .from(TABLES.REQUESTS)
          .select('*', { count: 'exact', head: true })
          .eq('family_code', familyCode)
          .eq('status', 'pending');
        if (error) throw error;
        result = { count: count || 0 };
        break;
      }

      // ========== 批量加载 ==========
      case 'loadAllUserData': {
        const { familyCode } = params;

        // 先获取或创建 Profile
        let profile;
        const { data: existing } = await supabaseAdmin
          .from(TABLES.PROFILES)
          .select('*')
          .eq('family_code', familyCode)
          .single();

        if (existing) {
          profile = existing;
        } else {
          const { data: created, error } = await supabaseAdmin
            .from(TABLES.PROFILES)
            .insert({ family_code: familyCode })
            .select()
            .single();
          if (error) throw error;
          profile = created;
        }

        // 并行获取所有其他数据
        const [diariesResult, customContentsResult, learningRecordsResult] = await Promise.all([
          supabaseAdmin
            .from(TABLES.DIARIES)
            .select('*')
            .eq('family_code', familyCode)
            .order('date', { ascending: false }),
          supabaseAdmin
            .from(TABLES.CUSTOM_CONTENTS)
            .select('*')
            .eq('family_code', familyCode)
            .order('sort_order', { ascending: true }),
          supabaseAdmin
            .from(TABLES.LEARNING_RECORDS)
            .select('*')
            .eq('family_code', familyCode),
        ]);

        result = {
          profile,
          diaries: diariesResult.data || [],
          customContents: customContentsResult.data || [],
          learningRecords: learningRecordsResult.data || [],
        };
        break;
      }

      // ========== TTS 语音合成代理 ==========
      case 'textToSpeech': {
        const { text } = params;
        const MINIMAX_API_KEY = Deno.env.get('MINIMAX_API_KEY') || '';
        const MINIMAX_GROUP_ID = Deno.env.get('MINIMAX_GROUP_ID') || '';

        const ttsResponse = await fetch(
          `https://api.minimax.chat/v1/t2a_v2?GroupId=${MINIMAX_GROUP_ID}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${MINIMAX_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'speech-2.6-turbo',
              text,
              stream: false,
              timbre_weights: [
                { voice_id: 'Chinese (Mandarin)_Gentle_Senior', weight: 100 }
              ],
              voice_setting: {
                voice_id: '',
                speed: 0.8,
                vol: 1,
                pitch: 0,
                emotion: 'happy',
                latex_read: false,
              },
              audio_setting: {
                sample_rate: 32000,
                bitrate: 128000,
                format: 'mp3',
              },
              language_boost: 'auto',
            }),
          }
        );

        if (!ttsResponse.ok) {
          const errText = await ttsResponse.text();
          throw new Error(`MiniMax TTS error: ${errText}`);
        }

        const ttsJson = await ttsResponse.json();
        if (ttsJson.base_resp?.status_code !== 0 && ttsJson.base_resp?.status_code !== undefined) {
          throw new Error(`MiniMax TTS API error: ${JSON.stringify(ttsJson.base_resp)}`);
        }

        result = { audio: ttsJson.data?.audio || null };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `未知操作: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
