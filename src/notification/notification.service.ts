import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { ReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private isInitialized = false;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async createNotification(
    userId: string,
    title: string,
    body: string,
    reportId?: string,
  ) {
    // Save to database
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        body,
        reportId,
      },
    });

    // Attempt push notification if user has FCM token
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.fcmToken) {
      await this.sendPushNotification(user.fcmToken, title, body, reportId);
    }

    return notification;
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  onModuleInit() {
    try {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const clientEmail = this.configService.get<string>(
        'FIREBASE_CLIENT_EMAIL',
      );
      const privateKey = this.configService
        .get<string>('FIREBASE_PRIVATE_KEY')
        ?.replace(/\\n/g, '\n');

      if (!projectId || !clientEmail || !privateKey) {
        this.logger.warn(
          'Firebase config missing. FCM notifications will be skipped.',
        );
        return;
      }

      if (!getApps().length) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }
      this.isInitialized = true;
      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  async sendPushNotification(
    fcmToken: string,
    title: string,
    body: string,
    reportId?: string,
  ) {
    if (!this.isInitialized) {
      this.logger.warn(
        'Firebase Admin is not initialized. Cannot send push notification.',
      );
      return;
    }

    const payload: any = {
      notification: { title, body },
      token: fcmToken,
    };

    if (reportId) {
      payload.data = { reportId };
    }

    try {
      const response = await getMessaging().send(payload);
      this.logger.log(`Successfully sent message: ${response}`);
    } catch (error) {
      this.logger.error('Error sending FCM notification:', error);
    }
  }

  async sendStatusChangeNotification(
    fcmToken: string | null,
    reportId: string,
    newStatus: ReportStatus,
    roadName: string,
    userId?: string, // Added userId to save in DB
  ) {
    const title = 'Status Laporan Diperbarui';
    const body = `Laporan "${roadName}" kini berstatus ${newStatus}`;

    if (userId) {
      await this.createNotification(userId, title, body, reportId);
    } else if (fcmToken) {
      // Fallback if userId is not provided but token is
      await this.sendPushNotification(fcmToken, title, body, reportId);
    }
  }
}
