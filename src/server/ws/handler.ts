/**
 * WebSocket connection handler
 *
 * 管理 WebSocket 连接生命周期，处理消息路由。
 */

import type { ServerWebSocket } from 'bun'
import type { ClientMessage, ServerMessage, WebSocketSession } from './events.js'

export type WebSocketData = {
  sessionId: string
  connectedAt: number
}

// Active WebSocket sessions
const activeSessions = new Map<string, ServerWebSocket<WebSocketData>>()

export const handleWebSocket = {
  open(ws: ServerWebSocket<WebSocketData>) {
    const { sessionId } = ws.data
    console.log(`[WS] Client connected for session: ${sessionId}`)

    activeSessions.set(sessionId, ws)

    const msg: ServerMessage = { type: 'connected', sessionId }
    ws.send(JSON.stringify(msg))
  },

  message(ws: ServerWebSocket<WebSocketData>, rawMessage: string | Buffer) {
    try {
      const message = JSON.parse(
        typeof rawMessage === 'string' ? rawMessage : rawMessage.toString()
      ) as ClientMessage

      switch (message.type) {
        case 'user_message':
          handleUserMessage(ws, message)
          break

        case 'permission_response':
          handlePermissionResponse(ws, message)
          break

        case 'stop_generation':
          handleStopGeneration(ws)
          break

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' } satisfies ServerMessage))
          break

        default:
          sendError(ws, `Unknown message type: ${(message as any).type}`, 'UNKNOWN_TYPE')
      }
    } catch (error) {
      sendError(ws, `Invalid message format: ${error}`, 'PARSE_ERROR')
    }
  },

  close(ws: ServerWebSocket<WebSocketData>, code: number, reason: string) {
    const { sessionId } = ws.data
    console.log(`[WS] Client disconnected from session: ${sessionId} (${code}: ${reason})`)
    activeSessions.delete(sessionId)
  },

  drain(ws: ServerWebSocket<WebSocketData>) {
    // Backpressure handling - called when the socket is ready to receive more data
  },
}

// ============================================================================
// Message handlers (to be implemented by conversationService)
// ============================================================================

async function handleUserMessage(
  ws: ServerWebSocket<WebSocketData>,
  message: Extract<ClientMessage, { type: 'user_message' }>
) {
  const { sessionId } = ws.data

  // Send thinking status
  sendMessage(ws, { type: 'status', state: 'thinking', verb: 'Thinking' })

  // TODO: Integrate with ConversationService to process the message
  // For now, echo back a placeholder response
  sendMessage(ws, { type: 'content_start', blockType: 'text' })
  sendMessage(ws, {
    type: 'content_delta',
    text: `[Server] Received message for session ${sessionId}: "${message.content}". Chat integration pending.`,
  })
  sendMessage(ws, {
    type: 'message_complete',
    usage: { input_tokens: 0, output_tokens: 0 },
  })
  sendMessage(ws, { type: 'status', state: 'idle' })
}

function handlePermissionResponse(
  ws: ServerWebSocket<WebSocketData>,
  message: Extract<ClientMessage, { type: 'permission_response' }>
) {
  // TODO: Forward permission response to the active tool execution
  console.log(`[WS] Permission response for ${message.requestId}: ${message.allowed}`)
}

function handleStopGeneration(ws: ServerWebSocket<WebSocketData>) {
  // TODO: Abort the active generation for this session
  console.log(`[WS] Stop generation requested for session: ${ws.data.sessionId}`)
  sendMessage(ws, { type: 'status', state: 'idle' })
}

// ============================================================================
// Helpers
// ============================================================================

function sendMessage(ws: ServerWebSocket<WebSocketData>, message: ServerMessage) {
  ws.send(JSON.stringify(message))
}

function sendError(ws: ServerWebSocket<WebSocketData>, message: string, code: string) {
  sendMessage(ws, { type: 'error', message, code })
}

/**
 * Send a message to a specific session's WebSocket (for use by services)
 */
export function sendToSession(sessionId: string, message: ServerMessage): boolean {
  const ws = activeSessions.get(sessionId)
  if (!ws) return false
  ws.send(JSON.stringify(message))
  return true
}

export function getActiveSessionIds(): string[] {
  return Array.from(activeSessions.keys())
}
