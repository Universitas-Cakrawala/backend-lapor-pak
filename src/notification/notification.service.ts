import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private isInitialized = false;

  constructor(private configService: ConfigService) {}

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

  async sendStatusChangeNotification(
    fcmToken: string | null,
    reportId: string,
    newStatus: ReportStatus,
    roadName: string,
  ) {
    if (!fcmToken) {
      this.logger.log(
        `No FCM token for report ${reportId}, skipping push notification.`,
      );
      return;
    }

    if (!this.isInitialized) {
      this.logger.warn(
        'Firebase Admin is not initialized. Cannot send push notification.',
      );
      return;
    }

    const payload = {
      notification: {
        title: 'Status Laporan Diperbarui',
        body: `Laporan "${roadName}" kini berstatus ${newStatus}`,
      },
      data: {
        reportId,
        status: newStatus,
      },
      token: fcmToken,
    };

    try {
      const response = await getMessaging().send(payload);
      this.logger.log(`Successfully sent message: ${response}`);
    } catch (error) {
      this.logger.error('Error sending FCM notification:', error);
      // We purposefully DO NOT throw an error here, so that the status update doesn't fail
      // if the push notification fails.
    }
  }
}
