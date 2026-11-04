# Prompt giao Antigravity: hoàn thiện, tích hợp và phát hành Hoài Nguyệt Các

Bạn đang làm việc trực tiếp trong repo FE `tuhoahoanghuy` (React + TypeScript + Vite). Hãy đọc toàn bộ code và hoàn thành việc sửa lỗi lập lá số, kết nối backend, giữ giao diện hiện có, chạy xác minh, chuẩn bị Docker image và viết hướng dẫn deploy. Làm việc trên nhánh hiện tại; không xóa/ghi đè thay đổi có sẵn của người dùng.

## Repo và image

- FE hiện tại: thư mục repo này, remote `https://github.com/thisilaso1/tuhoahoanghuy.git`.
- Backend dự kiến: `https://github.com/thisilaso1/tuvihoanghuybe.git`.
- Docker Hub namespace/image FE: `thisilaso1/tuhoabe`.
- Backend repo đã được kiểm tra và đang rỗng. Trước khi tích hợp, xác minh lại repo. Nếu vẫn rỗng, xây dựng backend tối thiểu trong repo backend nếu workspace có quyền truy cập; nếu không có quyền/checkout thì tạo API client FE có cấu hình endpoint, tài liệu contract và ghi rõ phần tích hợp chờ backend. Không giả lập rằng backend đã tồn tại.
- Không commit/push/deploy hoặc thay đổi hạ tầng production cho đến khi mã nguồn, build, image tag và manifest đã được kiểm tra. Push image/tag là hành động phát hành; chuẩn bị toàn bộ artifact trước rồi xin chủ repo xác nhận cuối cùng nếu chưa có quyền phát hành rõ ràng.

## Lỗi nghiệp vụ cần sửa

Đọc `src/domain/tuViEngine.ts`, `src/domain/lunarCalendar.ts`, `src/domain/types.ts` và các màn hình nhập/xem lá số. Các lỗi đã phát hiện:

1. `solarToLunar` hiện là ước lượng theo chu kỳ/ngày trong tháng, không dùng được để lập lá số. Thay bằng thuật toán lịch âm Việt Nam đã công bố/được cấp phép phù hợp, UTC+7; xử lý đúng ngày đầu tháng, năm mới, tháng nhuận và dải năm hỗ trợ. Ghi nguồn, phạm vi năm và phiên bản thuật toán trong tài liệu. Tránh tự chữa theo vài test lẻ.
2. Rà soát và sửa vị trí 12 cung Mệnh/Thân từ tháng âm, giờ sinh. Thứ tự `BRANCHES` là Tý→Hợi; cần chuyển đổi đúng khi đếm từ Dần, kiểm tra đủ 12 tháng × 12 giờ bằng bảng tham chiếu độc lập.
3. Sửa an Tử Vi theo Cục và ngày âm, sau đó kiểm chứng cả vòng Tử Vi và Thiên Phủ/14 chính tinh bằng bảng test độc lập/nguồn có thể dẫn. Không đoán bằng cách dịch chỉ số để test qua.
4. Rà soát Can-Chi năm/tháng/ngày/giờ (bao gồm ranh giới ngày giờ Tý), Ngũ Hổ Độn, Ngũ Hành Cục, can cung, vị trí cung Thân và các chỉ số hiển thị. Ngày dương đổi sang ngày âm trước khi xác định năm/tháng dùng an sao; giải quyết minh bạch tháng nhuận.
5. Chỉ gọi kết quả là đã chuẩn khi có bộ case đối chiếu tối thiểu 20 lá số độc lập cho Mệnh/Thân, Cục, 14 chính tinh và lịch âm. Nếu thiếu xác nhận trường phái Khâm Thiên, nêu cụ thể quy tắc nào chưa được chuyên gia xác nhận; không khẳng định chuẩn Khâm Thiên tuyệt đối.
6. Thêm test hồi quy theo bảng giá trị kỳ vọng có nguồn. Test phải bắt được các lỗi trước đây, gồm Tết 2024-02-10, ngày đầu tháng nhuận 2023-03-22 (tháng 2 nhuận), biên giờ Tý và các giờ đại diện. Đừng chỉ test rằng chỉ số nằm trong 0..11.

## Backend và kết nối FE

- Kiểm tra backend repo thực tế trước. Làm API phục vụ nghiệp vụ tối thiểu: health/version, validate input, lập lá số theo một contract JSON có version, trả lỗi validation rõ ràng.
- FE dùng biến `VITE_API_BASE_URL`, có cấu hình development proxy nếu cần. Không ghi host production, khóa hay bí mật vào bundle.
- Giữ local engine làm phương án offline chỉ khi UI thể hiện rõ nguồn tính; tránh FE và BE trả kết quả khác nhau. Chốt một nguồn tính chính thức và contract phiên bản hóa.
- Thêm tài liệu API request/response mẫu, CORS, environment vars và cách chạy FE+BE local qua compose nếu các repo cho phép.

## Giao diện

- Giữ hướng thiết kế hiện tại; tiếp tục hoàn thiện theo responsive, tiếng Việt, rõ ràng và dễ đọc trên điện thoại/máy tính.
- Màn hình lá số phải hiển thị rõ ngày âm/dương, tháng nhuận, giờ/chi giờ, cung Mệnh, cung Thân, Cục, 12 cung và sao. Không để dữ liệu mẫu/hardcode gây hiểu lầm là kết quả thật.
- Thêm nhãn tham khảo/nghiên cứu và ghi chú trường phái khi cần.

## Docker image FE và deploy

- Đảm bảo Dockerfile multi-stage, Nginx SPA fallback, `/health`, build chạy được.
- Đổi tất cả tên image hiện tại không khớp (`thisilaso1/tuhoa`) thành `thisilaso1/tuhoabe`; cập nhật `docker-compose.yml`, README và `deploy/k8s.yaml`. Dùng tag version cụ thể (ví dụ `2026.11.04-<git-sha>`) cùng `latest`, không chỉ dùng latest.
- Tạo hoặc cập nhật hướng dẫn `DEPLOY.md`: prereq, login Docker Hub (không ghi token vào file/lệnh lưu history), build đa kiến trúc nếu cần, tag/push image, chạy compose local, deploy Kubernetes, rollout status/rollback, health check và cách cấu hình API URL. Phân biệt deploy local với production.
- Build image và chạy container smoke check cục bộ. Không push image hoặc apply Kubernetes production nếu chưa được chủ repo xác nhận cuối cùng.

## Quy trình hoàn thành và bàn giao

1. Tóm tắt trạng thái git/backend repo và xác định phạm vi thay đổi.
2. Sửa code và tài liệu, không đụng các file ngoài repo không liên quan.
3. Chạy test và `npm run build`; sửa hết lỗi. Build Docker và kiểm tra `/health` khi môi trường hỗ trợ.
4. Tổng kết file đã đổi, quy tắc đã kiểm chứng và phần còn chờ xác nhận chuyên gia/backend.
5. Chuẩn bị sẵn lệnh build/tag/push và manifest deploy để người dùng duyệt; chỉ phát hành sau xác nhận nếu chưa có ủy quyền phát hành rõ.
