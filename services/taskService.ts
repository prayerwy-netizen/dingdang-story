import { supabase, TABLES } from './supabase';
import { Task } from '../types';

// 数据库记录类型
interface TaskRecord {
  id: string;
  family_code: string;
  name: string;
  unit: string;
  score: number;
  type: 'positive' | 'negative';
  enabled: boolean;
  created_at: string;
  updated_at?: string;
}

// 获取任务列表
export async function getTasks(familyCode: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from(TABLES.TASKS)
    .select('*')
    .eq('family_code', familyCode)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('获取任务列表失败:', error);
    return [];
  }
  return (data || []).map(toFrontendTask);
}

// 获取启用的任务列表
export async function getEnabledTasks(familyCode: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from(TABLES.TASKS)
    .select('*')
    .eq('family_code', familyCode)
    .eq('enabled', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('获取启用任务列表失败:', error);
    return [];
  }
  return (data || []).map(toFrontendTask);
}

// 创建任务
export async function createTask(
  familyCode: string,
  task: {
    name: string;
    unit: string;
    score: number;
    type: 'positive' | 'negative';
  }
): Promise<{ success: boolean; data?: Task; error?: string }> {
  const { data, error } = await supabase
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

  if (error) {
    console.error('创建任务失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data: toFrontendTask(data) };
}

// 更新任务
export async function updateTask(
  taskId: string,
  updates: Partial<Pick<Task, 'name' | 'unit' | 'score' | 'type' | 'enabled'>>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.TASKS)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) {
    console.error('更新任务失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// 切换任务启用状态
export async function toggleTaskEnabled(
  taskId: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateTask(taskId, { enabled });
}

// 删除任务
export async function deleteTask(
  taskId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.TASKS)
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('删除任务失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// 转换为前端格式
function toFrontendTask(record: TaskRecord): Task {
  return {
    id: record.id,
    family_code: record.family_code,
    name: record.name,
    unit: record.unit,
    score: record.score,
    type: record.type,
    enabled: record.enabled,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}
