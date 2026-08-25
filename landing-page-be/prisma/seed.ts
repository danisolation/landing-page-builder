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

  // 2. Tạo Page mẫu
  const page = await prisma.page.upsert({
    where: { slug: 'san-pham-moi' },
    update: {},
    create: {
      title: 'Sản phẩm mới',
      slug: 'san-pham-moi',
      description: 'Giới thiệu sản phẩm ABC',
      isPublished: true,
    },
  });
  console.log('Page created:', page.title);

  // 3. Tạo Sections mẫu
  const sections = [
    {
      type: 'hero',
      content: {
        heading: 'Chào mừng đến với ABC',
        subheading: 'Giải pháp tốt nhất cho bạn',
        buttonText: 'Đăng ký ngay',
        buttonLink: '/dang-ky',
      },
      order: 0,
    },
    {
      type: 'features',
      content: {
        title: 'Tính năng nổi bật',
        items: [
          { icon: '⚡', name: 'Nhanh chóng', description: 'Tốc độ xử lý nhanh' },
          { icon: '🔒', name: 'Bảo mật', description: 'Dữ liệu được mã hóa' },
          { icon: '💡', name: 'Thông minh', description: 'AI hỗ trợ' },
        ],
      },
      order: 1,
    },
    {
      type: 'cta',
      content: {
        heading: 'Sẵn sàng bắt đầu?',
        buttonText: 'Liên hệ ngay',
        buttonLink: '/lien-he',
      },
      order: 2,
    },
  ];

  for (const section of sections) {
    await prisma.section.create({
      data: {
        ...section,
        pageId: page.id,
      },
    });
  }
  console.log('Sections created:', sections.length);

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
