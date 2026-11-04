# Build và deploy Hoài Nguyệt Các

Tài liệu này hướng dẫn chạy FE tĩnh bằng Docker/Nginx. Backend `tuvihoanghuybe` cần triển khai riêng; repo backend đã được kiểm tra ngày 04/11/2026 và đang rỗng. FE hiện chưa có API backend được cấu hình. Xem `ANTIGRAVITY_PROMPT.md` để hoàn thành API, contract và tích hợp trước khi phát hành kết nối FE/BE.

## 1. Chạy FE local để xem

Yêu cầu Node.js 20+ và npm.

```bash
cd tuhoahoanghuy
npm ci
npm run dev
```

Mở `http://localhost:5173`. Dừng server bằng `Ctrl+C`.

## 2. Kiểm tra trước khi đóng gói

```bash
npm test
npm run build
```

Build tĩnh tạo ra trong `dist/`.

## 3. Build và chạy Docker trên máy local

Yêu cầu Docker Engine/Desktop và Docker Compose v2.

```bash
docker compose build
docker compose up -d
```

Mở `http://localhost:8088`. Kiểm tra health:

```bash
curl -fsS http://localhost:8088/health
docker compose logs --tail=100
```

Dừng container:

```bash
docker compose down
```

## 4. Build và push image Docker Hub

Image FE: `thisilaso1/tuhoabe`. Chọn tag phiên bản duy nhất cho từng lần phát hành, ví dụ `2026.11.04-<git-sha>`; không dùng `latest` làm tag duy nhất. Chỉ chạy bước push sau khi build và smoke check đạt, repo đúng, và người có quyền phát hành đã duyệt.

Đăng nhập Docker Hub bằng prompt tương tác, không đưa access token vào file hoặc command history:

```bash
docker login --username thisilaso1
```

Build image native:

```bash
docker build -t thisilaso1/tuhoabe:2026.11.04-<git-sha> -t thisilaso1/tuhoabe:latest .
```

Nếu cluster cần AMD64 và máy build là ARM Mac, dùng Buildx:

```bash
docker buildx build --platform linux/amd64 -t thisilaso1/tuhoabe:2026.11.04-<git-sha> -t thisilaso1/tuhoabe:latest --push .
```

Lệnh trên đã push khi hoàn tất. Nếu đã build local và smoke check trước, có thể push từng tag:

```bash
docker push thisilaso1/tuhoabe:2026.11.04-<git-sha>
docker push thisilaso1/tuhoabe:latest
```

Thay `<git-sha>` bằng mã commit thật; không gõ nguyên dấu ngoặc nhọn. Để tránh tag trùng, lấy SHA từ commit phát hành, ví dụ `git rev-parse --short=12 HEAD`.

## 5. Deploy Kubernetes

`deploy/k8s.yaml` hiện dùng namespace `envitek-iot` và NodePort `30088`. Xác nhận cluster/context và quyền namespace trước khi apply. Thay image tag trong manifest từ `latest` sang tag bất biến vừa push.

```bash
kubectl config current-context
kubectl get namespace envitek-iot
kubectl apply -f deploy/k8s.yaml
kubectl -n envitek-iot rollout status deployment/tu-hoa-kham-thien
kubectl -n envitek-iot get pods,svc -l app=tu-hoa-kham-thien
```

Truy cập `http://<node-ip>:30088/`; health check là `/health`.

Rollback phiên bản triển khai:

```bash
kubectl -n envitek-iot rollout undo deployment/tu-hoa-kham-thien
kubectl -n envitek-iot rollout status deployment/tu-hoa-kham-thien
```

Nếu cluster dùng ingress/domain, cấu hình ingress và TLS riêng trong cluster. Không đưa domain production hoặc thông tin xác thực vào image/repo.

## 6. FE và backend

FE hiện được build thành static assets. Khi backend được triển khai, cấu hình URL API qua biến build `VITE_API_BASE_URL` hoặc reverse proxy cùng origin tại Nginx. Biến `VITE_*` được nhúng vào bundle và không được chứa secret. Chốt contract/version API, CORS và health check backend trước khi phát hành FE tích hợp.

Khi thay đổi cấu hình Nginx/proxy hoặc biến build, cần rebuild image. Không coi image FE hiện tại là đã ghép backend.
