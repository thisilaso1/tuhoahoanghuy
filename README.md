# Hoài Nguyệt Các

Website lập và tra cứu lá số Tử Vi Tứ Hóa Khâm Thiên. Giao diện gồm mệnh bàn 12 cung, giờ/phút sinh nhập tay, đường phi hóa, tự hóa ly tâm/hướng tâm, đại hạn, tiểu hạn, nguyệt hạn, bảng tra cứu và xuất PNG/PDF.

## Chạy phát triển

```bash
npm install
npm run dev
```

## Kiểm thử và build

```bash
npm test
npm run build
```

## Docker

```bash
docker compose up -d --build
```

Mở `http://localhost:8088`. Kiểm tra container bằng `http://localhost:8088/health`.

## K3s / Kubernetes

Image phát hành cho máy chủ AMD64: `thisilaso1/tuhoa:latest`.

```bash
kubectl apply -f deploy/k8s.yaml
kubectl -n envitek-iot rollout status deployment/tu-hoa-kham-thien
```

Service dùng NodePort `30088`; endpoint kiểm tra là `/health`.

## Phạm vi nghiệp vụ

Bảng Tứ Hóa theo 10 Thiên Can, Can Chi năm và cấu trúc hiển thị 12 cung đã được tách thành module có kiểm thử. Phần vị trí sao và các lớp hạn hiện là mô hình tính xác định để nghiệm thu giao diện/dữ liệu, chưa phải bản luận đoán chính thức. Trước khi dùng nghiệp vụ thực tế, cần chuyên gia đúng phái Khâm Thiên xác nhận quy tắc an 14 chính tinh, tháng nhuận, giờ Tý, Mệnh/Thân và chiều hạn; sau đó thay bộ tính trong `src/astrology.ts` theo test case chuẩn.

Đặc tả sản phẩm và tiêu chí nghiệm thu nằm trong `PROMPT.md`.
