Thẻ quét バーコード読み取り rộng `scan-card-width` 646, bo `radius-scan`: dải tiêu đề gradient `brand-blue` → `scan-header-end`, 2 tab 「バーコードリーダー」/「カメラスキャン」 trên nền `scan-tab-bg` (tab đang chọn gạch dưới 2px `primary`), khung camera `scan-camera-size` 270 nền đen, nút 「カメラを起動する」 (gradient `primary-gradient-top` → `primary`, viền `text-link`, bo `radius-scan-control`; khi camera bị từ chối nền `negative-500`), gợi ý `text-hint`. Nguồn: Figma TOKIWAGI-PJ node 16190:447014.

- Chế độ `reader`: thay camera bằng ô 「バーコード入力」 560×56 (`field-reader-bg`, viền `field-reader-border`, bo `radius-md`) + gợi ý 「USB/Bluetoothリーダー対応…」 (Figma 16190:446819).
- **Consumer cung cấp**: `mode` (`camera` | `reader`), `denied`, `result` (hiện nút 「次のスキャンへ」 viền đứt), `children` (thường là `InlineMessage`).
- Đi kèm 2 nút trên cùng trang: 「入場・退場・決済」 (contained) và 「入場取り消し・退場取り消し」 (outlined, chữ `warning-800`).
