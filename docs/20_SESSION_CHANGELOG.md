# 20 — Session Changelog

> Tổng hợp toàn bộ thay đổi đã thực hiện trong phiên làm việc giữa developer và AI assistant, bao gồm cả **Client (React)** và **Server (Node.js)**.

---

## Mục lục

1. [Sửa lỗi Emoji Reactions](#1-sửa-lỗi-emoji-reactions)
2. [Tính năng Reply / Quote Message](#2-tính-năng-reply--quote-message)
3. [Redesign UI Theme — "Soft Blue"](#3-redesign-ui-theme--soft-blue)
4. [Redesign Workspace Navigation](#4-redesign-workspace-navigation)
5. [Sidebar Resizable & Collapsible](#5-sidebar-resizable--collapsible)
6. [Redesign Channel List & Icons](#6-redesign-channel-list--icons)

---

## 1. Sửa lỗi Emoji Reactions

### Vấn đề
- Reaction emoji hiển thị khi click nhưng **biến mất khi F5** (refresh trang).
- Event socket không khớp tên giữa server và client.

### Thay đổi — Server

**File:** `server/src/controllers/message.controller.ts`

- Thêm hàm helper `convertReactions()` để convert `Map<string, string[]>` thành `Object` trước khi trả về API response.
- Áp dụng `convertReactions()` trong `getMessages()` để reactions không bị mất khi load lại trang.
- Trong `toggleReaction()`: emit event `reaction_updated` kèm theo `channelId` để client biết channel nào cần update.

```ts
// Helper function
const convertReactions = (reactions: Map<string, string[]>) => {
  const obj: Record<string, string[]> = {};
  reactions.forEach((users, emoji) => { obj[emoji] = users; });
  return obj;
};
```

### Thay đổi — Client

**File:** `src/socket/messageEvents.ts`

- Sửa tên event lắng nghe từ sai tên → `reaction_updated` cho khớp với server.
- Cập nhật handler để nhận `channelId` và update đúng message trong store.

---

## 2. Tính năng Reply / Quote Message

### Mô tả
Cho phép user reply (trích dẫn) một tin nhắn cụ thể. Tin nhắn reply sẽ hiển thị preview của tin nhắn gốc phía trên.

### Thay đổi — Server

**File:** `server/src/controllers/message.controller.ts`

- Trong `getMessages()`: thêm `.populate()` lồng cho field `replyTo` để lấy thông tin sender (username, avatar).
  ```ts
  .populate({
    path: 'replyTo',
    populate: { path: 'sender', select: 'username avatar' }
  })
  ```

**File:** `server/src/socket/handlers/message.handler.ts`

- Trong handler gửi tin nhắn: sau khi create message, populate `replyTo.sender` trước khi emit cho clients.

**File:** `server/src/models/message.model.ts` (nếu chưa có)

- Đảm bảo schema có field `replyTo` là `ObjectId` ref tới `Message`.

### Thay đổi — Client

**File:** `src/store/channelStore.ts`

- Thêm interface `ReplyingTo { _id: string; content: string; sender: { username: string } }`.
- Thêm state `replyingTo: ReplyingTo | null`.
- Thêm actions: `setReplyingTo(msg)`, `clearReplyingTo()`.

**File:** `src/components/chat/MessageItem.tsx`

- Thêm nút "Reply" trong hover actions.
- Khi click Reply → gọi `setReplyingTo()` với thông tin message.
- Hiển thị khối quote phía trên tin nhắn nếu message có `replyTo`.

**File:** `src/components/chat/MessageInput.tsx`

- Hiển thị reply preview bar phía trên ô nhập tin nhắn khi `replyingTo` có giá trị.
- Nút X để cancel reply.
- Khi gửi tin nhắn: đính kèm `replyTo: replyingTo._id` vào payload, sau đó `clearReplyingTo()`.

**File:** `src/pages/ChannelPage.tsx`

- Truyền `replyTo` parameter vào hàm `sendMessage()`.

---

## 3. Redesign UI Theme — "Soft Blue"

### Mô tả
Chuyển toàn bộ giao diện từ theme Discord-like (xám tối) → theme màu tím → cuối cùng chốt **"Soft Blue"** — xanh dương nhạt, hiện đại, khác biệt với Discord.

### Thay đổi — Client

**File:** `tailwind.config.ts`

- Cập nhật bảng màu custom:
  ```ts
  colors: {
    primary: '#3b82f6',      // Blue-500
    accent: '#06b6d4',       // Cyan-500
    sidebar: { dark: '#111d2e' },
    // Backgrounds
    'dark-primary': '#0c1929',
    'dark-secondary': '#111d2e',
    'dark-tertiary': '#152238',
  }
  ```

**File:** `src/index.css`

- Scrollbar thumb: `#93c5fd` (light), `rgba(59,130,246,0.3)` (dark).
- Code block styles: `bg-blue-50 dark:bg-[#1e3250]`, border `border-blue-100 dark:border-[#243a54]`.
- Selection: `bg-primary/30`.

**Đã cập nhật theme cho các file:**
- `AppLayout.tsx` — background chính
- `Header.tsx` — header bar
- `Sidebar.tsx` — sidebar background + borders
- `ChannelItem.tsx` — hover/active states
- `ChannelList.tsx` — category headers
- `MessageItem.tsx` — message bubbles
- `MessageInput.tsx` — input area
- `WorkspaceNav.tsx` — nav rail background

---

## 4. Redesign Workspace Navigation

### Mô tả
Làm cho mỗi workspace có giao diện riêng biệt, không giống Discord (chỉ có icon tròn đơn giản).

### Thay đổi — Client

**File:** `src/components/workspace/WorkspaceNav.tsx`

- **Gradient pairs**: Mỗi workspace được gán 1 cặp gradient màu duy nhất (từ mảng `GRADIENT_PAIRS` gồm 10 cặp: blue→cyan, violet→purple, rose→pink, amber→orange, emerald→teal, v.v.).
- **Decorative patterns**: Mỗi workspace có 1 ký tự trang trí (●◆▲★◐✦⬡◉▣⬟) hiển thị mờ ở góc icon.
- **Name labels**: Hiển thị tên viết tắt (2-3 ký tự) bên dưới icon.
- **Active state**: Viền glow sáng + scale animation + shadow neon khi workspace đang chọn.
- **Layout**: Giữ vertical rail 78px, gradient background từ trên xuống.

```tsx
const GRADIENT_PAIRS = [
  ['from-blue-500', 'to-cyan-400'],
  ['from-violet-500', 'to-purple-400'],
  ['from-rose-500', 'to-pink-400'],
  // ...10 cặp tổng cộng
];

const DECO_PATTERNS = ['●', '◆', '▲', '★', '◐', '✦', '⬡', '◉', '▣', '⬟'];
```

---

## 5. Sidebar Resizable & Collapsible

### Mô tả
Sidebar channel list có thể kéo thay đổi kích thước (200–480px) và ẩn/hiện bằng nút toggle trên Header.

### Thay đổi — Client

**File:** `src/store/uiStore.ts`

- Thêm state:
  ```ts
  sidebarWidth: number        // default 280
  setSidebarWidth: (w) => void
  ```
- Export constants:
  ```ts
  MIN_SIDEBAR_WIDTH = 200
  MAX_SIDEBAR_WIDTH = 480
  DEFAULT_SIDEBAR_WIDTH = 280
  ```

**File:** `src/components/layout/AppLayout.tsx`

- WorkspaceNav render riêng biệt (78px rail cố định bên trái).
- Sidebar width lấy từ `uiStore.sidebarWidth`.
- Drag handle (4px) ở cạnh phải sidebar:
  - `onMouseDown` → track mouse movement → `setSidebarWidth(mouseX - navWidth)`.
  - Clamp giữa `MIN_SIDEBAR_WIDTH` và `MAX_SIDEBAR_WIDTH`.
  - Double-click → reset về `DEFAULT_SIDEBAR_WIDTH`.
- Khi sidebar collapsed: `sidebarWidth = 0`, drag handle ẩn.
- Truyền `onToggleSidebar` và `sidebarOpen` props cho `Header`.

**File:** `src/components/layout/Header.tsx`

- Thêm `HeaderProps`:
  ```ts
  interface HeaderProps {
    onToggleSidebar?: () => void;
    sidebarOpen?: boolean;
  }
  ```
- Render nút toggle: `PanelLeftClose` (khi mở) / `PanelLeftOpen` (khi đóng) ở bên trái header.

---

## 6. Redesign Channel List & Icons

### Mô tả
Thay thế icon `#` (Hash) mặc định giống Discord bằng các icon hiện đại, thêm hiệu ứng visual cho toàn bộ sidebar.

### Thay đổi — Client

**File:** `src/components/channel/ChannelItem.tsx`

#### Icon thay thế

| Channel Type | Icon cũ        | Icon mới          | Màu gradient             |
| ------------ | -------------- | ----------------- | ------------------------ |
| Public text  | `Hash` (`#`)   | `MessageCircle`   | blue-400 → cyan-600      |
| Private      | `Lock`         | `ShieldCheck`     | amber-400 → orange-600   |
| Voice        | `Volume2`      | `Waypoints`       | emerald-400 → green-600  |
| DM           | `MessageSquare`| `MessageSquare`   | violet-400 → purple-600  |

#### Hiệu ứng icon
- **Size**: `w-8 h-8` (tăng từ `w-7 h-7`), `rounded-[10px]`.
- **Nền tối khi idle**: màu tối đậm riêng cho từng loại (vd: `#0d1a28` cho text, `#132b13` cho voice).
- **Hover**: gradient + glow shadow (vd: `shadow-lg shadow-blue-500/30`).
- **Active**: gradient đầy + glow mạnh hơn (vd: `shadow-lg shadow-blue-500/40`).
- **Voice active indicator**: chấm xanh nhấp nháy (`animate-pulse`) ở góc trên phải icon.

#### Hiệu ứng channel row
- **Active state**: Glassmorphism effect — `bg-white/[0.06]`, `backdrop-blur-sm`, `border border-white/[0.06]`.
- **Active glow line**: Thanh gradient `blue-400 → cyan-400` rộng 3px bên trái, phát sáng `shadow-[0_0_8px_rgba(59,130,246,0.6)]`.
- **Voice members**: Có `border-l border-white/[0.04]` trang trí.

**File:** `src/components/channel/ChannelList.tsx`

#### Category headers
- Font size giảm: `text-[10px]` (từ `text-[11px]`).
- Tracking rộng hơn: `tracking-[0.12em]`.
- Hiển thị số lượng channel: `(3)`.
- ChevronDown nhỏ hơn: `size={10}`.
- Plus button: hover `bg-white/5`, text `hover:text-blue-400`.

**File:** `src/components/layout/Sidebar.tsx`

#### Ambient background effects
- 3 quả cầu ánh sáng mờ (ambient orbs) lơ lửng trong sidebar — chỉ hiện ở dark mode:
  - Orb 1: `bg-blue-500/[0.04]`, `w-32 h-32`, `blur-3xl`, trên trái.
  - Orb 2: `bg-cyan-500/[0.04]`, `w-28 h-28`, `blur-3xl`, dưới phải.
  - Orb 3: `bg-primary/[0.02]`, `w-40 h-40`, `blur-3xl`, giữa.
- Mỗi orb có CSS animation `ambient-float` với duration khác nhau (8s, 12s, 10s) tạo hiệu ứng nhẹ nhàng.

#### Workspace banner
- Border bottom: `border-white/[0.06]`.
- Font: thêm `tracking-wide`.

#### User panel
- Background tối hơn: `bg-[#070e1a]`.
- Border top: `border-white/[0.06]`.

**File:** `src/index.css`

```css
@keyframes ambient-float {
  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.03; }
  50% { transform: translateY(-8px) scale(1.08); opacity: 0.06; }
}

.dark .sidebar-ambient-orb-1 { animation: ambient-float 8s infinite ease-in-out; }
.dark .sidebar-ambient-orb-2 { animation: ambient-float 12s infinite ease-in-out 3s; }
.dark .sidebar-ambient-orb-3 { animation: ambient-float 10s infinite ease-in-out 6s; }
```

---

## Tóm tắt file đã chỉnh sửa

### Client (`src/`)

| File | Thay đổi |
| ---- | -------- |
| `tailwind.config.ts` | Custom color palette "Soft Blue" |
| `src/index.css` | Scrollbar theme, ambient-float animation, scrollbar-hide utility |
| `src/store/uiStore.ts` | `sidebarWidth`, `setSidebarWidth`, width constants |
| `src/store/channelStore.ts` | `ReplyingTo` interface, `replyingTo` state, actions |
| `src/components/layout/AppLayout.tsx` | Resizable sidebar + drag handle + collapse logic |
| `src/components/layout/Header.tsx` | Sidebar toggle button (PanelLeftClose/Open) |
| `src/components/layout/Sidebar.tsx` | Ambient orbs, dark theme borders, simplified banner |
| `src/components/workspace/WorkspaceNav.tsx` | Gradient pairs, decorative patterns, name labels, glow |
| `src/components/channel/ChannelItem.tsx` | New icons, glassmorphism active, glow line, icon shadows |
| `src/components/channel/ChannelList.tsx` | Smaller category headers, channel count, refined hover |
| `src/components/chat/MessageItem.tsx` | Reply button + quote display |
| `src/components/chat/MessageInput.tsx` | Reply preview bar |
| `src/pages/ChannelPage.tsx` | Pass `replyTo` to send |

### Server (`server/src/`)

| File | Thay đổi |
| ---- | -------- |
| `controllers/message.controller.ts` | `convertReactions()` helper, reaction fix, reply populate |
| `socket/handlers/message.handler.ts` | Nested populate `replyTo.sender` |

---

## Tech Stack tham chiếu

- **Client**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Socket.IO Client
- **Server**: Node.js + Express + TypeScript + MongoDB (Mongoose) + Redis + Socket.IO
- **File Upload**: Cloudinary
- **Auth**: JWT (access + refresh tokens)
- **Icons**: Lucide React
