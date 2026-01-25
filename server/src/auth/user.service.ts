import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { DATABASE_CONNECTION } from '../db/db-connection';
import * as bcrypt from 'bcrypt';
import { eq, not, or, and, sql, count } from 'drizzle-orm';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UserService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async getUsers() {
    return this.db.query.users.findMany({});
  }

  async createUser({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) {
    const hashedPassword = await this.hashPassword(password);
    const usersCount = await this.db
      .select({ count: count() })
      .from(schema.users);
    let initialCredits = 0;
    let role: 'USER' | 'ADMIN' = 'USER';
    if (usersCount[0].count === 0) {
      initialCredits = 450;
      role = 'ADMIN';
    }
    const user = await this.db
      .insert(schema.users)
      .values({
        name,
        email,
        password: hashedPassword,
        emailConfirmed: new Date(0),
        userRole: role,
        credits: initialCredits,
      })
      .returning({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        avatar: schema.users.avatar,
        role: schema.users.userRole,
        credits: schema.users.credits,
      });
    return user[0];
  }
  async findUserById(id: string) {
    const user = await this.db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        avatar: schema.users.avatar,
        role: schema.users.userRole,
        credits: schema.users.credits,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return user[0];
  }

  async findUserByEmail(email: string) {
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    if (!user || user.length === 0) {
      return null;
    }
    return user[0];
  }

  async updateUserPassword({
    email,
    newPassword,
  }: {
    email: string;
    newPassword: string;
  }) {
    const hashedPassword = await this.hashPassword(newPassword);
    const result = await this.db
      .update(schema.users)
      .set({ password: hashedPassword })
      .where(eq(schema.users.email, email))
      .returning({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        avatar: schema.users.avatar,
        role: schema.users.userRole,
        credits: schema.users.credits,
      });
    return result[0];
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const hashedRefreshToken = await this.hashPassword(refreshToken);
    await this.db
      .update(schema.users)
      .set({ refreshToken: hashedRefreshToken })
      .where(eq(schema.users.id, userId))
      .execute();
  }

  async removeRefreshToken(userId: string) {
    await this.db
      .update(schema.users)
      .set({ refreshToken: null })
      .where(eq(schema.users.id, userId))
      .execute();
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });
    if (!user) return null;

    const isMatch = await this.comparePassword(
      refreshToken,
      user.refreshToken || '',
    );
    return isMatch ? user : null;
  }

  async deductUserCredits(userId: string, creditsToDeduct: number) {
    if (creditsToDeduct <= 0) {
      throw new Error('creditsToDeduct must be greater than zero');
    }
    try {
      const updatedUser = await this.db
        .update(schema.users)
        .set({
          credits: sql`${schema.users.credits} - ${creditsToDeduct}`,
        })
        .where(eq(schema.users.id, userId))
        .returning({
          id: schema.users.id,
          credits: schema.users.credits,
        });

      return updatedUser[0];
    } catch (error) {
      throw new Error(
        `Failed to deduct credits: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async addUserCredits(userId: string, creditsToAdd: number) {
    if (creditsToAdd <= 0) {
      throw new Error('creditsToAdd must be greater than zero');
    }
    const updatedUser = await this.db
      .update(schema.users)
      .set({
        credits: sql`${schema.users.credits} + ${creditsToAdd}`,
      })
      .where(eq(schema.users.id, userId))
      .returning({
        id: schema.users.id,
        credits: schema.users.credits,
      });

    return updatedUser[0];
  }
  // at the first of every month at midnight
  @Cron('0 0 1 * *')
  async resetAdminCreditsMonthly() {
    const updatedUsers = await this.db
      .update(schema.users)
      .set({
        credits: 450,
      })
      .where(
        and(
          eq(schema.users.userRole, 'ADMIN'),
          not(eq(schema.users.credits, 450)),
        ),
      )
      .returning({
        id: schema.users.id,
        credits: schema.users.credits,
      });

    return updatedUsers;
  }

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async comparePassword(candidatePassword: string, hashedPassword: string) {
    const isMatch = await bcrypt.compare(candidatePassword, hashedPassword);
    return isMatch;
  }
}
