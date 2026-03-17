# Hướng dẫn Chạy Client React trên Docker

## 1. Build và Run Production Mode (Sử dụng docker-compose)

### Bước 1: Build image
```bash
docker-compose build
```

### Bước 2: Chạy container
```bash
docker-compose up
```

Ứng dụng sẽ chạy tại: **http://localhost:3000**

---

## 2. Build và Run Production Mode (Sử dụng Docker trực tiếp)

### Bước 1: Build Docker image
```bash
docker build -t chat-realtime-client:latest .
```

### Bước 2: Chạy container
```bash
docker run -d -p 3000:3000 --name chat-client chat-realtime-client:latest
```

### Bước 3: Kiểm tra logs
```bash
docker logs chat-client
```

---

## 3. Development Mode (Hot Reload)

### Sử dụng Dockerfile.dev để có Vite dev server
```bash
docker build -f Dockerfile.dev -t chat-realtime-client:dev .
```

Chạy:
```bash
docker run -d -p 5173:5173 -v $(pwd):/app -v /app/node_modules --name chat-client-dev chat-realtime-client:dev
```

Ứng dụng sẽ chạy tại: **http://localhost:5173**

> Lưu ý: `-v $(pwd):/app` mount thư mục hiện tại, khi code thay đổi sẽ tự reload

---

## 4. Các Câu Lệnh Hữu Ích

### Xem danh sách containers
```bash
docker ps -a
```

### Xem logs của container
```bash
docker logs chat-client
```

### Dừng container
```bash
docker stop chat-client
```

### Xóa container
```bash
docker rm chat-client
```

### Xóa image
```bash
docker rmi chat-realtime-client:latest
```

### Rebuild mà không dùng cache
```bash
docker build --no-cache -t chat-realtime-client:latest .
```

---

## 5. Sử dụng docker-compose với tùy chỉnh

### Chạy ở background
```bash
docker-compose up -d
```

### Dừng tất cả services
```bash
docker-compose down
```

### Xem logs
```bash
docker-compose logs -f client
```

### Rebuild service
```bash
docker-compose up -d --build
```

---

## 6. Cấu hình Environment Variables

Tạo file `.env.docker` nếu cần:
```
VITE_API_URL=http://localhost:8080
```

Sau đó update `docker-compose.yml`:
```yaml
services:
  client:
    ...
    env_file: .env.docker
```

---

## 7. Nginx Alternative (Nếu muốn dùng Nginx thay vì serve)

Tạo `nginx.conf`:
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

Tạo `Dockerfile.nginx`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## 8. Troubleshooting

### Port đã được sử dụng
```bash
# Tìm process sử dụng port 3000
lsof -i :3000
# Hoặc trên Windows
netstat -ano | findstr :3000
```

### Permission denied (Linux)
```bash
# Chạy với sudo hoặc add user vào group docker
sudo docker ps
# Hoặc
sudo usermod -aG docker $USER
```

### Module not found
Xóa node_modules và reinstall:
```bash
docker exec chat-client npm install
```

---

## 9. Kiểm Tra Container Chạy

```bash
# Kiểm tra container có chạy không
docker ps

# Test API từ container
docker exec chat-client curl http://localhost:3000
```

---

Chúc bạn thành công! 🚀
