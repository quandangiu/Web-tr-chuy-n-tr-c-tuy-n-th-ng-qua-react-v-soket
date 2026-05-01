# BÁO CÁO CHI TIẾT DỰ ÁN: NỀN TẢNG GIAO TIẾP VÀ CỘNG TÁC THỜI GIAN THỰC (REAL-TIME COLLABORATION PLATFORM)

## 1. TỔNG QUAN DỰ ÁN
Dự án là một nền tảng giao tiếp trực tuyến hiện đại, kết hợp giữa khả năng trò chuyện tức thời (Real-time Chat) và quản lý công việc chuyên nghiệp (Task Management). Hệ thống được thiết kế theo mô hình "Workspace-based", cho phép các nhóm làm việc tạo ra không gian riêng biệt, phân chia kênh thảo luận và cùng nhau quản lý dự án trên một giao diện duy nhất.

**Mục tiêu cốt lõi:**
- Tối ưu hóa hiệu suất làm việc nhóm thông qua việc tập trung hóa dữ liệu.
- Đảm bảo tính tức thời trong mọi tương tác (tin nhắn, cập nhật công việc).
- Cung cấp trải nghiệm người dùng cao cấp với giao diện hiện đại, mượt mà.

---

## 2. MỤC TIÊU DỰ ÁN (PROJECT OBJECTIVES)
Dự án được xây dựng với các mục tiêu cụ thể nhằm giải quyết bài toán giao tiếp trong doanh nghiệp và nhóm học thuật:

1. **Xây dựng hệ thống giao tiếp thời gian thực ổn định:** 
   - Sử dụng WebSocket để đảm bảo tin nhắn và thông báo được truyền tải tức thời (độ trễ < 100ms). 
   - Xử lý trạng thái trực tuyến (Presence) của hàng ngàn người dùng đồng thời.

2. **Tích hợp quản lý công việc và thảo luận:** 
   - Loại bỏ sự phân mảnh dữ liệu khi phải sử dụng nhiều nền tảng khác nhau (như dùng Zalo để chat và Trello để quản lý task). 
   - Mọi thay đổi trong công việc (Task) đều đi kèm với một luồng thảo luận riêng biệt.

3. **Bảo mật dữ liệu:** 
   - Áp dụng mã hóa tin nhắn và xác thực đa lớp qua JWT.
   - Quản lý quyền truy cập nghiêm ngặt dựa trên Workspace và Channel.

4. **Khả năng mở rộng (Scalability):** 
   - Kiến trúc Micro-services sẵn sàng (Frontend và Backend tách biệt hoàn toàn).
   - Có thể mở rộng số lượng người dùng và Workspace dễ dàng bằng cách tối ưu hóa Database Indexing.

5. **Trải nghiệm người dùng (UX):** 
   - Giảm thiểu số lần tải lại trang (Single Page Application).
   - Tối ưu hóa thao tác người dùng với tính năng Auto-save và Real-time synchronization.

---

## 3. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ (TECH STACK)

### 3.1. Frontend (Client Side)
- **Framework:** React 18 (Vite) - Tận dụng sức mạnh của Hooks và Virtual DOM để đảm bảo tốc độ render.
- **Ngôn ngữ:** TypeScript - Đảm bảo tính nhất quán của dữ liệu, giảm thiểu lỗi runtime thông qua hệ thống kiểu tĩnh (Static Typing).
- **Quản lý State:** Zustand - Thư viện quản lý trạng thái tập trung với bộ nhớ tối ưu, dễ dàng đồng bộ dữ liệu giữa các component phức tạp.
- **Styling:** Tailwind CSS - Xây dựng giao diện Responsive và tùy chỉnh linh hoạt thông qua các tiện ích (Utility classes).
- **Icons:** Lucide React - Bộ sưu tập icon vector hiện đại, tối giản.
- **Notifications:** React Hot Toast - Hệ thống thông báo tương tác người dùng mượt mà, không gây gián đoạn.

### 3.2. Backend (Server Side)
- **Runtime:** Node.js & Express - Xử lý I/O non-blocking, cực kỳ phù hợp cho ứng dụng thời gian thực.
- **Cơ sở dữ liệu:** MongoDB (Mongoose) - Lưu trữ dữ liệu dạng tài liệu (Document-based), linh hoạt cho các cấu trúc tin nhắn và task phức tạp.
- **Thời gian thực:** Socket.io - Thư viện hàng đầu cho việc truyền tải dữ liệu hai chiều (Full-duplex), hỗ trợ tự động kết nối lại và polling dự phòng.
- **Xác thực:** JSON Web Token (JWT) - Cơ chế bảo mật phiên đăng nhập không trạng thái (Stateless), giúp hệ thống dễ dàng mở rộng.
- **Lưu trữ:** Cloudinary (Xử lý lưu trữ và tối ưu hóa ảnh đại diện người dùng).

---

## 4. CHI TIẾT CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

### 4.1. Người dùng (User)
Lưu trữ thông tin định danh và cá nhân hóa.
- `username`: Tên đăng nhập duy nhất (min 3 ký tự).
- `email`: Địa chỉ email xác thực.
- `passwordHash`: Mật khẩu được mã hóa an toàn bằng bcrypt.
- `avatar`: URL ảnh đại diện (Cloudinary).
- `displayName`: Tên hiển thị công khai.
- `status`: Trạng thái (online, offline, away).
- `bio`: Tiểu sử ngắn gọn của người dùng.

### 4.2. Không gian làm việc (Workspace)
Cấu trúc phân cấp cao nhất của hệ thống.
- `name`: Tên Workspace.
- `slug`: Đường dẫn URL duy nhất.
- `icon`: Biểu tượng đại diện (Emoji hoặc Image).
- `owner`: Người sở hữu không gian.
- `members`: Mảng các thành viên kèm vai trò (owner, admin, member).
- `inviteCode`: Mã mời duy nhất để tham gia không gian.

### 4.3. Kênh thảo luận (Channel)
- `workspace`: Liên kết đến Workspace cha.
- `name`: Tên kênh.
- `type`: Phân loại (public, private, dm).
- `members`: Danh sách thành viên có quyền truy cập kênh.
- `lastMessage`: Liên kết đến tin nhắn cuối cùng để hiển thị preview trong sidebar.

### 4.4. Công việc (Task)
- `workspace`, `channel`: Xác định vị trí của task.
- `title`, `description`: Nội dung chính của công việc.
- `status`: Trạng thái Kanban (todo, in_progress, done).
- `priority`: Độ ưu tiên (low, medium, high, urgent).
- `assignee`: Người được giao nhiệm vụ.
- `dueDate`: Thời hạn hoàn thành.
- `comments`: Luồng thảo luận riêng của task (user, content, createdAt).

---

## 5. CÁC CHỨC NĂNG CHI TIẾT (FEATURE BREAKDOWN)

### 5.1. Hệ thống Workspace & Channel
- **Khởi tạo & Quản lý:** Người dùng có thể tạo không gian làm việc chuyên biệt cho từng dự án hoặc phòng ban.
- **Cơ chế Mã mời (Invite System):** 
  - Tạo link mời tự động: `http://localhost:5173/workspace/join/[inviteCode]`.
  - Kiểm tra tính hợp lệ của mã và tự động thêm thành viên vào Workspace.
- **Quản trị Kênh:** Tạo các kênh chuyên biệt cho từng chủ đề thảo luận, giúp thông tin không bị loãng.

### 3.2. Trò chuyện thời gian thực (Real-time Messaging)
- **Truyền tải tin nhắn:** Tích hợp Socket.io giúp gửi tin nhắn ngay lập tức mà không cần F5.
- **Đồng bộ hóa:** Tin nhắn mới được tự động hiển thị trên tất cả các thiết bị đang kết nối trong cùng kênh.
- **Mã hóa nội dung:** Hỗ trợ cơ chế mã hóa phía client để bảo vệ nội dung nhạy cảm.

### 3.3. Hệ thống Quản lý Công việc Toàn diện
Dự án cung cấp 3 mô hình cộng tác đặc thù:
- **Work Tasks (Quản lý công việc):**
  - **Kéo thả (Drag & Drop):** Di chuyển công việc giữa các trạng thái Kanban một cách trực quan.
  - **Phân loại Priority:** Sử dụng màu sắc để cảnh báo mức độ khẩn cấp (Đỏ cho Urgent, Cam cho High).
  - **Task Detail Modal:** Cửa sổ chi tiết cho phép chỉnh sửa mô tả sâu và theo dõi luồng bình luận.
- **Event (Sự kiện & Lịch):**
  - Theo dõi thời gian và địa điểm diễn ra sự kiện.
  - **Hệ thống RSVP:** Cho phép người dùng biểu quyết tham gia (Going, Maybe, Declined) với biểu đồ thống kê thời gian thực.
- **Poll (Bình chọn):**
  - Khởi tạo các cuộc thăm dò ý kiến nhanh.
  - Biểu thị kết quả dưới dạng thanh tiến trình (progress bar) sinh động.

### 3.4. Quản lý Người dùng chi tiết (User & Personalization)
- **Hệ thống Định danh:** Đăng ký, đăng nhập an toàn, duy trì phiên làm việc qua Token.
- **Tùy biến hồ sơ chuyên sâu:**
  - Cửa sổ `UserProfileModal` hiện đại.
  - **Tính năng Auto-save:** Mọi thay đổi về Avatar hoặc thông tin cá nhân (Display Name, Bio) đều được hệ thống tự động lưu trữ ngay lập tức mà không cần nút "Save".
  - **Cloud Avatar:** Tích hợp Cloudinary để xử lý và lưu trữ ảnh đại diện chuyên nghiệp.
- **Presence Tracking:** Hệ thống tự động phát hiện khi người dùng ngắt kết nối (mất mạng, đóng tab) và cập nhật trạng thái Offline cho mọi thành viên khác thấy.

---

## 6. DANH SÁCH API ENDPOINTS CHÍNH

### 6.1. Người dùng (User)
- `POST /api/users/register`: Đăng ký tài khoản mới.
  - **Request Body:** `{ username, email, password }`
  - **Response (201):** `{ user, token }`
- `POST /api/users/login`: Xác thực và lấy Token.
  - **Request Body:** `{ email, password }`
  - **Response (200):** `{ user, token }`
- `GET /api/users/me`: Lấy thông tin cá nhân hiện tại.
- `PUT /api/users/:id`: Cập nhật hồ sơ (Display Name, Bio, Avatar).
  - **Request:** `multipart/form-data` (avatar file + fields)

### 6.2. Workspace & Channel
- `POST /api/workspaces`: Tạo Workspace mới.
  - **Request Body:** `{ name, icon }`
- `GET /api/workspaces`: Lấy danh sách Workspace tham gia.
- `GET /api/workspaces/join/:inviteCode`: Tham gia Workspace qua mã mời.
- `POST /api/channels`: Tạo kênh mới trong Workspace.
  - **Request Body:** `{ workspaceId, name, type }`

### 6.3. Task & Messaging
- `GET /api/tasks/:channelId`: Lấy toàn bộ task của một kênh.
- `POST /api/tasks`: Khởi tạo task mới.
  - **Request Body:** `{ title, description, taskType, priority, dueDate, assignee }`
- `PATCH /api/tasks/:id/status`: Cập nhật trạng thái công việc.
- `POST /api/tasks/:id/comment`: Thêm bình luận vào task.
  - **Request Body:** `{ content }`
- `GET /api/messages/:channelId`: Lấy lịch sử tin nhắn (hỗ trợ phân trang).

---

## 7. HƯỚNG DẪN SỬ DỤNG CHI TIẾT (COMPREHENSIVE USER GUIDE)

### 7.1. Bắt đầu với Workspace
1. **Đăng ký tài khoản:** Sau khi truy cập ứng dụng, hãy bắt đầu bằng việc tạo một tài khoản mới.
2. **Tạo Workspace:** Nhấp vào nút "Thêm Workspace" (+) ở thanh Sidebar bên trái. Nhập tên và chọn một biểu tượng (Emoji) đại diện.
3. **Mời thành viên:** Trong trang chính của Workspace, bạn sẽ thấy một liên kết mời. Hãy copy và gửi cho đồng nghiệp của bạn.

### 7.2. Giao tiếp trong Kênh (Channels)
1. **Chọn kênh:** Nhấp vào danh sách kênh ở sidebar (Kênh văn bản, Kênh riêng tư).
2. **Gửi tin nhắn:** Nhập nội dung vào khung chat phía dưới. Bạn có thể sử dụng biểu tượng cảm xúc để làm sinh động cuộc hội thoại.
3. **Nhận thông báo:** Khi có tin nhắn mới, hệ thống sẽ tự động cập nhật và hiển thị chấm đỏ thông báo.

### 7.3. Quản lý công việc (Task Management)
1. **Tạo Task:** Mở bảng Task bên phải (Task Panel). Chọn tab công việc mong muốn (Work, Event, Poll) và nhấp vào "Hiện form tạo task".
2. **Theo dõi Kanban:** Các công việc loại "Work" sẽ hiển thị theo các cột trạng thái. Bạn có thể kéo một task từ "Chuẩn bị" sang "Đang làm" để thông báo cho nhóm.
3. **Thảo luận chi tiết:** Nhấp vào biểu tượng "i" (Info) trên mỗi task để mở cửa sổ chi tiết. Tại đây, bạn có thể đọc mô tả kỹ hơn và gửi bình luận để trao đổi với người phụ trách.
4. **Bình chọn (Poll):** Với các poll, chỉ cần nhấp vào lựa chọn bạn muốn, kết quả sẽ nhảy số ngay lập tức trên màn hình của mọi người.

---

## 8. GIẢI PHÁP BẢO MẬT VÀ TỐI ƯU HÓA HỆ THỐNG

### 8.1. Bảo mật đa lớp
- **JWT (JSON Web Token):** Sử dụng token có chữ ký điện tử để xác thực mọi yêu cầu từ client. Token được lưu trữ an toàn và gửi qua header `Authorization`.
- **CORS (Cross-Origin Resource Sharing):** Cấu hình chặt chẽ chỉ cho phép client tin tưởng được phép gọi API đến server.
- **Bcrypt Hashing:** Mật khẩu người dùng không bao giờ được lưu dưới dạng văn bản thuần túy, mà luôn được băm (hash) với độ phức tạp cao (salt rounds = 10).
- **Rate Limiting:** (Dự kiến) Giới hạn số lượng yêu cầu từ một IP để chống tấn công brute-force hoặc DDoS.

### 8.2. Tối ưu hóa Frontend
- **React.memo & useMemo:** Tránh render lại các component nặng (như danh sách tin nhắn hoặc kanban board) khi dữ liệu không thay đổi.
- **Lazy Loading:** (Dự kiến) Chỉ tải các modal hoặc trang cần thiết khi người dùng tương tác để giảm dung lượng file bundle ban đầu.
- **Optimistic UI:** (Dự kiến) Cập nhật giao diện ngay khi người dùng bấm nút gửi (như gửi tin nhắn) trước khi server phản hồi thành công, tạo cảm giác ứng dụng cực kỳ nhanh.

### 8.3. Tối ưu hóa Backend
- **MongoDB Indexing:** Đánh chỉ mục (Index) cho các trường thường xuyên tìm kiếm như `email`, `slug`, `channelId` để tăng tốc độ truy vấn gấp nhiều lần.
- **Socket Rooms:** Sử dụng tính năng "Room" của Socket.io để chỉ gửi tin nhắn đến những người dùng đang ở trong cùng một kênh, tránh phát tán dữ liệu thừa (broadcast) đến toàn server.

---

## 9. HỆ THỐNG SỰ KIỆN SOCKET (SOCKET.IO EVENTS)

Để đảm bảo tính thời gian thực, hệ thống sử dụng các sự kiện sau:
- **`join_channel` / `leave_channel`**: Quản lý việc người dùng ra vào phòng chat.
- **`new_message`**: Phát tán tin nhắn mới đến mọi thành viên trong kênh.
- **`task_created`**: Thông báo có công việc mới vừa được tạo.
- **`task_updated`**: Cập nhật trạng thái task hoặc có bình luận mới.
- **`user_status_changed`**: Đồng bộ trạng thái Online/Offline toàn hệ thống.

---

## 8. CÁC ĐIỂM NỔI BẬT VỀ KỸ THUẬT & GIẢI PHÁP

1. **Đồng bộ hóa Trạng thái Task (Real-time Sync):**
   Khi một thành viên thêm bình luận trong Task, WebSocket sẽ gửi tín hiệu đến server, server lưu vào DB và phát tán (broadcast) đến tất cả các client đang online. Client nhận dữ liệu và cập nhật trực tiếp vào UI mà không cần tải lại toàn bộ danh sách task.

2. **Giao diện đa chế độ (Dark/Light Mode) & Tối ưu hóa thị giác:**
   - **Dark Mode:** Sử dụng các tông màu Deep Navy và Slate để giảm mỏi mắt khi làm việc ban đêm.
   - **Light Mode:** Tối ưu hóa độ tương phản (Contrast) của văn bản, sử dụng các tông màu xám đậm (`gray-600` đến `gray-900`) để nét chữ rõ ràng trên nền sáng.
   - **Premium Design:** Sử dụng hiệu ứng kính mờ (Backdrop-blur), bo góc mềm mại và đổ bóng hiện đại (Shadows).

3. **Tối ưu hóa Hiệu suất:**
   - Sử dụng pagination (phân trang) cho tin nhắn để tránh quá tải trình duyệt.
   - Tối ưu hóa các truy vấn MongoDB bằng Index.
   - Sử dụng `memo` và `useCallback` trong React để tránh re-render không cần thiết.

---

## 9. KẾT QUẢ TRIỂN KHAI (DEPLOYMENT)

### 9.1. Server (Backend)
- **Nền tảng:** Render.
- **URL API:** `https://server-chat-realtime-sbpr.onrender.com/api`
- **Socket Server:** `https://server-chat-realtime-sbpr.onrender.com`

### 9.2. Client (Frontend)
- **Nền tảng:** Vercel.
- **URL:** [Địa chỉ URL của bạn]

### 9.3. Cơ sở dữ liệu (Database)
- **Nền tảng:** MongoDB Atlas.

---

## 10. THÁCH THỨC VÀ GIẢI PHÁP (CHALLENGES & SOLUTIONS)

- **Thách thức:** Đồng bộ hóa dữ liệu giữa các Modal khi có thay đổi từ socket.
- **Giải pháp:** Sử dụng hệ thống Event Listener tùy chỉnh (`window.dispatchEvent`) phối hợp với Zustand để thông báo cho các component con cập nhật dữ liệu.
- **Thách thức:** Xử lý ảnh đại diện dung lượng lớn gây chậm server.
- **Giải pháp:** Sử dụng Cloudinary để nén ảnh tự động và chỉ lưu trữ URL trên Database của mình.

---

## 11. CẤU TRÚC THƯ MỤC DỰ ÁN

```bash
├── server/                 # Mã nguồn Backend (Node.js)
│   ├── src/
│   │   ├── controllers/    # Xử lý logic API (Auth, Task, Workspace...)
│   │   ├── models/         # Định nghĩa Mongoose Schemas
│   │   ├── routes/         # Router định nghĩa các endpoints
│   │   ├── socket/         # Logic xử lý các sự kiện Socket.io
│   │   ├── utils/          # Các hàm hỗ trợ (JWT, Cloudinary, Encryption)
│   │   └── app.ts          # File khởi tạo server
│   └── package.json
├── src/                    # Mã nguồn Frontend (React)
│   ├── components/         # Chứa các thành phần UI
│   │   ├── task/           # Kanban, Task Detail, Comments
│   │   ├── chat/           # Message List, Input bar
│   │   ├── layout/         # Sidebar, Navbar, Main Layout
│   │   └── ui/             # Reusable UI (Button, Input, Modal, Avatar)
│   ├── services/           # Axios config và gọi API
│   ├── store/              # Zustand Store (Auth, Workspace, UI State)
│   ├── socket/             # Client-side socket listeners
│   ├── types/              # TypeScript Interfaces cho toàn dự án
│   └── App.tsx             # Main Entry Point
└── package.json
```

---

## 12. KẾT LUẬN & HƯỚNG PHÁT TRIỂN
Dự án đã hoàn thiện các tính năng cốt lõi của một nền tảng giao tiếp và cộng tác hiện đại. Với khả năng xử lý thời gian thực mạnh mẽ và giao diện người dùng tối ưu, hệ thống sẵn sàng cho việc triển khai thực tế.

**Hướng phát triển tương lai:**
1. Tích hợp cuộc gọi Video/Audio hoàn chỉnh hơn qua WebRTC.
2. Phát triển ứng dụng Mobile native (React Native) để đồng bộ trải nghiệm đa nền tảng.
3. Tích hợp AI (Chatbot) để hỗ trợ tóm tắt nội dung cuộc họp hoặc quản lý lịch trình tự động.

---

**Người thực hiện:** [Tên của bạn]
**Ngày báo cáo:** 01/05/2026
**Trạng thái:** Hoàn thiện

---

## PHỤ LỤC: DANH MỤC THUẬT NGỮ (GLOSSARY)
- **Real-time:** Công nghệ xử lý và phản hồi dữ liệu ngay lập tức.
- **WebSocket:** Giao thức giao tiếp hai chiều liên tục giữa client và server.
- **Kanban:** Phương pháp quản lý công việc theo luồng trạng thái (Cột).
- **Stateless:** Cơ chế không lưu trạng thái phiên trên server (sử dụng Token).
- **Responsive:** Giao diện tự động co giãn theo kích thước màn hình.
- **Encryption:** Quá trình mã hóa dữ liệu để bảo vệ quyền riêng tư.
- **Middleware:** Các hàm trung gian xử lý yêu cầu trước khi đến controller.
- **Schema:** Định nghĩa cấu trúc dữ liệu cho cơ sở dữ liệu.

---
*Cảm ơn bạn đã xem bản báo cáo chi tiết này. Dự án được xây dựng với tâm huyết mang lại giải pháp cộng tác tốt nhất cho người dùng.*
