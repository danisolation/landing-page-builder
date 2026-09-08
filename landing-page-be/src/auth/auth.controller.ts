import { Controller, Post, Get, Body, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './public.decorator';

@ApiTags('Auth')
@Controller('auth')
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts/min — brute force protection
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register — yêu cầu auth (chỉ admin mới tạo được admin mới)
  // Seed script tạo admin đầu tiên, không cần public endpoint
  @Post('register')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Register an admin',
    description:
      'Creates a new admin account. **Requires authentication** — only an existing admin can create another. The first admin is created by the seed script.',
  })
  @ApiResponse({ status: 201, description: 'Admin created (password is excluded from the response)' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required' })
  @ApiResponse({ status: 400, description: 'Validation error (username too short, password too weak, etc.)' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.username, dto.password);
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: '🌐 Log in',
    description:
      'Authenticates with username + password and returns a JWT `access_token`. Use this token as `Authorization: Bearer <token>` on all protected routes.',
  })
  @ApiResponse({ status: 201, description: 'Login successful — JWT returned' })
  @ApiResponse({ status: 401, description: 'Invalid username or password' })
  @ApiResponse({ status: 429, description: 'Too many attempts — limited to 5 / min' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // GET /auth/profile — requires token (global guard protects)
  @Get('profile')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get current admin profile', description: 'Returns the profile of the authenticated admin (from the JWT).' })
  @ApiResponse({ status: 200, description: 'Admin profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
