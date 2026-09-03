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

  // ============================================
  // PAGES - All about "Landing Page Builder" app
  // A tool for creating landing pages from pre-built components
  // ============================================

  // Page 1: Home - Giới thiệu sản phẩm
  const pageHome = await prisma.page.create({
    data: {
      title: 'BuildFlow - Tạo Landing Page trong 5 Phút',
      slug: 'home',
      description: 'BuildFlow giúp bạn tạo landing page chuyên nghiệp từ các components có sẵn, không cần code.',
      isPublished: true,
      metaTitle: 'BuildFlow - Landing Page Builder | Tạo Website trong 5 Phút',
      metaDescription: 'BuildFlow giúp bạn tạo landing page chuyên nghiệp với drag-drop components, templates đẹp, SEO ready. Không cần viết code!',
      ogImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
      keywords: 'landing page builder, page builder, tạo website, drag drop builder, no-code',
      canonicalUrl: 'https://buildflow.app',
    },
  });

  await prisma.section.createMany({
    data: [
      {
        type: 'hero',
        content: {
          heading: 'Tạo Landing Page trong 5 Phút',
          subheading: 'Kéo thả components có sẵn, xuất bản ngay lập tức. Không cần code.',
          buttonText: 'Bắt đầu miễn phí',
          buttonLink: '/register',
          secondaryButtonText: 'Xem demo',
          secondaryButtonLink: '/templates',
        },
        order: 0,
        pageId: pageHome.id,
      },
      {
        type: 'features',
        content: {
          subtitle: 'Tính năng',
          title: 'Mọi thứ bạn cần để xây landing page hoàn hảo',
          description: 'BuildFlow cung cấp đầy đủ công cụ để tạo page chuyên nghiệp',
          items: [
            { icon: '🧩', name: '50+ Components', description: 'Hero, Features, Pricing, FAQ, CTA và nhiều hơn' },
            { icon: '🎨', name: '20+ Templates', description: 'Thiết kế sẵn cho mọi ngành nghề' },
            { icon: '📱', name: 'Mobile First', description: 'Tự động responsive trên mọi thiết bị' },
            { icon: '🔍', name: 'SEO Ready', description: 'Meta tags, Open Graph, JSON-LD tự động' },
            { icon: '⚡', name: 'Tốc độ cao', description: 'Static export, CDN toàn cầu' },
            { icon: '🔗', name: 'Custom Domain', description: 'Kết nối domain riêng dễ dàng' },
          ],
        },
        order: 1,
        pageId: pageHome.id,
      },
      {
        type: 'stats',
        content: {
          title: 'Được tin dùng bởi hàng nghìn creator',
          items: [
            { value: '15K+', label: 'Landing pages đã tạo' },
            { value: '5K+', label: 'Users đang hoạt động' },
            { value: '99.9%', label: 'Uptime' },
            { value: '4.9★', label: 'Đánh giá trung bình' },
          ],
        },
        order: 2,
        pageId: pageHome.id,
      },
      {
        type: 'testimonials',
        content: {
          subtitle: 'Đánh giá',
          title: 'Creator nói gì về BuildFlow',
          description: 'Từ freelancer đến startup, mọi người đều thích BuildFlow',
          items: [
            {
              quote: 'Tôi tạo landing page cho khách hàng trong 10 phút thay vì 1 ngày. BuildFlow thay đổi công việc của tôi.',
              name: 'Minh Tran',
              role: 'Freelance Designer',
              avatar: 'https://i.pravatar.cc/150?u=10',
            },
            {
              quote: 'Template đẹp, components linh hoạt. Đội ngũ sales dùng để tạo campaign pages rất nhanh.',
              name: 'Sarah Le',
              role: 'Head of Marketing, StartupXYZ',
              avatar: 'https://i.pravatar.cc/150?u=11',
            },
            {
              quote: 'Giá cả hợp lý, dùng thử miễn phí dễ cảm nhận. Support team hỗ trợ rất nhiệt tình.',
              name: 'Hoang Pham',
              role: 'Indie Hacker',
              avatar: 'https://i.pravatar.cc/150?u=12',
            },
          ],
        },
        order: 3,
        pageId: pageHome.id,
      },
      {
        type: 'cta',
        content: {
          heading: 'Sẵn sàng tạo landing page đầu tiên?',
          description: 'Dùng thử miễn phí 14 ngày, không cần thẻ tín dụng. Hủy bất cứ lúc nào.',
          buttonText: 'Bắt đầu miễn phí',
          buttonLink: '/register',
          secondaryButtonText: 'Xem templates',
          secondaryButtonLink: '/templates',
        },
        order: 4,
        pageId: pageHome.id,
      },
    ],
  });
  console.log('Page 1: Home - Giới thiệu sản phẩm');

  // Page 2: Templates - Thư viện mẫu
  const pageTemplates = await prisma.page.create({
    data: {
      title: 'Templates - 20+ Mẫu Landing Page đẹp',
      slug: 'templates',
      description: 'Khám phá bộ sưu tập templates landing page chuyên nghiệp, sẵn sàng tùy chỉnh.',
      isPublished: true,
      metaTitle: 'Templates Landing Page | BuildFlow',
      metaDescription: '20+ templates landing page cho mọi ngành nghề: SaaS, Agency, E-commerce, Portfolio. Custom màu sắc, font chữ, nội dung dễ dàng.',
      ogImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop',
      keywords: 'landing page template, website template, mẫu website, saas template',
      canonicalUrl: 'https://buildflow.app/templates',
    },
  });

  await prisma.section.createMany({
    data: [
      {
        type: 'hero',
        content: {
          heading: '20+ Templates cho mọi ngành nghề',
          subheading: 'Chọn mẫu, tùy chỉnh nội dung, xuất bản. Dưới 10 phút.',
          buttonText: 'Duyệt templates',
          buttonLink: '#templates',
        },
        order: 0,
        pageId: pageTemplates.id,
      },
      {
        type: 'features',
        content: {
          subtitle: 'Danh mục',
          title: 'Templates theo ngành',
          description: 'Mỗi ngành có style riêng, chúng tôi thiết kế phù hợp',
          items: [
            { icon: '💻', name: 'SaaS', description: 'Product landing, pricing, feature showcase' },
            { icon: '🎨', name: 'Agency', description: 'Portfolio, services, case studies' },
            { icon: '🛒', name: 'E-commerce', description: 'Product page, sale campaign, collection' },
            { icon: '📱', name: 'App', description: 'App landing, download CTA, feature highlights' },
            { icon: '🎯', name: 'Startup', description: 'Launch page, waitlist, investor pitch' },
            { icon: '📝', name: 'Blog', description: 'Content-focused, newsletter signup' },
          ],
        },
        order: 1,
        pageId: pageTemplates.id,
      },
      {
        type: 'stats',
        content: {
          title: 'Mỗi template được thiết kế kỹ lưỡng',
          items: [
            { value: '20+', label: 'Templates miễn phí' },
            { value: '100%', label: 'Mobile responsive' },
            { value: '50+', label: 'Components tùy biến' },
            { value: 'Unlimited', label: 'Chỉnh sửa không giới hạn' },
          ],
        },
        order: 2,
        pageId: pageTemplates.id,
      },
      {
        type: 'cta',
        content: {
          heading: 'Tìm template phù hợp với bạn',
          description: 'Click vào template để xem trước, sau đó tùy chỉnh theo brand của bạn',
          buttonText: 'Bắt đầu tạo page',
          buttonLink: '/register',
        },
        order: 3,
        pageId: pageTemplates.id,
      },
    ],
  });
  console.log('Page 2: Templates - Thư viện mẫu');

  // Page 3: Pricing - Bảng giá
  const pagePricing = await prisma.page.create({
    data: {
      title: 'Bảng giá - Linh hoạt cho mọi nhu cầu',
      slug: 'pricing',
      description: 'Từ miễn phí đến Pro, BuildFlow có gói phù hợp cho freelancer đến doanh nghiệp.',
      isPublished: true,
      metaTitle: 'Bảng giá BuildFlow | Từ miễn phí đến Pro',
      metaDescription: 'Gói Miễn phí với 3 pages, gói Pro $19/tháng unlimited pages. Custom domain, remove branding, analytics.',
      ogImageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop',
      keywords: 'pricing, bảng giá, landing page builder giá rẻ, free plan',
      canonicalUrl: 'https://buildflow.app/pricing',
    },
  });

  await prisma.section.createMany({
    data: [
      {
        type: 'hero',
        content: {
          heading: 'Giá minh bạch, không phí ẩn',
          subheading: 'Bắt đầu miễn phí, nâng cấp khi cần. Hủy bất cứ lúc nào.',
          buttonText: 'Bắt đầu miễn phí',
          buttonLink: '/register',
        },
        order: 0,
        pageId: pagePricing.id,
      },
      {
        type: 'features',
        content: {
          subtitle: 'So sánh gói',
          title: 'Chọn gói phù hợp',
          description: 'Tất cả gói đều bao gồm templates, components, hosting',
          items: [
            { icon: '🆓', name: 'Free - $0', description: '3 pages, 1 custom domain, BuildFlow branding' },
            { icon: '⭐', name: 'Pro - $19/tháng', description: 'Unlimited pages, custom domain, no branding' },
            { icon: '🏢', name: 'Team - $49/tháng', description: 'Mọi thứ trong Pro + 5 members, analytics' },
            { icon: '🚀', name: 'Enterprise', description: 'Custom SLA, dedicated support, SSO' },
          ],
        },
        order: 1,
        pageId: pagePricing.id,
      },
      {
        type: 'testimonials',
        content: {
          subtitle: 'Phản hồi',
          title: 'Users chọn BuildFlow vì',
          description: 'Giá tốt, tính năng đầy đủ, support nhiệt tình',
          items: [
            {
              quote: 'Gói Pro rẻ hơn nhiều tool khác mà tính năng đầy đủ hơn. Worth every penny.',
              name: 'Alex Nguyen',
              role: 'Growth Marketer',
              avatar: 'https://i.pravatar.cc/150?u=20',
            },
            {
              quote: 'Bắt đầu với Free, nâng cấp Pro khi cần thêm pages. Rất linh hoạt.',
              name: 'Linh Dao',
              role: 'Blogger',
              avatar: 'https://i.pravatar.cc/150?u=21',
            },
          ],
        },
        order: 2,
        pageId: pagePricing.id,
      },
      {
        type: 'cta',
        content: {
          heading: 'Dùng thử miễn phí 14 ngày',
          description: 'Gói Pro đầy đủ tính năng. Không cần thẻ tín dụng.',
          buttonText: 'Bắt đầu dùng thử',
          buttonLink: '/register',
          secondaryButtonText: 'So sánh gói',
          secondaryButtonLink: '#pricing',
        },
        order: 3,
        pageId: pagePricing.id,
      },
    ],
  });
  console.log('Page 3: Pricing - Bảng giá');

  // Page 4: FAQ - Câu hỏi thường gặp
  const pageFaq = await prisma.page.create({
    data: {
      title: 'FAQ - Câu hỏi thường gặp',
      slug: 'faq',
      description: 'Giải đáp các thắc mắc về BuildFlow landing page builder.',
      isPublished: true,
      metaTitle: 'FAQ - Câu hỏi thường gặp về BuildFlow',
      metaDescription: 'Tìm câu trả lời cho các câu hỏi về BuildFlow: cách sử dụng, pricing, templates, custom domain, SEO.',
      ogImageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=630&fit=crop',
      keywords: 'faq, hướng dẫn, landing page builder help',
      canonicalUrl: 'https://buildflow.app/faq',
    },
  });

  await prisma.section.createMany({
    data: [
      {
        type: 'hero',
        content: {
          heading: 'Câu hỏi thường gặp',
          subheading: 'Mọi thứ bạn cần biết về BuildFlow',
          buttonText: 'Liên hệ support',
          buttonLink: '/contact',
        },
        order: 0,
        pageId: pageFaq.id,
      },
      {
        type: 'features',
        content: {
          subtitle: 'FAQ',
          title: 'Giải đáp thắc mắc',
          description: 'Nếu không tìm thấy câu trả lời, hãy liên hệ chúng tôi',
          items: [
            { icon: '❓', name: 'BuildFlow là gì?', description: 'BuildFlow là công cụ tạo landing page từ components có sẵn. Kéo thả, tùy chỉnh, xuất bản.' },
            { icon: '🛠️', name: 'Có cần biết code không?', description: 'Không! BuildFlow dành cho mọi người, không cần kỹ năng lập trình.' },
            { icon: '🌐', name: 'Có thể dùng domain riêng không?', description: 'Có! Kết nối domain cá nhân trong vài phút.' },
            { icon: '📊', name: 'Có tích hợp analytics không?', description: 'Gói Team trở lên có analytics tích hợp. Các gói khác có thể embed Google Analytics.' },
            { icon: '🔄', name: 'Có thể export code không?', description: 'Có! Export static HTML/CSS để host ở bất cứ đâu.' },
            { icon: '💳', name: 'Chính sách hoàn tiền?', description: 'Dùng thử miễn phí 14 ngày. Đã thanh toán không hoàn tiền nhưng hủy bất cứ lúc nào.' },
          ],
        },
        order: 1,
        pageId: pageFaq.id,
      },
      {
        type: 'cta',
        content: {
          heading: 'Vẫn còn câu hỏi?',
          description: 'Support team phản hồi trong vòng 24 giờ',
          buttonText: 'Gửi câu hỏi',
          buttonLink: '/contact',
        },
        order: 2,
        pageId: pageFaq.id,
      },
    ],
  });
  console.log('Page 4: FAQ - Câu hỏi thường gặp');

  // Page 5: Contact - Liên hệ
  const pageContact = await prisma.page.create({
    data: {
      title: 'Liên hệ - Hỗ trợ & Tư vấn',
      slug: 'contact',
      description: 'Liên hệ BuildFlow để được hỗ trợ hoặc tư vấn sử dụng.',
      isPublished: true,
      metaTitle: 'Liên hệ BuildFlow | Hỗ trợ & Tư vấn',
      metaDescription: 'Liên hệ BuildFlow qua email hoặc form. Đội ngũ support phản hồi trong 24h.',
      ogImageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop',
      keywords: 'liên hệ, support, buildflow contact',
      canonicalUrl: 'https://buildflow.app/contact',
    },
  });

  await prisma.section.createMany({
    data: [
      {
        type: 'hero',
        content: {
          heading: 'Liên hệ với chúng tôi',
          subheading: 'Đội ngũ BuildFlow luôn sẵn sàng hỗ trợ bạn',
          buttonText: 'Gửi email',
          buttonLink: 'mailto:hello@buildflow.app',
        },
        order: 0,
        pageId: pageContact.id,
      },
      {
        type: 'features',
        content: {
          subtitle: 'Kênh liên hệ',
          title: 'Chúng tôi ở đây để giúp',
          description: 'Phản hồi nhanh qua nhiều kênh',
          items: [
            { icon: '📧', name: 'Email', description: 'hello@buildflow.app - Phản hồi trong 24h' },
            { icon: '💬', name: 'Live Chat', description: 'Thứ 2-6, 9h-18h (GMT+7)' },
            { icon: '📚', name: 'Documentation', description: 'docs.buildflow.app - Hướng dẫn chi tiết' },
            { icon: '🐦', name: 'Twitter', description: '@buildflow - Cập nhật & hỗ trợ' },
          ],
        },
        order: 1,
        pageId: pageContact.id,
      },
      {
        type: 'cta',
        content: {
          heading: 'Bắt đầx hành trình của bạn',
          description: 'Tạo landing page đầu tiên miễn phí hôm nay',
          buttonText: 'Đăng ký miễn phí',
          buttonLink: '/register',
        },
        order: 2,
        pageId: pageContact.id,
      },
    ],
  });
  console.log('Page 5: Contact - Liên hệ');

  console.log('');
  console.log('✅ Seeding completed!');
  console.log('');
  console.log('Pages created:');
  console.log('  1. Home (/home) - Giới thiệu BuildFlow');
  console.log('  2. Templates (/templates) - Thư viện mẫu');
  console.log('  3. Pricing (/pricing) - Bảng giá');
  console.log('  4. FAQ (/faq) - Câu hỏi thường gặp');
  console.log('  5. Contact (/contact) - Liên hệ');
  console.log('');
  console.log('All pages have SEO: metaTitle, metaDescription, ogImageUrl, keywords, canonicalUrl');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
