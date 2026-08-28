import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Tạo Admin
  const hashedPassword = await bcrypt.hash('123456', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });
  console.log('Admin created:', admin.username);

  // 2. Xóa dữ liệu cũ
  await prisma.section.deleteMany();
  await prisma.page.deleteMany();

  // 3. Tạo Pages với đầy đủ 5 loại sections

  // Page 1: Sản phẩm mới (Published)
  const page1 = await prisma.page.create({
    data: {
      title: 'Sản phẩm mới',
      slug: 'san-pham-moi',
      description: 'Giới thiệu sản phẩm ABC - Giải pháp toàn diện cho doanh nghiệp',
      isPublished: true,
    },
  });

  await prisma.section.createMany({
    data: [
      {
        type: 'hero',
        content: {
          heading: 'Chào mừng đến với ABC',
          subheading: 'Giải pháp tốt nhất cho doanh nghiệp của bạn',
          buttonText: 'Đăng ký ngay',
          buttonLink: '/dang-ky',
          secondaryButtonText: 'Xem demo',
          secondaryButtonLink: '/demo',
        },
        order: 0,
        pageId: page1.id,
      },
      {
        type: 'features',
        content: {
          subtitle: 'Tính năng',
          title: 'Tính năng nổi bật',
          description: 'Những tính năng giúp doanh nghiệp của bạn phát triển',
          items: [
            { icon: '⚡', name: 'Nhanh chóng', description: 'Tốc độ xử lý nhanh gấp 10 lần' },
            { icon: '🔒', name: 'Bảo mật cao', description: 'Dữ liệu được mã hóa end-to-end' },
            { icon: '💡', name: 'AI thông minh', description: 'Hỗ trợ bởi trí tuệ nhân tạo' },
            { icon: '📊', name: 'Phân tích', description: 'Báo cáo chi tiết theo thời gian thực' },
          ],
        },
        order: 1,
        pageId: page1.id,
      },
      {
        type: 'stats',
        content: {
          title: 'Con số ấn tượng',
          items: [
            { value: '10K+', label: 'Khách hàng' },
            { value: '99.9%', label: 'Uptime' },
            { value: '50+', label: 'Quốc gia' },
            { value: '4.9', label: 'Đánh giá' },
          ],
        },
        order: 2,
        pageId: page1.id,
      },
      {
        type: 'testimonials',
        content: {
          subtitle: 'Đánh giá',
          title: 'Khách hàng nói gì về chúng tôi',
          description: 'Từ những người đã tin tưởng sử dụng sản phẩm',
          items: [
            {
              quote: 'Sản phẩm tuyệt vời, giúp tôi tiết kiệm rất nhiều thời gian quản lý.',
              name: 'Nguyễn Văn A',
              role: 'CEO, Tech Corp',
              avatar: 'https://i.pravatar.cc/150?u=1',
            },
            {
              quote: 'Giao diện thân thiện, dễ sử dụng. Đội ngũ hỗ trợ rất nhiệt tình.',
              name: 'Trần Thị B',
              role: 'Marketing Manager',
              avatar: 'https://i.pravatar.cc/150?u=2',
            },
            {
              quote: 'Tôi đã thử nhiều giải pháp khác nhau nhưng đây là tốt nhất.',
              name: 'Lê Văn C',
              role: 'Founder, Startup X',
              avatar: 'https://i.pravatar.cc/150?u=3',
            },
          ],
        },
        order: 3,
        pageId: page1.id,
      },
      {
        type: 'cta',
        content: {
          heading: 'Sẵn sàng bắt đầu?',
          description: 'Tham gia cùng hàng nghìn khách hàng tin tưởng chúng tôi',
          buttonText: 'Liên hệ ngay',
          buttonLink: '/lien-he',
          secondaryButtonText: 'Tìm hiểu thêm',
          secondaryButtonLink: '/about',
        },
        order: 4,
        pageId: page1.id,
      },
    ],
  });
  console.log('Page 1 created: Sản phẩm mới (5 sections)');

  // Page 2: Dịch vụ (Published)
  const page2 = await prisma.page.create({
    data: {
      title: 'Dịch vụ',
      slug: 'dich-vu',
      description: 'Các dịch vụ chuyên nghiệp chúng tôi cung cấp',
      isPublished: true,
    },
  });

  await prisma.section.createMany({
    data: [
      {
        type: 'hero',
        content: {
          heading: 'Dịch vụ chuyên nghiệp',
          subheading: 'Giải pháp toàn diện cho mọi nhu cầu',
          buttonText: 'Xem dịch vụ',
          buttonLink: '/dich-vu',
        },
        order: 0,
        pageId: page2.id,
      },
      {
        type: 'features',
        content: {
          subtitle: 'Dịch vụ',
          title: 'Chúng tôi cung cấp',
          description: 'Đội ngũ chuyên gia với nhiều năm kinh nghiệm',
          items: [
            { icon: '🎨', name: 'Thiết kế', description: 'UI/UX chuyên nghiệp' },
            { icon: '💻', name: 'Phát triển', description: 'Web & Mobile app' },
            { icon: '📈', name: 'Marketing', description: 'Chiến lược digital' },
            { icon: '🛠️', name: 'Bảo trì', description: 'Hỗ trợ 24/7' },
            { icon: '📱', name: 'Mobile', description: 'iOS & Android' },
            { icon: '☁️', name: 'Cloud', description: 'Triển khai đám mây' },
          ],
        },
        order: 1,
        pageId: page2.id,
      },
      {
        type: 'cta',
        content: {
          heading: 'Bạn cần tư vấn?',
          description: 'Liên hệ với chúng tôi để được tư vấn miễn phí',
          buttonText: 'Nhận tư vấn',
          buttonLink: '/tu-van',
        },
        order: 2,
        pageId: page2.id,
      },
    ],
  });
  console.log('Page 2 created: Dịch vụ (3 sections)');

  // Page 3: Về chúng tôi (Draft)
  const page3 = await prisma.page.create({
    data: {
      title: 'Về chúng tôi',
      slug: 've-chung-toi',
      description: 'Câu chuyện và đội ngũ đằng sau sản phẩm',
      isPublished: false,
    },
  });

  await prisma.section.createMany({
    data: [
      {
        type: 'hero',
        content: {
          heading: 'Về chúng tôi',
          subheading: 'Đội ngũ đam mê, sáng tạo không ngừng',
          buttonText: 'Gặp gỡ đội ngũ',
          buttonLink: '/doi-ngu',
        },
        order: 0,
        pageId: page3.id,
      },
      {
        type: 'stats',
        content: {
          title: 'Con số về chúng tôi',
          items: [
            { value: '5+', label: 'Năm kinh nghiệm' },
            { value: '50+', label: 'Thành viên' },
            { value: '200+', label: 'Dự án hoàn thành' },
            { value: '100%', label: 'Khách hàng hài lòng' },
          ],
        },
        order: 1,
        pageId: page3.id,
      },
      {
        type: 'testimonials',
        content: {
          subtitle: 'Phản hồi',
          title: 'Đội ngũ nói gì',
          description: 'Lời chia sẻ từ những người làm việc tại đây',
          items: [
            {
              quote: 'Môi trường làm việc tuyệt vời, cơ hội phát triển bản thân rất nhiều.',
              name: 'Phạm Thị D',
              role: 'Senior Developer',
              avatar: 'https://i.pravatar.cc/150?u=4',
            },
            {
              quote: 'Tôi yêu văn hóa công ty ở đây. Mọi người đều hỗ trợ lẫn nhau.',
              name: 'Hoàng Văn E',
              role: 'Product Manager',
              avatar: 'https://i.pravatar.cc/150?u=5',
            },
          ],
        },
        order: 2,
        pageId: page3.id,
      },
    ],
  });
  console.log('Page 3 created: Về chúng tôi (3 sections, draft)');

  // Page 4: Pricing (Published)
  const page4 = await prisma.page.create({
    data: {
      title: 'Bảng giá',
      slug: 'bang-gia',
      description: 'Các gói dịch vụ phù hợp với mọi quy mô',
      isPublished: true,
    },
  });

  await prisma.section.createMany({
    data: [
      {
        type: 'hero',
        content: {
          heading: 'Bảng giá',
          subheading: 'Chọn gói phù hợp với bạn',
          buttonText: 'Bắt đầu miễn phí',
          buttonLink: '/dang-ky',
          secondaryButtonText: 'Liên hệ bán hàng',
          secondaryButtonLink: '/lien-he',
        },
        order: 0,
        pageId: page4.id,
      },
      {
        type: 'features',
        content: {
          subtitle: 'So sánh',
          title: 'Tính năng theo gói',
          description: 'Tất cả các gói đều bao gồm hỗ trợ 24/7',
          items: [
            { icon: '🆓', name: 'Miễn phí', description: 'Dành cho cá nhân' },
            { icon: '⭐', name: 'Pro', description: 'Dành cho nhóm nhỏ' },
            { icon: '🏢', name: 'Enterprise', description: 'Dành cho doanh nghiệp' },
          ],
        },
        order: 1,
        pageId: page4.id,
      },
      {
        type: 'testimonials',
        content: {
          subtitle: 'Phản hồi',
          title: 'Khách hàng đánh giá',
          description: 'Hơn 10,000 khách hàng tin tưởng sử dụng',
          items: [
            {
              quote: 'Gói Pro hoàn toàn xứng đáng. Tôi đã nâng cấp sau 1 tháng sử dụng.',
              name: 'Đỗ Văn F',
              role: 'Freelancer',
              avatar: 'https://i.pravatar.cc/150?u=6',
            },
          ],
        },
        order: 2,
        pageId: page4.id,
      },
      {
        type: 'cta',
        content: {
          heading: 'Bắt đầu ngay hôm nay',
          description: 'Dùng thử miễn phí 14 ngày, không cần thẻ tín dụng',
          buttonText: 'Dùng thử miễn phí',
          buttonLink: '/dang-ky',
        },
        order: 3,
        pageId: page4.id,
      },
    ],
  });
  console.log('Page 4 created: Bảng giá (4 sections)');

  // Page 5: Landing page trống (Draft)
  const page5 = await prisma.page.create({
    data: {
      title: 'Campaign mùa hè',
      slug: 'campaign-mua-he',
      description: 'Landing page cho chiến dịch khuyến mãi mùa hè',
      isPublished: false,
    },
  });
  console.log('Page 5 created: Campaign mùa hè (0 sections, draft)');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
