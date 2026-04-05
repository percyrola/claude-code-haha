# Claude Code Desktop App — 产品需求文档 (PRD)

## 一、项目概述

### 1.1 目标

完全复刻 Claude Code Desktop App 的桌面端 GUI 界面。原始应用是 Anthropic 出品的 AI 编程助手，采用跨平台桌面架构（Electron），支持 macOS/Windows。

### 1.2 原始技术栈

- **前端框架**: React 18 + TypeScript
- **终端渲染**: Ink（自定义 fork，基于 Yoga 布局引擎）
- **桌面容器**: Electron
- **状态管理**: React Context + 自定义 Store（类 Zustand）
- **构建工具**: Bun

### 1.3 复刻技术栈建议

- **前端框架**: React 18 + TypeScript
- **UI 渲染**: 标准浏览器 DOM（替换 Ink 终端渲染）
- **桌面容器**: Electron 或 Tauri
- **样式方案**: TailwindCSS v4
- **状态管理**: Zustand 或 Jotai

---

## 二、页面清单

| 编号 | 页面 | 描述 | 优先级 |
|------|------|------|--------|
| P1 | 顶部标题栏 | macOS 窗口控件 + Chat/Cowork/Code 标签页 | P0 |
| P2 | 左侧边栏 | 导航菜单 + 项目过滤 + 会话列表 | P0 |
| P3 | 底部状态栏 | 用户信息 + 仓库信息 + 模式切换 | P1 |
| P4 | Code 空状态页 | 吉祥物 + 输入框 + 快捷入口 | P0 |
| P5 | Code 活跃会话页 | 消息列表 + 输入区 + 工具调用展示 | P0 |
| P6 | 权限模式选择器 | 下拉菜单：Ask/Auto/Plan/Bypass | P0 |
| P7 | 模型选择器 | 下拉菜单：模型列表 + Effort 等级 | P0 |
| P8 | Scheduled 定时任务页 | 任务列表 + 空状态 | P1 |
| P9 | 新建定时任务模态框 | 创建定时任务表单 | P1 |
| P10 | Search 搜索页 | 全局内容搜索 | P1 |
| P11 | Dispatch 分发页 | Agent 管理 + 任务分发 | P2 |
| P12 | Customize 设置页 | Status/Config/Usage 标签页 | P1 |

---

## 三、功能需求详述

### 3.1 顶部标题栏 (P1)

**功能描述**: macOS 风格标题栏，集成窗口控件和主导航标签页。

**需求项**:
- R-001: 显示 macOS 红绿灯按钮（关闭/最小化/全屏）
- R-002: 显示前进/后退导航箭头
- R-003: 显示 `Chat` / `Cowork` / `Code` 三个标签页，支持切换
- R-004: 活跃标签页高亮显示
- R-005: 标题栏区域支持拖拽移动窗口

**源码参考**: `src/components/design-system/Tabs.tsx`

---

### 3.2 左侧边栏 (P2)

**功能描述**: 垂直导航面板，包含功能入口和会话管理。

#### 导航菜单

- R-006: 显示 5 个导航项（New session / Search / Scheduled / Dispatch / Customize）
- R-007: 点击导航项切换主内容区页面
- R-008: 当前选中项高亮显示

#### 项目过滤器

- R-009: 显示 `All projects ▾` 下拉选择器
- R-010: 可选择特定项目过滤会话列表
- R-011: 右侧筛选图标，点击打开高级过滤

#### 会话列表

- R-012: 按时间分组显示会话（Today / Previous 7 Days / Previous 30 Days / Older）
- R-013: 每项显示会话标题（首条用户消息摘要）
- R-014: 选中会话高亮，左侧显示圆点指示器
- R-015: 支持模糊搜索过滤会话列表
- R-016: 右键菜单支持重命名、删除操作
- R-017: 点击会话切换到对应的活跃会话页

**数据模型**:
```typescript
type Session = {
  id: string
  title: string           // 首条消息摘要或自定义标题
  createdAt: Date
  modifiedAt: Date
  messageCount: number
  projectName?: string    // 所属项目
  summary?: string        // AI 生成的摘要
}
```

**源码参考**: `src/components/LogSelector.tsx`, `src/types/logs.ts`

---

### 3.3 底部状态栏 (P3)

**需求项**:
- R-018: 左侧显示用户头像 + 用户名 + 订阅等级
- R-019: 显示下载按钮和更多操作按钮
- R-020: 中部显示当前 Git 仓库名称（GitHub 图标 + 仓库名）
- R-021: 显示当前 Git 分支（分支图标 + 分支名）
- R-022: 显示 `worktree` 复选框，控制是否使用 Git worktree
- R-023: 右侧显示 `Local ▾` / `Remote ▾` 运行模式切换

**源码参考**: `src/components/StatusLine.tsx`

---

### 3.4 Code 空状态页 (P4)

**需求项**:
- R-024: 居中显示 Clawd 吉祥物（像素风格小动物，橙色）
- R-025: 显示输入框，圆角矩形，带 placeholder 文本
- R-026: 输入框左侧 `+` 按钮，支持添加附件/上下文
- R-027: 输入框左下显示权限模式选择器
- R-028: 输入框右下显示模型选择器
- R-029: 输入框右侧显示麦克风图标（语音输入）

**源码参考**: `src/components/LogoV2/`, `src/components/PromptInput/`

---

### 3.5 Code 活跃会话页 (P5)

**功能描述**: 最核心的页面，显示 AI 对话过程。

#### 会话标题栏

- R-030: 显示会话标题，可点击修改
- R-031: 右上角显示 `▷ Preview ▾` 按钮

#### 消息列表

- R-032: 虚拟滚动渲染消息列表，支持大量消息高性能显示
- R-033: 用户消息右对齐，暖色背景气泡
- R-034: AI 文本回复左对齐，支持 Markdown 富文本渲染
- R-035: AI 思考过程可折叠展示
- R-036: 工具调用块可折叠，显示工具名 + 参数摘要
- R-037: 系统消息居中灰色显示
- R-038: 支持消息分组折叠（如 `▸ Initialized your session`）
- R-039: 折叠区段内显示工具调用列表（`Agent 描述` / `Bash · N tool calls`）
- R-040: 上下文压缩分界线标记
- R-041: 滚动到顶部时显示 "N new messages" 跳转提示

**消息类型数据模型**:
```typescript
type MessageType =
  | 'user_text'              // 用户文本
  | 'user_image'             // 用户图片
  | 'assistant_text'         // AI 文本
  | 'assistant_thinking'     // AI 思考
  | 'assistant_tool_use'     // AI 工具调用
  | 'user_tool_result'       // 工具执行结果
  | 'system_text'            // 系统消息
  | 'system_error'           // API 错误
  | 'grouped_tool_use'       // 分组工具调用
  | 'collapsed_section'      // 折叠区段
  | 'compact_boundary'       // 压缩分界线
  | 'attachment'             // 附件
```

#### 实时状态指示器

- R-042: AI 处理中显示闪烁图标 + 动态动词（`Crafting...` / `Thinking...`）
- R-043: 显示已用时间计时器
- R-044: 显示已生成 token 数
- R-045: 提供停止生成按钮

#### 底部输入区

- R-046: 多行文本输入框，支持自动扩展高度
- R-047: 左侧 `+` 按钮添加附件
- R-048: 显示当前权限模式指示器
- R-049: 显示当前模型选择器
- R-050: AI 运行中显示停止按钮

**源码参考**: `src/screens/REPL.tsx`, `src/components/FullscreenLayout.tsx`, `src/components/VirtualMessageList.tsx`

---

### 3.6 权限模式选择器 (P6)

**需求项**:
- R-051: 下拉菜单显示 4 个权限选项
- R-052: 每个选项显示图标 + 名称 + 描述
- R-053: 选中项显示 ✓ 标记
- R-054: 切换后即时生效

**选项列表**:

| 选项 | 图标 | 描述 |
|------|------|------|
| Ask permissions | ⚙ | Always ask before making changes |
| Auto accept edits | `</>` | Automatically accept all file edits |
| Plan mode | 📋 | Create a plan before making changes |
| Bypass permissions | ⚠ | Accepts all permissions |

**数据模型**:
```typescript
type PermissionMode = 'default' | 'acceptEdits' | 'plan' | 'bypassPermissions' | 'dontAsk' | 'auto'
```

**源码参考**: `src/types/permissions.ts`, `src/utils/permissions/PermissionMode.ts`

---

### 3.7 模型选择器 (P7)

**需求项**:
- R-055: 上部显示模型列表，下部显示 Effort 等级（分隔线分割）
- R-056: 每个模型显示名称 + 简短描述
- R-057: 选中模型显示 ✓ 标记
- R-058: Effort 等级: Low / Medium / High / Max
- R-059: 选中 Effort 显示 ✓ 标记
- R-060: 不同模型支持不同的 Effort 范围

**模型列表**:

| 模型 | 描述 |
|------|------|
| Opus 4.6 | Most capable for ambitious work |
| Opus 4.6 1M | Most capable for ambitious work |
| Sonnet 4.6 | Most efficient for everyday tasks |
| Haiku 4.5 | Fastest for quick answers |

**源码参考**: `src/components/ModelPicker.tsx`, `src/utils/model/modelOptions.ts`, `src/utils/effort.ts`

---

### 3.8 Scheduled 定时任务页 (P8)

**需求项**:
- R-061: 页面标题 `Scheduled tasks`
- R-062: 描述文本说明如何使用定时任务
- R-063: 空状态显示时钟图标 + `No scheduled tasks yet.`
- R-064: 右上角 `+ New task` 按钮
- R-065: 有任务时显示任务列表（名称 + 描述 + 频率 + 下次执行时间）
- R-066: 每项支持编辑、删除操作

**数据模型**:
```typescript
type ScheduledTask = {
  id: string
  name: string
  description: string
  prompt: string
  cron: string              // 5-field cron 表达式
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  time: string              // HH:mm
  createdAt: number
  lastFiredAt?: number
  recurring: boolean
  permissionMode: PermissionMode
  model: string
  folderPath?: string
  useWorktree: boolean
}
```

**源码参考**: `src/utils/cronTasks.ts`, `src/tools/ScheduleCronTool/`

---

### 3.9 新建定时任务模态框 (P9)

**需求项**:
- R-067: 模态框标题 `New scheduled task`
- R-068: Info 横幅: `Local tasks only run while your computer is awake.`
- R-069: Name 文本输入（必填）
- R-070: Description 文本输入（必填）
- R-071: Prompt 多行文本输入
- R-072: Permissions 下拉选择器
- R-073: Model 下拉选择器
- R-074: Select folder 按钮
- R-075: worktree 复选框
- R-076: Frequency 下拉选择（Daily/Weekly/Monthly/Custom）
- R-077: Time 时间选择器
- R-078: 底部注释文本
- R-079: Cancel / Create task 操作按钮

---

### 3.10 Search 搜索页 (P10)

**需求项**:
- R-080: 搜索输入框，支持实时搜索
- R-081: 防抖输入（100ms）
- R-082: 搜索结果列表：文件路径 + 行号 + 匹配文本高亮
- R-083: 选中结果显示上下文代码预览（±4 行）
- R-084: 最多 500 条结果，每文件最多 10 条

**源码参考**: `src/components/GlobalSearchDialog.tsx`, `src/utils/ripgrep.ts`

---

### 3.11 Dispatch 分发页 (P11)

**需求项**:
- R-085: Agent 列表：显示已配置的 Agent 定义
- R-086: Agent 编辑器：创建/编辑 Agent 配置（名称、描述、模型、工具、颜色）
- R-087: 任务监控面板：后台任务状态列表
- R-088: Remote 会话管理

**源码参考**: `src/components/agents/`, `src/components/tasks/`

---

### 3.12 Customize 设置页 (P12)

**需求项**:
- R-089: Status 标签：系统诊断信息展示
- R-090: Config 标签：权限规则编辑 + MCP 服务器配置
- R-091: Usage 标签：Token 用量和成本统计
- R-092: 主题选择器
- R-093: 输出风格选择器
- R-094: MCP 服务器管理面板

**源码参考**: `src/components/Settings/`, `src/components/mcp/`

---

## 四、交互组件需求

### 4.1 权限请求对话框

**功能描述**: AI 执行工具前弹出的确认对话框。

- R-095: Bash 命令权限请求 — 显示命令内容
- R-096: 文件编辑权限请求 — 显示 diff 预览
- R-097: 文件写入权限请求 — 显示文件路径
- R-098: 网络请求权限请求 — 显示 URL
- R-099: 操作按钮：允许 / 拒绝 / 总是允许 / 总是拒绝

**源码参考**: `src/components/permissions/`

### 4.2 Markdown 渲染器

- R-100: 标题、列表、粗体/斜体
- R-101: 代码块语法高亮
- R-102: 表格渲染
- R-103: 文件路径可点击跳转
- R-104: 图片内联显示

**源码参考**: `src/components/Markdown.tsx`, `src/components/HighlightedCode/`

### 4.3 Diff 展示

- R-105: 添加行绿色 / 删除行红色
- R-106: 行号显示
- R-107: 文件路径头部
- R-108: 行内 word-level diff 高亮

**源码参考**: `src/components/StructuredDiff.tsx`, `src/components/diff/`

### 4.4 通知系统

- R-109: Toast 通知（成功/错误/警告/信息）
- R-110: 自动消失或手动关闭
- R-111: 队列管理

**源码参考**: `src/context/notifications.tsx`

### 4.5 通用对话框

- R-112: 对话框基础组件（标题 + 内容 + 按钮）
- R-113: 模态遮罩层
- R-114: ESC 关闭最上层对话框

**源码参考**: `src/components/design-system/Dialog.tsx`

### 4.6 下拉选择器

- R-115: 单选 / 多选模式
- R-116: 键盘导航（↑↓ 选择 / Enter 确认 / Esc 关闭）
- R-117: 搜索过滤
- R-118: ✓ 选中标记

**源码参考**: `src/components/CustomSelect/`

---

## 五、数据模型

### 5.1 全局应用状态 (AppState)

```typescript
type AppState = {
  // 模型设置
  mainLoopModel: string | null          // 当前模型 ID
  effort: 'low' | 'medium' | 'high' | 'max'
  
  // 视图状态
  expandedView: 'none' | 'tasks' | 'teammates'
  footerSelection: 'tasks' | 'tmux' | 'bagel' | 'teams' | 'bridge' | 'companion' | null
  
  // 权限
  permissionMode: PermissionMode
  
  // 任务
  tasks: Record<string, TaskState>
  foregroundedTaskId?: string
  viewingAgentTaskId?: string
  
  // MCP 服务器
  mcp: {
    clients: MCPConnection[]
    tools: Tool[]
    commands: Command[]
  }
  
  // 团队协作
  teamContext?: {
    teamName: string
    teammates: Record<string, TeammateInfo>
    isLeader: boolean
  }
  
  // 通知
  notifications: {
    current: Notification | null
    queue: Notification[]
  }
  
  // 思考模式
  thinkingEnabled: boolean
  
  // 设置
  settings: Settings
}
```

**源码参考**: `src/state/AppStateStore.ts`

### 5.2 消息模型

```typescript
type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: ContentBlock[]
  timestamp: number
  model?: string
  metadata?: MessageMetadata
}

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; source: ImageSource }
  | { type: 'tool_use'; id: string; name: string; input: any }
  | { type: 'tool_result'; tool_use_id: string; content: any }
  | { type: 'thinking'; thinking: string }
```

### 5.3 任务状态模型

```typescript
type TaskState =
  | { type: 'local_shell'; command: string; status: 'running' | 'completed' | 'failed' }
  | { type: 'local_agent'; agentName: string; status: 'running' | 'completed' }
  | { type: 'remote_agent'; url: string; status: 'connecting' | 'connected' | 'disconnected' }
  | { type: 'in_process_teammate'; name: string; agentType: string }
```

---

## 六、导航与路由

### 6.1 导航模型

应用采用**状态驱动导航**（非 URL 路由）:

```
顶级切换: Chat / Cowork / Code (标签页)
         ↓
侧边栏导航: New session → Code 空状态
            Search → 搜索页
            Scheduled → 定时任务页
            Dispatch → 分发页
            Customize → 设置页
         ↓
会话列表: 点击会话 → Code 活跃会话页
         ↓
子视图: expandedView → tasks 面板 / teammates 面板
        viewingAgentTaskId → Agent 对话视图
```

### 6.2 模态层叠

- 对话框使用 LIFO 栈管理
- ESC 关闭最上层
- 遮罩层防止底层交互

---

## 七、实施路线图

### Phase 1: 基础框架（可独立实现）
1. 项目脚手架搭建
2. 主题系统（颜色 token）
3. 设计系统基础组件（Dialog, Tabs, Select, Button）
4. 全局状态管理
5. App Shell 三栏布局

### Phase 2: 核心对话页
6. Code 空状态页（吉祥物 + 输入框）
7. 输入区域（文本 + 附件 + 选择器）
8. 消息列表基础版（用户文本 + AI 文本）
9. 权限 / 模型选择器
10. 加载状态指示器

### Phase 3: 高级渲染
11. Markdown 渲染器
12. 代码语法高亮
13. 工具调用展示（折叠/展开）
14. Diff 结构化展示
15. 权限请求对话框

### Phase 4: 辅助页面
16. Scheduled 定时任务页 + 新建模态框
17. Search 搜索页
18. Dispatch 分发页
19. Customize 设置页

### Phase 5: 交互完善
20. 会话管理全流程
21. 键盘快捷键
22. 通知系统
23. 虚拟滚动优化
24. 响应式适配

---

## 八、关键源码文件索引

| 功能 | 路径 |
|------|------|
| 全局状态 | `src/state/AppStateStore.ts` |
| 状态 Provider | `src/state/AppState.tsx` |
| 主屏幕 | `src/screens/REPL.tsx` |
| 全屏布局 | `src/components/FullscreenLayout.tsx` |
| 输入组件 | `src/components/PromptInput/PromptInput.tsx` |
| 消息渲染 | `src/components/Message.tsx` |
| 虚拟滚动 | `src/components/VirtualMessageList.tsx` |
| 权限类型 | `src/types/permissions.ts` |
| 权限 UI | `src/components/permissions/PermissionRequest.tsx` |
| 模型选择 | `src/components/ModelPicker.tsx` |
| 主题定义 | `src/utils/theme.ts` |
| 设计系统 | `src/components/design-system/` |
| 定时任务 | `src/utils/cronTasks.ts` |
| 搜索 | `src/components/GlobalSearchDialog.tsx` |
| 设置 | `src/components/Settings/` |
| Agent | `src/components/agents/` |
| MCP | `src/components/mcp/` |
| 工具接口 | `src/Tool.ts` |
| 消息类型 | `src/components/messages/` |
| Diff | `src/components/StructuredDiff.tsx` |
| 会话管理 | `src/components/LogSelector.tsx` |
| 导航 hook | `src/hooks/useGlobalKeybindings.tsx` |
