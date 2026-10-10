# Ghi chú Cấu hình `cursor-pointer` cho Shadcn UI Components

Tài liệu này ghi nhớ danh sách các UI Components từ Shadcn UI cần bổ sung class `cursor-pointer` để tối ưu trải nghiệm người dùng (UX) khi thao tác trên giao diện Desktop.

---

## 📌 Lý do Shadcn UI mặc định không có `cursor-pointer`

1. **Chuẩn UX gốc của W3C & Trình duyệt**: Mặc định thẻ `<button>` và các phần tử điều hướng action sử dụng con trỏ `cursor: default` (mũi tên). Con trỏ `cursor: pointer` (bàn tay) về mặt lý thuyết được sinh ra dành riêng cho thẻ liên kết `<a>` (Hyperlink).
2. **Tuy nhiên trong thực tế Web App**: Người dùng có thói quen kỳ vọng con trỏ bàn tay `cursor-pointer` xuất hiện trên mọi phần tử có thể nhấp (Clickable).
3. **Lưu ý cú pháp Tailwind CSS**: Sử dụng class **`cursor-pointer`** _(tránh nhầm lẫn viết thành `pointer-cursor` - đây là class không hợp lệ trong Tailwind)_.

---

## 📋 Danh sách Components & Vị trí cần bổ sung `cursor-pointer`

Khi khởi tạo mới hoặc cài thêm component từ `shadcn CLI`, hãy kiểm tra và bổ sung `cursor-pointer` tại các vị trí sau:

### 1. Button (`button.tsx`)

Thêm `cursor-pointer` vào `buttonVariants`:

```tsx
const buttonVariants = cva(
  "group/button cursor-pointer inline-flex shrink-0 items-center justify-center ...",
  ...
)
```

### 2. Checkbox (`checkbox.tsx`)

Thêm `cursor-pointer` vào `CheckboxPrimitive.Root`:

```tsx
<CheckboxPrimitive.Root
  className={cn(
    "peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center ...",
    className
  )}
/>
```

### 3. Switch (`switch.tsx`)

Thêm `cursor-pointer` vào `SwitchPrimitive.Root`:

```tsx
<SwitchPrimitive.Root
  className={cn(
    "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center ...",
    className
  )}
/>
```

### 4. Tabs (`tabs.tsx`)

Thêm `cursor-pointer` vào `TabsTrigger`:

```tsx
<TabsPrimitive.Tab
  data-slot="tabs-trigger"
  className={cn(
    "relative inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center ...",
    className
  )}
/>
```

### 5. Toggle & Toggle Group (`toggle.tsx`, `toggle-group.tsx`)

Thêm `cursor-pointer` vào `toggleVariants` trong `toggle.tsx`:

```tsx
const toggleVariants = cva(
  "group/toggle inline-flex cursor-pointer items-center justify-center ...",
  ...
)
```

### 6. Select (`select.tsx`)

- Thêm `cursor-pointer` cho `SelectTrigger`:

```tsx
<SelectPrimitive.Trigger
  className={cn(
    "flex w-fit cursor-pointer items-center justify-between ...",
    className
  )}
/>
```

- Thay `cursor-default` thành `cursor-pointer` cho `SelectItem`:

```tsx
<SelectPrimitive.Item
  className={cn(
    "relative flex w-full cursor-pointer items-center ...",
    className
  )}
/>
```

### 7. Dropdown Menu (`dropdown-menu.tsx`)

Thay `cursor-default` thành `cursor-pointer` ở các sub-component:

- `DropdownMenuItem`
- `DropdownMenuSubTrigger`
- `DropdownMenuCheckboxItem`
- `DropdownMenuRadioItem`

### 8. Label (`label.tsx`)

Thêm `cursor-pointer` cho `Label` (đặc biệt hữu ích khi bấm vào label để check box / input):

```tsx
<label
  className={cn(
    "flex cursor-pointer items-center gap-2 text-sm ...",
    className
  )}
/>
```

### 9. Breadcrumb (`breadcrumb.tsx`)

Thêm `cursor-pointer` cho `BreadcrumbLink`:

```tsx
function BreadcrumbLink({ className, render, ...props }: useRender.ComponentProps<'a'>) {
  return useRender({
    defaultTagName: 'a',
    props: mergeProps<'a'>(
      {
        className: cn('cursor-pointer transition-colors hover:text-foreground', className),
      },
      props
    ),
    ...
  })
}
```

### 10. Collapsible (`collapsible.tsx`)

Thêm `cursor-pointer disabled:cursor-not-allowed` cho `CollapsibleTrigger`:

```tsx
function CollapsibleTrigger({
  className,
  ...props
}: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn("cursor-pointer disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}
```

---

## ⚡ Các Component giữ nguyên Cursor mặc định

- **Input / Textarea**: Dùng `cursor-text` (mặc định trình duyệt).
- **Card / Badge / Avatar / Table / Separator**: Dùng `cursor-default`. Chỉ bổ sung `cursor-pointer` trực tiếp bằng `className="cursor-pointer"` ở nơi sử dụng nếu có gắn sự kiện `onClick`.

---

## 🪟 Chuẩn Hoá Kích Thước Modal Dialog (`dialog.tsx`)

### 1. Vấn đề thường gặp

Mặc định trong Shadcn UI, `DialogContent` được hardcode kích thước `sm:max-w-lg` (~512px). Khi hiển thị trên màn hình Desktop lớn, các modal chứa form phức tạp, chia nhiều cột hoặc chứa bảng dữ liệu sẽ bị **dẹp ngang, bí bách và mất cân đối**.

Nếu ghi đè thủ công từng nơi bằng `className="max-w-[800px]"` hay `!max-w-2xl`:

- Gây phân mảnh mã nguồn, không nhất quán trong toàn hệ thống.
- Dễ xung đột responsive breakpoint giữa mobile và desktop.

---

### 2. Giải pháp: Hệ thống `size` Variant chuẩn trong `DialogContent`

Thành phần `DialogContent` đã được tích hợp sẵn hệ thống `size` variants thông qua `cva` (Class Variance Authority) trong [dialog.tsx](file:///p:/Nodejs/quizlet/apps/src/components/ui/dialog.tsx):

```tsx
const dialogContentVariants = cva(
  "bg-popover text-popover-foreground fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl p-4 text-sm ring-1 ...",
  {
    variants: {
      size: {
        sm: "sm:max-w-sm", // ~384px
        md: "sm:max-w-md", // ~448px
        default: "sm:max-w-lg", // ~512px (Mặc định)
        lg: "sm:max-w-xl", // ~576px
        xl: "sm:max-w-2xl", // ~672px
        "2xl": "sm:max-w-3xl", // ~768px
        "3xl": "sm:max-w-4xl", // ~896px
        full: "sm:max-w-[calc(100%-4rem)]", // Toàn màn hình (trừ margin)
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)
```

---

### 3. Bảng tra cứu chọn kích thước phù hợp

| Size      | Chiều rộng Desktop           | Mục đích & Ngữ cảnh sử dụng phù hợp                                                                                            |
| :-------- | :--------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `sm`      | `sm:max-w-sm` (~384px)       | Dialog cảnh báo, xác nhận hành động nguy hiểm (Alert Confirm, xoá item, khôi phục).                                            |
| `md`      | `sm:max-w-md` (~448px)       | Dialog form đơn giản (1–2 trường nhập), đổi tên, tạo thẻ Tag nhanh (`create-tag-modal`).                                       |
| `default` | `sm:max-w-lg` (~512px)       | Kích thước chuẩn cơ bản, form thông tin người dùng, popup chi tiết ngắn.                                                       |
| `lg`      | `sm:max-w-xl` (~576px)       | Form tạo thư mục (`create-folder-modal`), đặt mục tiêu học tập (`dashboard-goal-dialog`).                                      |
| `xl`      | `sm:max-w-2xl` (~672px)      | Form tạo học phần (`create-set-modal`), gộp học phần (`merge-sets-modal`), bảng phím tắt (`shortcuts-cheatsheet-modal`).       |
| `2xl`     | `sm:max-w-3xl` (~768px)      | Form tạo thẻ Flashcard (`create-card-modal`) với giao diện 2 mặt từ vựng / định nghĩa hoặc chia tabs.                          |
| `3xl`     | `sm:max-w-4xl` (~896px)      | Ôn tập lỗi sai nhanh (`mistakes-quick-study-dialog`), giao diện nộp bài kiểm tra (`test-dialogs`), xem trước dữ liệu bảng lớn. |
| `full`    | `sm:max-w-[calc(100%-4rem)]` | Trình soạn thảo toàn màn hình, phòng thi trắc nghiệm mở rộng, workspace đa nhiệm.                                              |

---

### 4. Cách sử dụng chuẩn

Chỉ cần truyền trực tiếp thuộc tính `size="..."` vào component `<DialogContent>`:

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Ví dụ 1: Modal xác nhận nhỏ gọn
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent size="sm">
    <DialogHeader>
      <DialogTitle>Xác nhận xoá thẻ</DialogTitle>
    </DialogHeader>
    {/* Nội dung xác nhận */}
  </DialogContent>
</Dialog>

// Ví dụ 2: Modal form tạo học phần rộng rãi
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent size="xl">
    <DialogHeader>
      <DialogTitle>Tạo học phần mới</DialogTitle>
    </DialogHeader>
    {/* Form nhập liệu nhiều cột */}
  </DialogContent>
</Dialog>

// Ví dụ 3: Modal tạo thẻ học chia tab chi tiết
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent size="2xl">
    <DialogHeader>
      <DialogTitle>Thêm thẻ ghi nhớ</DialogTitle>
    </DialogHeader>
    {/* Nội dung chi tiết */}
  </DialogContent>
</Dialog>
```

---

### 5. Lưu ý kỹ thuật khi thiết kế Modal

1. **Cuộn an toàn trên màn hình nhỏ**:
   Khi modal có nhiều nội dung hoặc trường nhập, luôn bổ sung giới hạn chiều cao và cuộn dọc cho phần nội dung:
   ```tsx
   <div className="max-h-[80vh] overflow-y-auto px-1">
     {/* Nội dung cuộn */}
   </div>
   ```
2. **Khả năng tiếp cận (Accessibility - A11y)**:
   - `DialogContent` bắt buộc luôn phải có `<DialogTitle>`.
   - Nếu thiết kế UI không muốn hiển thị tiêu đề, hãy thêm class ẩn hiển thị cho người dùng trợ năng:
     ```tsx
     <DialogTitle className="sr-only">Tiêu đề modal</DialogTitle>
     ```
3. **Responsive tự động**:
   Hệ thống `size` sử dụng tiền tố `sm:max-w-*` kết hợp `max-w-[calc(100%-2rem)]`, tự động thu gọn vừa vặn trên màn hình điện thoại (mobile) và chỉ mở rộng theo `size` được chọn khi màn hình đạt kích thước Tablet/Desktop.
