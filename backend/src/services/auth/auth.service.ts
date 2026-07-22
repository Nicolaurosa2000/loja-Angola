import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { appConfig } from "../../config/app";
import { UserRepository } from "../../repositories/user.repository";
import { JwtPayload, TokenPair } from "../../interfaces";
import { AppError } from "../../middlewares";
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
} from "../../dto/auth.dto";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(input: RegisterInput) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(
      input.password,
      appConfig.bcrypt.saltRounds,
    );

    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      phone: input.phone,
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      tokens,
    };
  }

  async login(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError(
        "Email ou senha incorretos. Verifique as suas credenciais.",
        401,
      );
    }

    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) {
      throw new AppError(
        "Email ou senha incorretos. Verifique as suas credenciais.",
        401,
      );
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        appConfig.jwt.refreshSecret,
      ) as JwtPayload;
      const user = await this.userRepository.findById(decoded.sub);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const updated = await this.userRepository.update(userId, {
      name: input.name ?? undefined,
      phone: input.phone ?? undefined,
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      avatar: updated.avatar,
      role: updated.role,
      createdAt: updated.createdAt,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      appConfig.bcrypt.saltRounds,
    );
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  private generateTokens(
    userId: string,
    email: string,
    role: string,
  ): TokenPair {
    const payload: Omit<JwtPayload, "iat" | "exp"> = {
      sub: userId,
      email,
      role,
    };

    const accessToken = jwt.sign(payload as object, appConfig.jwt.secret, {
      expiresIn: appConfig.jwt.expiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      payload as object,
      appConfig.jwt.refreshSecret,
      { expiresIn: appConfig.jwt.refreshExpiresIn } as jwt.SignOptions,
    );

    return { accessToken, refreshToken };
  }
}
