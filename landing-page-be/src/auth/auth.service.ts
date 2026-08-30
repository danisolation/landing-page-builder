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

  // Create admin (used once during setup)
  async register(username: string, password: string) {
    this.logger.log(`Registering new admin: ${username}`);
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await this.prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    this.logger.log(`Admin registered successfully: ${username}`);

    // Do not return password hash to client
    const { password: _, ...result } = admin;
    return result;
  }

  // Login
  async login(dto: LoginDto) {
    this.logger.log(`Login attempt: ${dto.username}`);
    const admin = await this.prisma.admin.findUnique({
      where: { username: dto.username },
    });

    if (!admin) {
      this.logger.warn(`Login failed — user not found: ${dto.username}`);
      throw new UnauthorizedException('Invalid username or password');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(dto.password, admin.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed — invalid password: ${dto.username}`);
      throw new UnauthorizedException('Invalid username or password');
    }

    // Generate JWT token
    const payload = { sub: admin.id, username: admin.username };
    const token = await this.jwtService.signAsync(payload);

    this.logger.log(`Login successful: ${dto.username}`);
    return { access_token: token };
  }

  // Get user info from token
  async getProfile(userId: string) {
    return this.prisma.admin.findUnique({
      where: { id: userId },
      select: { id: true, username: true, createdAt: true },
    });
  }
}
