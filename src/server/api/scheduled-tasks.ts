/**
 * Scheduled Tasks REST API
 *
 * GET    /api/scheduled-tasks      — 获取任务列表
 * POST   /api/scheduled-tasks      — 创建任务
 * PUT    /api/scheduled-tasks/:id  — 更新任务
 * DELETE /api/scheduled-tasks/:id  — 删除任务
 */

import { CronService } from '../services/cronService.js'
import { ApiError, errorResponse } from '../middleware/errorHandler.js'

const cronService = new CronService()

export async function handleScheduledTasksApi(
  req: Request,
  _url: URL,
  segments: string[],
): Promise<Response> {
  try {
    const method = req.method
    const taskId = segments[2] // /api/scheduled-tasks/:id

    // ── GET /api/scheduled-tasks ──────────────────────────────────────────
    if (method === 'GET' && !taskId) {
      const tasks = await cronService.listTasks()
      return Response.json({ tasks })
    }

    // ── POST /api/scheduled-tasks ─────────────────────────────────────────
    if (method === 'POST' && !taskId) {
      const body = await parseJsonBody(req)
      const task = await cronService.createTask({
        name: body.name as string | undefined,
        description: body.description as string | undefined,
        cron: body.cron as string,
        prompt: body.prompt as string,
        recurring: body.recurring as boolean | undefined,
        permanent: body.permanent as boolean | undefined,
        permissionMode: body.permissionMode as string | undefined,
        model: body.model as string | undefined,
        folderPath: body.folderPath as string | undefined,
        useWorktree: body.useWorktree as boolean | undefined,
      })
      return Response.json({ task }, { status: 201 })
    }

    // ── PUT /api/scheduled-tasks/:id ──────────────────────────────────────
    if (method === 'PUT' && taskId) {
      const body = await parseJsonBody(req)
      const task = await cronService.updateTask(taskId, body)
      return Response.json({ task })
    }

    // ── DELETE /api/scheduled-tasks/:id ───────────────────────────────────
    if (method === 'DELETE' && taskId) {
      await cronService.deleteTask(taskId)
      return Response.json({ ok: true })
    }

    throw new ApiError(
      405,
      `Method ${method} not allowed on /api/scheduled-tasks${taskId ? `/${taskId}` : ''}`,
      'METHOD_NOT_ALLOWED',
    )
  } catch (error) {
    return errorResponse(error)
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function parseJsonBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>
  } catch {
    throw ApiError.badRequest('Invalid JSON body')
  }
}
