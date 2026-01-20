import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { DATABASE_CONNECTION } from '../db/db-connection';
import * as crypto from 'crypto';
import { eq, not, or, and } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createVerificationCode(email: string) {
    const code = this.generateVerificationCode();
    // remove any existing codes for this email
    await this.deleteCodeByEmail(email);
    // insert the new code
    const result = await this.db
      .insert(schema.verificationCodes)
      .values({
        code,
        email,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      })
      .returning();
    return result[0].code;
  }

  async findCodeByEmailAndCode(email: string, code: string) {
    const record = await this.db
      .select()
      .from(schema.verificationCodes)
      .where(
        and(
          eq(schema.verificationCodes.email, email),
          eq(schema.verificationCodes.code, code),
        ),
      )
      .limit(1);
    return record[0];
  }

  async deleteCodeByEmail(email: string) {
    const record = await this.db
      .delete(schema.verificationCodes)
      .where(eq(schema.verificationCodes.email, email))
      .returning();

    return record[0];
  }

  async verifyPasswordResetToken(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: this.configService.get('JWT_PASSWORD_SECRET'),
    });

    if (!payload || !payload.email) {
      throw new BadRequestException('Invalid password reset token');
    }

    const record = await this.validatePasswordResetToken(payload.email);
    if (!record || record.token !== token) {
      throw new BadRequestException('Invalid password reset token');
    }
    return payload.email;
  }

  async createPasswordResetToken(email: string) {
    const token = this.generatePasswordResetToken(email);
    // remove any existing tokens for this email
    await this.deletePasswordResetTokenByEmail(email);
    // insert the new token
    const result = await this.db
      .insert(schema.passwordResetTokens)
      .values({
        token,
        email,
        expiresAt: new Date(
          Date.now() + 60 * 60 * 1000, // 1 hour from now
        ),
      })
      .returning();
    return result[0].token;
  }

  async validatePasswordResetToken(email: string) {
    const record = await this.db
      .select()
      .from(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.email, email))
      .limit(1);
    if (!record[0]) {
      return null;
    }
    if (record[0].expiresAt < new Date()) {
      await this.deletePasswordResetTokenByEmail(record[0].email);
      return null;
    }
    return record[0];
  }

  async deletePasswordResetTokenByEmail(email: string) {
    const record = await this.db
      .delete(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.email, email))
      .returning();

    return record[0];
  }

  private generatePasswordResetToken(email: string) {
    const token = this.jwtService.sign(
      { email },
      {
        secret: this.configService.get('JWT_PASSWORD_SECRET'),
        expiresIn: this.configService.get('JWT_PASSWORD_EXPIRATION_TIME'),
      },
    );
    return token;
  }

  async deleteCodeById(id: string) {
    await this.db
      .delete(schema.verificationCodes)
      .where(eq(schema.verificationCodes.id, id));
  }

  private generateVerificationCode() {
    const token = crypto.randomInt(100000, 999999).toString();
    return token;
  }
}
