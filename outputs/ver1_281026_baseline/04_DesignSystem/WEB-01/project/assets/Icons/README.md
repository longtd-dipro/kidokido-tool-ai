61 icon SVG thu từ Admin site (WEB-01), giữ nguyên file. Ba bộ:

- **Icon menu sidebar** (nét 1.5px, khung 24×24, file của hệ thống): `dashboard-*`, `house-*`, `shop-add-*`, `chart-*` và `nav-*` (menu của vai trò tenant / POSS / Smaregi). Bản `-inactive` mực `text-low` #676767, bản `-active` mực `on-nav-active` #F5F5F5 / trắng để đặt trên gradient mục đang chọn. `calendar.svg` là icon lịch của date picker dashboard (mực `text-label` #262627). `kid-o-kid.svg` là icon sao chép 10×10 (mực `brand-blue`).
- **Icon MUI Material** (khung 24×24, tô một màu, tên file = tên icon MUI): `Visibility`, `EditOutlined`, `Delete`, `ArrowDropDown`, `NavigateBefore/Next`, `KeyboardArrow*`, `Add`, `AddCircleOutlineRounded`, `SaveAlt`, `Clock`, `RadioButton*`, `CheckBox`, `CameraAltOutlined`, `QrCodeScanner`, `FavoriteBorder`, `Circle`, `CircleOutlined`, `Separator`. Mực gốc thường là `icon-default` rgba(0,0,0,0.54).
- **Icon thanh công cụ soạn thảo** (Quill, 18×18, mực #000 / `editor-icon` #444): `editor-*`, chỉ dùng trong khung soạn thảo SC-022.

Trong code dùng component `Icon` (path MUI, tô `currentColor`) để icon nhận màu theo ngữ cảnh; chỉ dùng file SVG khi cần `<img>` tĩnh (icon menu sidebar).
