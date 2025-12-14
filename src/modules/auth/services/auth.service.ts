import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/services/users.service';
import { CompaniesService } from '../../companies/services/companies.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { UserRole } from '../../users/entities/user.entity';
import { BlacklistedToken } from '../entities/blacklisted-token.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private jwtService: JwtService,
    @InjectRepository(BlacklistedToken)
    private blacklistedTokenRepository: Repository<BlacklistedToken>,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Password incorrect');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account has been deleted');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    const jti = crypto.randomUUID();
    const payload = { 
      sub: user.id, 
      email: user.email,
      companyId: user.companyId,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      jti
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        preferredLanguage: user.preferredLanguage
      }
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Get country config for VAT rate and currency
    const countryConfig = this.getCountryConfig(registerDto.countryCode);
    
    // Create company first
    const company = await this.companiesService.create({
      name: registerDto.companyName,
      countryCode: registerDto.countryCode,
      currencyCode: countryConfig.currencyCode,
      vatRate: countryConfig.defaultVatRate,
      trn: registerDto.trn,
      phone: registerDto.phone,
      isActive: true,
      isTestAccount: false
    });

    // Create user
    const user = await this.usersService.create({
      companyId: company.id,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: registerDto.password,
      role: UserRole.OWNER,
      phone: registerDto.phone
    });

    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      company: {
        id: company.id,
        name: company.name,
        countryCode: company.countryCode,
        currencyCode: company.currencyCode
      }
    };
  }

  private getCountryConfig(countryCode: string) {
    const configs = {
      AE: { currencyCode: 'AED', defaultVatRate: 5.00 },
      SA: { currencyCode: 'SAR', defaultVatRate: 15.00 },
      EG: { currencyCode: 'EGP', defaultVatRate: 14.00 }
    };
    return configs[countryCode] || configs.AE;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'If email exists, reset link has been sent' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    // In production, save token to database and send email
    return { message: 'Reset token generated', token } as any;
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, { passwordHash: hashedPassword } as any);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findOne(userId);
    if (!user || !await bcrypt.compare(currentPassword, user.passwordHash)) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { passwordHash: hashedPassword } as any);

    return { message: 'Password changed successfully' };
  }

  async logout(token: string, userId: string): Promise<{ message: string }> {
    try {
      const decoded = this.jwtService.decode(token) as any;
      if (decoded?.jti) {
        await this.blacklistedTokenRepository.save({
          tokenJti: decoded.jti,
          userId: userId,
          expiresAt: new Date(decoded.exp * 1000)
        });
      }
    } catch (error) {
      // Token might be invalid, but still return success
    }
    return { message: 'Logged out successfully' };
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const blacklistedToken = await this.blacklistedTokenRepository.findOne({
      where: { tokenJti: jti }
    });
    return !!blacklistedToken;
  }

  async validateUser(payload: { sub: string; email: string; jti?: string }) {
    // Check if token is blacklisted
    if (payload.jti && await this.isTokenBlacklisted(payload.jti)) {
      throw new UnauthorizedException('Token has been revoked');
    }
    try {
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      if (!user.isActive) {
        throw new UnauthorizedException('User account has been deleted');
      }
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}