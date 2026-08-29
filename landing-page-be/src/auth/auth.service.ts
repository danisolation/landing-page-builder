import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Tạo admin (chỉ dùng 1 lần)
  async register(username: string, password: string) {
    this.logger.log(`Registering new admin: ${username}`);
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await this.prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    // Không trả password hash về client
    const { password: _, ...result } = admin;
    return result;
  }

  // Đăng nhập
  async login(dto: LoginDto) {
    this.logger.log(`Login attempt: ${dto.username}`);
    const admin = await this.prisma.admin.findUnique({
      where: { username: dto.username },
    });

    if (!admin) {
      throw new UnauthorizedException('Username hoặc password sai');
    }

    // So sánh password
    const isPasswordValid = await bcrypt.compare(dto.password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Username hoặc password sai');
    }

    // Tạo JWT token
    const payload = { sub: admin.id, username: admin.username };
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }

  // Lấy thông tin user từ token
  async getProfile(userId: string) {
    return this.prisma.admin.findUnique({
      where: { id: userId },
      select: { id: true, username: true, createdAt: true },
    });
  }
}