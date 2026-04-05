/**
 * Session REST API Routes
 *
 * 提供会话的 CRUD 操作接口，数据来自 CLI 共享的 JSONL 文件。
 *
 * Routes:
 *   GET    /api/sessions            — 列出会话
 *   GET    /api/sessions/:id        — 获取会话详情
 *   GET    /api/sessions/:id/messages — 获取会话消息
 *   POST   /api/sessions            — 创建新会话
 *   DELETE /api/sessions/:id        — 删除会话
 *   PATCH  /api/sessions/:id        — 重命名会话
 */

import { sessionService } from '../services/sessionService.js'
import { ApiError, errorResponse } from '../middleware/errorHandler.js'

export async function handleSessionsApi(
  req: Request,
  url: URL,
  segments: string[]
): Promise<Response> {
  try {
    // segments: ['api', 'sessions', ...rest]
    const sessionId = segments[2] // may be undefined
    const subResource = segments[3] // e.g. 'messages'

    // -----------------------------------------------------------------------
    // Collection routes: /api/sessions
    // -----------------------------------------------------------------------
    if (!sessionId) {
      switch (req.method) {
        case 'GET':
          return await listSessions(url)
        case 'POST':
          return await createSession(req)
        default:
          return Response.json(
            { error: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} not allowed` },
            { status: 405 }
          )
      }
    }

    // -----------------------------------------------------------------------
    // Sub-resource routes: /api/sessions/:id/messages
    // -----------------------------------------------------------------------
    if (subResource === 'messages') {
      if (req.method !== 'GET') {
        return Response.json(
          { error: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} not allowed` },
          { status: 405 }
        )
      }
      return await getSessionMessages(sessionId)
    }

    // Route to conversations handler if sub-resource is 'chat'
    if (subResource === 'chat') {
      // This is handled by the conversations API, but in case the router
      // forwards it here, we delegate to the conversations module.
      // Normally the router should route /api/sessions/:id/chat/* to conversations.
      return Response.json(
        { error: 'NOT_FOUND', message: 'Use /api/sessions/:id/chat via conversations API' },
        { status: 404 }
      )
    }

    // -----------------------------------------------------------------------
    // Item routes: /api/sessions/:id
    // -----------------------------------------------------------------------
    switch (req.method) {
      case 'GET':
        return await getSession(sessionId)
      case 'DELETE':
        return await deleteSession(sessionId)
      case 'PATCH':
        return await patchSession(req, sessionId)
      default:
        return Response.json(
          { error: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} not allowed` },
          { status: 405 }
        )
    }
  } catch (error) {
    return errorResponse(error)
  }
}

// ============================================================================
// Handler implementations
// ============================================================================

async function listSessions(url: URL): Promise<Response> {
  const project = url.searchParams.get('project') || undefined
  const limit = parseInt(url.searchParams.get('limit') || '20', 10)
  const offset = parseInt(url.searchParams.get('offset') || '0', 10)

  if (isNaN(limit) || limit < 0) {
    throw ApiError.badRequest('Invalid limit parameter')
  }
  if (isNaN(offset) || offset < 0) {
    throw ApiError.badRequest('Invalid offset parameter')
  }

  const result = await sessionService.listSessions({ project, limit, offset })
  return Response.json(result)
}

async function getSession(sessionId: string): Promise<Response> {
  const detail = await sessionService.getSession(sessionId)
  if (!detail) {
    throw ApiError.notFound(`Session not found: ${sessionId}`)
  }
  return Response.json(detail)
}

async function getSessionMessages(sessionId: string): Promise<Response> {
  const messages = await sessionService.getSessionMessages(sessionId)
  return Response.json({ messages })
}

async function createSession(req: Request): Promise<Response> {
  let body: { workDir?: string }
  try {
    body = (await req.json()) as { workDir?: string }
  } catch {
    throw ApiError.badRequest('Invalid JSON body')
  }

  if (!body.workDir || typeof body.workDir !== 'string') {
    throw ApiError.badRequest('workDir (string) is required in request body')
  }

  const result = await sessionService.createSession(body.workDir)
  return Response.json(result, { status: 201 })
}

async function deleteSession(sessionId: string): Promise<Response> {
  await sessionService.deleteSession(sessionId)
  return Response.json({ ok: true })
}

async function patchSession(req: Request, sessionId: string): Promise<Response> {
  let body: { title?: string }
  try {
    body = (await req.json()) as { title?: string }
  } catch {
    throw ApiError.badRequest('Invalid JSON body')
  }

  if (!body.title || typeof body.title !== 'string') {
    throw ApiError.badRequest('title (string) is required in request body')
  }

  await sessionService.renameSession(sessionId, body.title)
  return Response.json({ ok: true })
}
