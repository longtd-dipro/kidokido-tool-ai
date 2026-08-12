# Flow 2 — Đăng ký & Xác thực

Luồng đăng ký tài khoản mới, xác nhận email, khôi phục mật khẩu và mở khóa tài khoản.

```mermaid
flowchart LR
    A([Bắt đầu]) --> B[Điền form đăng ký\nsignup.tsx]
    B --> C{Email đã\ntồn tại?}
    C -- Có --> D[Thông báo lỗi\nyêu cầu đăng nhập]
    C -- Chưa --> E[Tạo tài khoản\nAPI /auth/signup]
    E --> F[Gửi email xác thực\nemail.service.ts]
    F --> G[Khách click link\nverify/token]
    G --> H([Tài khoản active\nĐăng nhập được])

    H --> I{Quên\nmật khẩu?}
    I -- Có --> J[Yêu cầu reset\nforgot-password]
    J --> K[Email link reset]
    K --> L[Đặt mật khẩu mới\nreset-password]
    L --> H

    I -- Bị khóa --> M[Yêu cầu mở khóa\nrequest-unlock]
    M --> N[Email link mở khóa\nunlock-account]
    N --> H

    H --> P{Đăng nhập\nqua LINE?}
    P -- Có --> Q[LINE OAuth\nnextauth callback]
    Q --> R[Lưu lineUserId\nvào User table]
    R --> H
```

## Ghi chú tính năng mới (2026-08)

- **LINE user ID (KIDOKIDO-2063):** khi khách đăng nhập bằng LINE, `lineUserId` được lưu vào bảng `User` (migration `20260728000000_add_line_user_id_to_users`). Fix bug cũ: một user tiêu dùng nhầm `lineUserId` của user khác. Bổ sung API export danh sách LINE user ID và script backfill dữ liệu cũ.

