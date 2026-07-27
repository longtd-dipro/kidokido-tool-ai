# Flow 9 — Admin Setup cơ sở

Luồng admin cấu hình hệ thống trước khi mở đặt vé và theo dõi vận hành hàng ngày.

```mermaid
flowchart LR
    A([Admin đăng nhập]) --> B[Tạo Tenant / Cơ sở\n/admin/tenant-management]
    B --> C[Cấu hình GMO Merchant\n/api/admin/gmo-settings]
    C --> D[Tạo Gói Vé\n/admin/ticket-management]
    D --> E[Cấu hình Lịch đặt vé\nticket-booking-schedules]
    E --> F[Cài đặt mẫu Email\n/admin/email-settings]
    F --> G[Đăng tin tức / Điều khoản\n/admin/news-management]
    G --> H([Cơ sở sẵn sàng\nKhách có thể đặt vé])

    H --> I[Theo dõi hàng chờ\n/admin/booking-queue]
    I --> J[Quản lý quét vé\n/admin/scan-management]
    J --> K[Xem trạng thái chỗ trống\n/admin/vacancies-status]
    K --> L[Xuất doanh thu & OBIC\n/admin/revenue-management]
```
