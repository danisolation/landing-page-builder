# Docker — Hướng dẫn đầy đủ cho dự án Landing Page Builder

> Cập nhật: 2026-08-29

---

## Mục lục

1. [Docker là gì?](#1-docker-là-gì)
2. [Tại sao dùng Docker?](#2-tại-sao-dùng-docker)
3. [Các khái niệm cốt lõi](#3-các-khái-niệm-cốt-lõi)
4. [Docker trong dự án này](#4-docker-trong-dự-án-này)
5. [Các lệnh Docker thường dùng](#5-các-lệnh-docker-thường-dùng)
6. [Xử lý lỗi thường gặp](#6-xử-lý-lỗi-thường-gặp)
7. [Mở rộng kiến thức](#7-mở-rộng-kiến-thức)

---

## 1. Docker là gì?

### Định nghĩa đơn giản

Docker là một công cụ giúp **đóng gói ứng dụng và tất cả dependencies của nó vào một "hộp" gọi là Container**. Container này có thể chạy trên bất kỳ máy nào có cài Docker — không cần quan tâm máy đó cài gì, hệ điều hành gì.

### Ví dụ đời thường

Giả sử bạn nấu phở:
- **Không có Docker**: Bạn phải tự mua nồi, bếp, gia vị, tìm đúng loại bánh phở, nước dùng... Nếu sang nhà bạn bè nấu, có thể nhà bạn không có bếp gas, hoặc không có đúng loại gia vị.
- **Có Docker**: Bạn bỏ toàn bộ (nồi + bếp + gia vị + nguyên liệu) vào một xe bán phở di động. Xe này chạy được ở bất kỳ đâu — công viên, sân thượng, nhà bạn bè — chỉ cần có chỗ đậu xe.

### Docker vs Virtual Machine (VM)

| | Docker Container | Virtual Machine |
|---|---|---|
| **Khởi động** | Nhanh (giây) | Chậm (phút) |
| **Dung lượng** | Nhỏ (MB) | Lớn (GB) |
| **Hiệu năng** | Gần như native | Có overhead |
| **Cách hoạt động** | Chia sẻ kernel của host | Mỗi VM có kernel riêng |
| **Ví dụ** | Nhiều phòng trong cùng 1 tòa nhà | Nhiều tòa nhà riêng biệt |

```
┌─────────────────────────────────────────────────┐
│                    Host OS                       │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Container │  │Container │  │Container │      │
│  │ Postgres │  │  Node.js │  │  Redis   │      │
│  │          │  │          │  │          │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│              Docker Engine                       │
└─────────────────────────────────────────────────┘
```

---

## 2. Tại sao dùng Docker?

### Vấn đề: "Trên máy tôi chạy được, sao trên máy bạn không chạy?"

Đây là vấn đề kinh điển trong lập trình. Nguyên nhân:
- Bạn cài Node 18, teammate cài Node 20
- Bạn dùng PostgreSQL 16, server dùng PostgreSQL 14
- Bạn cài Ubuntu, teammate cài Windows
- Môi trường khác nhau → code chạy khác nhau

### Docker giải quyết bằng cách:

1. **Đóng gói mọi thứ vào container** — OS, runtime, dependencies, config
2. **Chạy giống nhau ở mọi nơi** — dev, staging, production
3. **Không conflict** — mỗi container cô lập, không ảnh hưởng nhau
4. **Dễ reproduce** — ai cũng có thể chạy y hệt chỉ với 1 lệnh

---

## 3. Các khái niệm cốt lõi

### 3.1 Image (Hình ảnh)

**Image** là bản "blueprint" (bản thiết kế) của container. Nó chứa:
- Hệ điều hành thu nhỏ (ví dụ: Alpine Linux, Ubuntu)
- Runtime (ví dụ: Node.js, Python, PostgreSQL)
- Code và dependencies
- Config mặc định

**Ví dụ**: `postgres:16-alpine` là image chứa PostgreSQL 16 trên hệ điều hành Alpine Linux (nhẹ ~50MB).

```
Image = Công thức nấu ăn
Container = Đĩa thức ăn được nấu từ công thức đó
```

### 3.2 Container (Thùng chứa)

**Container** là một instance đang chạy từ image. Bạn có thể:
- Tạo nhiều container từ cùng 1 image
- Start/stop/restart container
- Xóa container và tạo lại từ image

```
Image: postgres:16-alpine
  ├── Container 1: landing-page-db (port 5432)
  ├── Container 2: test-db (port 5433)
  └── Container 3: staging-db (port 5434)
```

### 3.3 Volume (Ổ đĩa)

**Volume** là nơi lưu trữ dữ liệu **bên ngoài container**. Tại sao cần?

- Container là "tạm thời" — xóa container = mất dữ liệu
- Volume tồn tại độc lập — xóa container, dữ liệu vẫn còn
- Dùng cho database, upload files, logs...

```
Container (PostgreSQL)     Volume (postgres_data)
┌──────────────────┐      ┌──────────────────┐
│  PostgreSQL DB   │ ───→ │  Lưu trữ data    │
│  (chạy trong     │      │  (tồn tại ngoài  │
│   container)     │      │   container)     │
└──────────────────┘      └──────────────────┘
```

### 3.4 Port Mapping (Ánh xạ cổng)

Container chạy trong mạng riêng (isolated network). Để truy cập từ bên ngoài, cần "map" port:

```
Host machine (máy tính của bạn)          Container
┌─────────────────────────┐              ┌──────────────┐
│                         │              │              │
│   localhost:5432  ───────────────→  5432│  PostgreSQL  │
│                         │              │              │
└─────────────────────────┘              └──────────────┘
```

Trong `docker-compose.yml`:
```yaml
ports:
  - "5432:5432"
#  ↑ host    ↑ container
#  Port trên  Port bên trong
#  máy tính   container
```

### 3.5 Docker Compose

**Docker Compose** là công cụ để định nghĩa và chạy **nhiều container cùng lúc** bằng file YAML.

Thay vì chạy từng lệnh `docker run` dài dòng, bạn viết 1 file `docker-compose.yml` rồi chạy:
```bash
docker compose up -d    # Khởi động tất cả
docker compose down     # Tắt tất cả
```

---

## 4. Docker trong dự án này

### 4.1 Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────┐
│                 Máy tính của bạn (Host)              │
│                                                      │
│  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │  Terminal / VS   │  │    Docker Desktop        │  │
│  │  Code            │  │                          │  │
│  └────────┬────────┘  │  ┌────────────────────┐  │  │
│           │            │  │  Container          │  │  │
│           │            │  │  landing-page-db    │  │  │
│           │            │  │  PostgreSQL 16      │  │  │
│           │            │  │  port: 5432         │  │  │
│           │            │  └────────┬───────────┘  │  │
│           │            │           │              │  │
│           │            │  ┌────────▼───────────┐  │  │
│           │            │  │  Volume             │  │  │
│           │            │  │  postgres_data      │  │  │
│           │            │  └────────────────────┘  │  │
│           │            └──────────────────────────┘  │
│           │                                           │
│  ┌────────▼──────────────────────────────────────┐  │
│  │  Node.js app (không chạy trong Docker)         │  │
│  │                                                │  │
│  │  landing-page-be (NestJS, port 3000)           │  │
│  │       ↓ kết nối                                │  │
│  │  localhost:5432 → PostgreSQL container          │  │
│  │                                                │  │
│  │  landing-page-fe (Next.js, port 3001)          │  │
│  │       ↓ gọi API                                │  │
│  │  localhost:3000 → NestJS                        │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Tóm tắt**: Chỉ PostgreSQL chạy trong Docker. Node.js app (FE + BE) chạy trực tiếp trên máy tính.

### 4.2 File docker-compose.yml

```yaml
# landing-page-be/docker-compose.yml

services:
  postgres:
    image: postgres:16-alpine    # Image PostgreSQL 16 trên Alpine Linux
    container_name: landing-page-db  # Tên container
    restart: unless-stopped       # Tự restart nếu crash (trừ khi stop thủ công)
    environment:
      POSTGRES_USER: postgres     # Username mặc định
      POSTGRES_PASSWORD: postgres # Password mặc định
      POSTGRES_DB: landing_page   # Tên database tự tạo
    ports:
      - "5432:5432"               # Map port 5432 ra ngoài
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Lưu data vào volume

volumes:
  postgres_data:                  # Định nghĩa volume
```

### 4.3 Giải thích từng dòng

| Dòng | Ý nghĩa |
|---|---|
| `image: postgres:16-alpine` | Dùng image PostgreSQL 16, bản Alpine (nhẹ ~50MB) |
| `container_name: landing-page-db` | Đặt tên container để dễ quản lý |
| `restart: unless-stopped` | Container tự restart nếu crash, trừ khi bạn stop thủ công |
| `POSTGRES_USER: postgres` | Username để kết nối DB |
| `POSTGRES_PASSWORD: postgres` | Password để kết nối DB |
| `POSTGRES_DB: landing_page` | Tên database tự động tạo khi container khởi động |
| `ports: "5432:5432"` | Port 5432 trên máy tính → port 5432 trong container |
| `volumes: postgres_data:/var/lib/...` | Lưu dữ liệu DB vào volume (không mất khi xóa container) |

### 4.4 File .env (Backend)

```env
# landing-page-be/.env

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/landing_page"
```

Giải thích:
```
postgresql://postgres:postgres@localhost:5432/landing_page
            ↑         ↑         ↑          ↑       ↑
         username  password    host      port    database
```

- `postgres:postgres` — username:password (trùng với docker-compose.yml)
- `localhost:5432` — vì container map port ra localhost
- `landing_page` — tên database (trùng với POSTGRES_DB)

### 4.5 Cách Prisma kết nối với Docker PostgreSQL

```typescript
// landing-page-be/src/prisma/prisma.service.ts

const adapter = new PrismaPg({ connectionString });
// ↑ Tạo adapter kết nối PostgreSQL qua @prisma/adapter-pg

const prisma = new PrismaClient({ adapter });
// ↑ Prisma dùng adapter thay vì built-in query engine (Prisma 7 pattern)
```

Flow kết nối:
```
NestJS app → PrismaService → PrismaPg adapter → localhost:5432 → Docker container → PostgreSQL
```

---

## 5. Các lệnh Docker thường dùng

### 5.1 Quản lý Container

```bash
# Khởi động container (từ docker-compose.yml)
docker compose up -d
#  ↑ "up" = start, "-d" = detached (chạy ngầm, không chiếm terminal)

# Tắt container
docker compose down
#  ↑ Tắt và xóa container (data vẫn giữ trong volume)

# Xem container đang chạy
docker ps
#  NAMES             STATUS          PORTS
#  landing-page-db   Up 5 minutes    0.0.0.0:5432->5432/tcp

# Xem TẤT CẢ container (kể cả đã tắt)
docker ps -a

# Xem log của container
docker logs landing-page-db
docker logs landing-page-db -f    # "-f" = follow (live log)
docker logs landing-page-db --tail 50   # 50 dòng cuối

# Restart container
docker restart landing-page-db

# Vào bên trong container (debug)
docker exec -it landing-page-db bash
#  ↑ "exec" = execute, "-it" = interactive + tty
#  Sau khi vào, bạn đang ở trong container, gõ "exit" để thoát
```

### 5.2 Quản lý Image

```bash
# Xem images đã tải
docker images
#  REPOSITORY   TAG            SIZE
#  postgres     16-alpine      245MB

# Tải image (không cần chạy)
docker pull postgres:16-alpine

# Xóa image
docker rmi postgres:16-alpine

# Xóa images không dùng
docker image prune
```

### 5.3 Quản lý Volume

```bash
# Xem volumes
docker volume ls
#  DRIVER    VOLUME NAME
#  local     landing-page-be_postgres_data

# Xem chi tiết volume
docker volume inspect landing-page-be_postgres_data

# Xóa volume (⚠️ MẤT DATA)
docker volume rm landing-page-be_postgres_data

# Xóa volumes không dùng
docker volume prune
```

### 5.4 Quản lý với Docker Compose

```bash
# Khởi động tất cả services
docker compose up -d

# Khởi động lại (rebuild nếu có thay đổi)
docker compose up -d --build

# Tắt tất cả
docker compose down

# Tắt và xóa volumes (⚠️ MẤT DATA)
docker compose down -v

# Xem log tất cả services
docker compose logs -f

# Xem log 1 service cụ thể
docker compose logs -f postgres

# Xem status
docker compose ps
```

---

## 6. Xử lý lỗi thường gặp

### 6.1 `docker: command not found`

**Nguyên nhân**: Docker chưa cài hoặc chưa có trong PATH.

**Cách fix**:
1. Cài Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Mở Docker Desktop, đợi nó khởi động
3. Đóng terminal, mở lại
4. Nếu vẫn lỗi → thêm Docker vào PATH:
```powershell
# PowerShell (chạy với quyền Admin)
$dockerPath = "C:\Users\<username>\AppData\Local\Programs\DockerDesktop\resources\bin"
[Environment]::SetEnvironmentVariable("Path", "$env:Path;$dockerPath", "User")
```

### 6.2 `Cannot connect to the Docker daemon`

**Nguyên nhân**: Docker Desktop chưa chạy.

**Cách fix**:
1. Mở Docker Desktop
2. Đợi icon Docker ở system tray chuyển sang "running"
3. Thử lại

### 6.3 `port is already allocated`

```
Error: Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Nguyên nhân**: Port 5432 đã bị chiếm bởi process khác (có thể PostgreSQL đã cài trên máy).

**Cách fix**:
```bash
# Tìm process đang dùng port 5432
netstat -ano | findstr :5432

# Nếu là PostgreSQL đã cài sẵn → dừng nó
# Hoặc đổi port trong docker-compose.yml:
ports:
  - "5433:5432"   # Dùng port 5433 trên host
```

### 6.4 `error getting credentials`

```
error getting credentials - err: exec: "docker-credential-desktop": executable file not found
```

**Nguyên nhân**: Docker credential helper không có trong PATH.

**Cách fix**:
```powershell
# Thêm Docker vào PATH (xem 6.1)
# Hoặc restart Docker Desktop
```

### 6.5 Container liên tục restart

```bash
# Xem log để biết nguyên nhân
docker logs landing-page-db --tail 50

# Kiểm tra status
docker inspect landing-page-db --format='{{.State.Status}}'
```

### 6.6 Mất dữ liệu sau khi `docker compose down`

**Nguyên nhân**: Không dùng volume hoặc dùng `docker compose down -v`.

**Cách fix**:
- Luôn dùng volume cho database (đã có trong docker-compose.yml)
- KHÔNG dùng `-v` flag trừ khi muốn xóa data

---

## 7. Mở rộng kiến thức

### 7.1 Dockerfile (không dùng trong dự án này nhưng nên biết)

Dockerfile định nghĩa cách build một image. Ví dụ nếu muốn chạy BE trong Docker:

```dockerfile
# Dockerfile cho NestJS app
FROM node:20-alpine          # Base image

WORKDIR /app                 # Thư mục làm việc

COPY package*.json ./        # Copy package.json
RUN npm install              # Cài dependencies

COPY . .                     # Copy source code

RUN npx prisma generate      # Generate Prisma client

EXPOSE 3000                  # Mở port 3000

CMD ["npm", "run", "start:dev"]  # Lệnh khởi động
```

### 7.2 Docker networking

Docker tạo mạng riêng cho mỗi compose project. Các container trong cùng network có thể gọi nhau bằng tên service:

```yaml
# Nếu cả NestJS và PostgreSQL đều trong docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    # ...

  app:
    build: .
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/landing_page"
      #                                              ↑
      #                              Dùng tên service "postgres" thay vì "localhost"
```

### 7.3 Docker volumes vs bind mounts

```yaml
volumes:
  # Named volume (khuyến nghị cho database)
  - postgres_data:/var/lib/postgresql/data

  # Bind mount (mount thư mục từ host vào container)
  - ./prisma:/app/prisma    # Thư mục ./prisma trên host → /app/prisma trong container
```

### 7.4 Lệnh hữu ích cho debug

```bash
# Xem resource usage (CPU, RAM)
docker stats

# Xem chi tiết container
docker inspect landing-page-db

# Chạy lệnh SQL trực tiếp vào PostgreSQL container
docker exec -it landing-page-db psql -U postgres -d landing_page

# Backup database từ container
docker exec landing-page-db pg_dump -U postgres landing_page > backup.sql

# Restore database
cat backup.sql | docker exec -i landing-page-db psql -U postgres -d landing_page
```

---

## Tóm tắt cho dự án này

| Thành phần | Chạy ở đâu | Port |
|---|---|---|
| PostgreSQL 16 | Docker container (`landing-page-db`) | 5432 |
| NestJS (BE) | Trực tiếp trên máy (Node.js) | 3000 |
| Next.js (FE) | Trực tiếp trên máy (Node.js) | 3001 |

**Flow khi chạy dự án**:
```
1. docker compose up -d          # Khởi động PostgreSQL
2. npx prisma migrate dev        # Tạo bảng trong DB
3. npx prisma db seed            # Thêm data mẫu
4. npm run start:dev             # Khởi động NestJS (kết nối đến Docker PostgreSQL)
5. cd ../landing-page-fe && npm run dev  # Khởi động Next.js
```

**Lệnh tắt hàng ngày**:
```bash
# Bắt đầu ngày làm việc
docker compose up -d

# Kết thúc ngày làm việc (giữ data)
docker compose down

# Reset database (xóa sạch data)
docker compose down -v
docker compose up -d
npx prisma migrate dev
npx prisma db seed
```
