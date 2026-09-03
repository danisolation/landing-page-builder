import type { TemplateSectionDef } from "@/types";

// Built-in templates — name/description lấy từ i18n: templates.builtin.<id>
export interface BuiltInTemplate {
  id: string;
  sections: TemplateSectionDef[];
}

export const builtInTemplates: BuiltInTemplate[] = [
  {
    id: "saas",
    sections: [
      {
        type: "hero",
        order: 0,
        content: {
          heading: "Quản lý công việc thông minh hơn",
          subheading:
            "Nền tảng tất-cả-trong-một giúp đội nhóm của bạn lập kế hoạch, theo dõi và hoàn thành công việc đúng hạn.",
          buttonText: "Dùng thử miễn phí",
          buttonLink: "#",
          secondaryButtonText: "Xem demo",
          secondaryButtonLink: "#",
        },
      },
      {
        type: "features",
        order: 1,
        content: {
          subtitle: "Tính năng",
          title: "Mọi thứ đội nhóm bạn cần",
          description:
            "Công cụ mạnh mẽ, giao diện đơn giản — bắt đầu trong vài phút.",
          items: [
            {
              icon: "⚡",
              name: "Tự động hóa",
              description:
                "Tự động hóa quy trình lặp lại, tiết kiệm hàng giờ mỗi tuần.",
            },
            {
              icon: "📊",
              name: "Báo cáo thời gian thực",
              description:
                "Theo dõi tiến độ và hiệu suất với dashboard trực quan.",
            },
            {
              icon: "🔒",
              name: "Bảo mật chuẩn doanh nghiệp",
              description: "Dữ liệu được mã hóa và sao lưu tự động hàng ngày.",
            },
          ],
        },
      },
      {
        type: "stats",
        order: 2,
        content: {
          title: "Được tin dùng bởi hàng nghìn đội nhóm",
          items: [
            { value: 12000, suffix: "+", label: "Khách hàng" },
            { value: 99.9, suffix: "%", label: "Uptime" },
            { value: 40, suffix: "+", label: "Quốc gia" },
            { value: 4.8, suffix: "/5", label: "Đánh giá trung bình" },
          ],
        },
      },
      {
        type: "testimonials",
        order: 3,
        content: {
          subtitle: "Khách hàng",
          title: "Khách hàng nói gì về chúng tôi",
          description:
            "Từ những đội nhóm đã chuyển sang làm việc hiệu quả hơn.",
          items: [
            {
              quote:
                "Chúng tôi tiết kiệm 10 giờ mỗi tuần nhờ tự động hóa quy trình.",
              name: "Nguyễn Minh Anh",
              role: "CEO, Startup ABC",
            },
            {
              quote:
                "Dashboard trực quan giúp cả team luôn nắm rõ tiến độ dự án.",
              name: "Trần Quốc Bảo",
              role: "Product Manager",
            },
            {
              quote: "Triển khai nhanh, hỗ trợ nhiệt tình. Rất đáng để đầu tư.",
              name: "Lê Thu Hà",
              role: "COO, Tech Corp",
            },
          ],
        },
      },
      {
        type: "cta",
        order: 4,
        content: {
          heading: "Sẵn sàng tăng tốc đội nhóm của bạn?",
          description: "Dùng thử miễn phí 14 ngày — không cần thẻ tín dụng.",
          buttonText: "Bắt đầu ngay",
          buttonLink: "#",
          secondaryButtonText: "Liên hệ tư vấn",
          secondaryButtonLink: "#",
        },
      },
    ],
  },
  {
    id: "launch",
    sections: [
      {
        type: "hero",
        order: 0,
        content: {
          heading: "Sản phẩm mới. Ra mắt ngay hôm nay.",
          subheading:
            "Trải nghiệm thế hệ tiếp theo — nhanh hơn, thông minh hơn, tinh tế hơn.",
          buttonText: "Đặt trước ngay",
          buttonLink: "#",
          secondaryButtonText: "Tìm hiểu thêm",
          secondaryButtonLink: "#",
        },
      },
      {
        type: "stats",
        order: 1,
        content: {
          title: "Con số biết nói",
          items: [
            { value: 3, suffix: "x", label: "Nhanh hơn thế hệ trước" },
            { value: 50, suffix: "%", label: "Tiết kiệm pin hơn" },
            { value: 10000, suffix: "+", label: "Lượt đặt trước" },
          ],
        },
      },
      {
        type: "features",
        order: 2,
        content: {
          subtitle: "Điểm nổi bật",
          title: "Vì sao bạn sẽ yêu thích",
          description: "Từng chi tiết được thiết kế lại từ đầu.",
          items: [
            {
              icon: "🚀",
              name: "Hiệu năng vượt trội",
              description: "Chip mới mạnh gấp 3 lần, xử lý mọi tác vụ mượt mà.",
            },
            {
              icon: "🎨",
              name: "Thiết kế tinh tế",
              description: "Mỏng hơn, nhẹ hơn, hoàn thiện từ vật liệu cao cấp.",
            },
            {
              icon: "🔋",
              name: "Pin cả ngày",
              description: "Sử dụng liên tục 24 giờ chỉ với một lần sạc.",
            },
          ],
        },
      },
      {
        type: "cta",
        order: 3,
        content: {
          heading: "Số lượng có hạn",
          description: "Đặt trước hôm nay để nhận ưu đãi ra mắt độc quyền.",
          buttonText: "Đặt trước ngay",
          buttonLink: "#",
        },
      },
    ],
  },
  {
    id: "event",
    sections: [
      {
        type: "hero",
        order: 0,
        content: {
          heading: "Tech Summit 2026",
          subheading:
            "Ngày 15–16/11 · TP. Hồ Chí Minh — 2 ngày, 30+ diễn giả, 1000+ người tham dự.",
          buttonText: "Đăng ký tham dự",
          buttonLink: "#",
          secondaryButtonText: "Xem chương trình",
          secondaryButtonLink: "#",
        },
      },
      {
        type: "features",
        order: 1,
        content: {
          subtitle: "Chương trình",
          title: "Điểm nhấn sự kiện",
          description: "Ba lý do bạn không thể bỏ lỡ.",
          items: [
            {
              icon: "🎤",
              name: "Diễn giả hàng đầu",
              description:
                "30+ chuyên gia từ các công ty công nghệ lớn trong và ngoài nước.",
            },
            {
              icon: "🤝",
              name: "Kết nối",
              description:
                "Gặp gỡ cộng đồng, mở rộng network với hàng trăm người cùng ngành.",
            },
            {
              icon: "🛠️",
              name: "Workshop thực hành",
              description: "Học trực tiếp qua các phiên hands-on cùng mentor.",
            },
          ],
        },
      },
      {
        type: "testimonials",
        order: 2,
        content: {
          subtitle: "Cảm nhận",
          title: "Người tham dự nói gì",
          description: "Từ những người đã tham gia mùa trước.",
          items: [
            {
              quote:
                "Sự kiện công nghệ chất lượng nhất tôi từng tham dự tại Việt Nam.",
              name: "Phạm Đức Long",
              role: "Software Engineer",
            },
            {
              quote:
                "Networking tuyệt vời — tôi tìm được cả co-founder tại đây.",
              name: "Võ Thị Mai",
              role: "Founder",
            },
          ],
        },
      },
      {
        type: "cta",
        order: 3,
        content: {
          heading: "Giữ chỗ ngay hôm nay",
          description: "Vé early-bird giảm 30% đến hết 30/09.",
          buttonText: "Mua vé ngay",
          buttonLink: "#",
        },
      },
    ],
  },
  {
    id: "agency",
    sections: [
      {
        type: "hero",
        order: 0,
        content: {
          heading: "Chúng tôi xây dựng thương hiệu số",
          subheading:
            "Agency sáng tạo đồng hành cùng doanh nghiệp từ ý tưởng đến sản phẩm hoàn thiện.",
          buttonText: "Nhận báo giá",
          buttonLink: "#",
          secondaryButtonText: "Xem portfolio",
          secondaryButtonLink: "#",
        },
      },
      {
        type: "stats",
        order: 1,
        content: {
          title: "Thành tựu của chúng tôi",
          items: [
            { value: 150, suffix: "+", label: "Dự án hoàn thành" },
            { value: 80, suffix: "+", label: "Khách hàng tin tưởng" },
            { value: 8, label: "Năm kinh nghiệm" },
            { value: 12, label: "Giải thưởng thiết kế" },
          ],
        },
      },
      {
        type: "testimonials",
        order: 2,
        content: {
          subtitle: "Khách hàng",
          title: "Đối tác nói gì về chúng tôi",
          description: "Niềm tin được xây dựng qua từng dự án.",
          items: [
            {
              quote:
                "Website mới giúp doanh số online của chúng tôi tăng 200%.",
              name: "Hoàng Văn Nam",
              role: "Giám đốc, Retail Co",
            },
            {
              quote: "Đội ngũ chuyên nghiệp, đúng deadline, vượt kỳ vọng.",
              name: "Đặng Thùy Linh",
              role: "Marketing Director",
            },
            {
              quote: "Từ branding đến sản phẩm số — họ làm tất cả xuất sắc.",
              name: "Bùi Anh Tuấn",
              role: "CEO, FnB Group",
            },
          ],
        },
      },
      {
        type: "cta",
        order: 3,
        content: {
          heading: "Có dự án trong đầu?",
          description:
            "Kể cho chúng tôi nghe — nhận tư vấn miễn phí trong 24h.",
          buttonText: "Liên hệ ngay",
          buttonLink: "#",
        },
      },
    ],
  },
];
