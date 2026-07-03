import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('auth')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrasi akun pelapor baru' })
  @ApiResponse({ status: 201, description: 'Registrasi berhasil' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({
    status: 409,
    description: 'Username atau email sudah terdaftar',
  })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Registrasi berhasil',
      data: { user },
    };
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login pengguna dan dapatkan JWT token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login berhasil' })
  @ApiResponse({ status: 401, description: 'Username atau password salah' })
  async login(@Request() req: any) {
    const data = await this.authService.login(req.user);
    return {
      statusCode: HttpStatus.OK,
      message: 'Login berhasil',
      data,
    };
  }
}
