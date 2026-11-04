# Prompt xây dựng website Tứ Hóa Khâm Thiên

## Vai trò

Bạn là kỹ sư phần mềm và chuyên gia mô hình hóa dữ liệu Tử Vi. Hãy xây dựng website tiếng Việt để lập và nghiên cứu lá số Tử Vi Tứ Hóa Khâm Thiên. Sản phẩm phải ưu tiên khả năng kiểm chứng quy tắc, bố cục rõ trên máy tính/điện thoại và xuất được lá số chất lượng cao.

## Nghiệp vụ bắt buộc

1. Cho phép nhập họ tên, giới tính, ngày tháng năm sinh, giờ sinh, loại lịch âm/dương và năm cần xem.
2. Dựng 12 cung theo địa chi, hiển thị tên cung, chính tinh, phụ tinh và các lớp hạn.
3. Hiển thị Tứ Hóa Lộc, Quyền, Khoa, Kỵ theo Thiên Can; dữ liệu quy tắc phải nằm trong module riêng, không viết cứng trong giao diện.
4. Vẽ đường mũi tên phi hóa từ trung cung tới cung chứa sao nhận hóa. Mỗi loại dùng màu và chú giải riêng.
5. Hiển thị đại hạn, tiểu hạn năm và nguyệt hạn từ tháng 1 đến tháng 12.
6. Có công tắc bật/tắt đường phi hóa và số tiểu hạn trên lá số.
7. Có bảng tra cứu Tứ Hóa đủ 10 Thiên Can, tự đánh dấu Can của năm đang xem.
8. Cho phép tải lá số PNG độ phân giải cao và in/lưu PDF.
9. Giao diện mang ngôn ngữ giấy dó, mực son và ấn triện; không dùng dashboard mẫu chung chung.

## Yêu cầu kỹ thuật

- React + TypeScript + Vite; biểu diễn lá số bằng HTML/SVG.
- Tách `astrology.ts` thành nguồn quy tắc duy nhất và viết kiểm thử cho Can Chi, bảng Tứ Hóa, số lượng cung.
- Dữ liệu đầu vào phải được kiểm tra ngày, năm và giờ hợp lệ.
- Thuật toán chuyển dương lịch sang âm lịch và phép an sao phải có tài liệu nguồn, test case đối chiếu và phiên bản quy tắc.
- Không đưa mật khẩu, host riêng hoặc khóa API vào mã nguồn/image.
- Đóng gói multi-stage Docker, phục vụ file tĩnh bằng Nginx và có healthcheck.
- Đảm bảo responsive, hỗ trợ in ngang A4 và chữ tiếng Việt đầy đủ.

## Tiêu chí nghiệm thu chuyên môn

- Đối chiếu ít nhất 20 lá số mẫu với người am hiểu đúng nhánh Khâm Thiên đang áp dụng.
- Chốt rõ lịch pháp, múi giờ, cách xử lý tháng nhuận, giờ Tý sớm/muộn và chiều an thuận/nghịch.
- Kiểm tra riêng vị trí 14 chính tinh, phụ tinh, Mệnh/Thân, cục, đại hạn, tiểu hạn, lưu niên và nguyệt hạn.
- Không phát hành kết quả như một kết luận định mệnh; hiển thị đây là công cụ nghiên cứu/tham khảo.

## Kết quả bàn giao

- Mã nguồn, bộ test, README vận hành, Dockerfile, docker-compose và cấu hình Nginx.
- Bảng dữ liệu quy tắc có thể chỉnh độc lập.
- Danh sách quy tắc đã xác thực và danh sách quy tắc còn chờ nghiệm thu.
