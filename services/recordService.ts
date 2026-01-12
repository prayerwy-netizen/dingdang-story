import { supabase, TABLES } from './supabase';
import { PointRecord } from '../types';

// 数据库记录类型
interface RecordDbRow {
  id: string;
  family_code: string;
  task_id?: string;
  task_name: string;
  score: number;
  note?: string;
  date: string;
  created_at?: string;
}

// 获取积分记录列表
export async function getRecords(familyCode: string): Promise<PointRecord[]> {
  const { data, error } = await supabase
    .from(TABLES.RECORDS)
    .select('*')
    .eq('family_code', familyCode)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取积分记录失败:', error);
    return [];
  }
  return (data || []).map(toFrontendRecord);
}

// 获取指定月份的记录
export async function getRecordsByMonth(
  familyCode: string,
  year: number,
  month: number
): Promise<PointRecord[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const { data, error } = await supabase
    .from(TABLES.RECORDS)
    .select('*')
    .eq('family_code', familyCode)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    console.error('获取月度记录失败:', error);
    return [];
  }
  return (data || []).map(toFrontendRecord);
}

// 获取指定日期的记录
export async function getRecordsByDate(
  familyCode: string,
  date: string
): Promise<PointRecord[]> {
  const { data, error } = await supabase
    .from(TABLES.RECORDS)
    .select('*')
    .eq('family_code', familyCode)
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取日期记录失败:', error);
    return [];
  }
  return (data || []).map(toFrontendRecord);
}

// 添加积分记录
export async function addRecord(
  familyCode: string,
  record: {
    task_id?: string;
    task_name: string;
    score: number;
    note?: string;
    date?: string;
  }
): Promise<{ success: boolean; data?: PointRecord; error?: string }> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
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

  if (error) {
    console.error('添加积分记录失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data: toFrontendRecord(data) };
}

// 删除积分记录
export async function deleteRecord(
  recordId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.RECORDS)
    .delete()
    .eq('id', recordId);

  if (error) {
    console.error('删除积分记录失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// 获取总积分
export async function getTotalScore(familyCode: string): Promise<number> {
  const { data, error } = await supabase
    .from(TABLES.RECORDS)
    .select('score')
    .eq('family_code', familyCode);

  if (error) {
    console.error('计算总积分失败:', error);
    return 0;
  }

  return (data || []).reduce((sum, record) => sum + (record.score || 0), 0);
}

// 获取每日积分汇总（用于日历显示）
export async function getDailyScores(
  familyCode: string,
  year: number,
  month: number
): Promise<Map<string, number>> {
  const records = await getRecordsByMonth(familyCode, year, month);
  const dailyScores = new Map<string, number>();

  for (const record of records) {
    const current = dailyScores.get(record.date) || 0;
    dailyScores.set(record.date, current + record.score);
  }

  return dailyScores;
}

// 转换为前端格式
function toFrontendRecord(record: RecordDbRow): PointRecord {
  return {
    id: record.id,
    family_code: record.family_code,
    task_id: record.task_id,
    task_name: record.task_name,
    score: record.score,
    note: record.note,
    date: record.date,
  };
}
