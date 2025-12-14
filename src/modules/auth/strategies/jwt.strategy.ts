import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    companyId: string;
    role: string;
    jti?: string;
  }) {
    console.log('JWT Strategy - Payload:', payload);
    const user = await this.authService.validateUser(payload);
    console.log('JWT Strategy - User found:', !!user);
    if (!user) {
      console.log('JWT Strategy - User validation failed');
      return null;
    }
    const result = {
      id: user.id,
      email: user.email,
      companyId: payload.companyId,
      role: payload.role,
      roles: [payload.role], // Convert single role to array
    };
    console.log('JWT Strategy - Returning user:', result);
    return result;
  }
}
