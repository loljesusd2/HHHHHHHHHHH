
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Return default settings (in a real app, these would be stored in database)
    const settings = {
      general: {
        appName: 'Beauty GO',
        appDescription: 'La plataforma líder para servicios de belleza profesionales',
        appVersion: '1.0.0',
        maintenanceMode: false,
        registrationEnabled: true,
        verificationRequired: true,
        defaultLanguage: 'es',
        supportEmail: 'support@beautygo.com',
        supportPhone: '+1-800-BEAUTY-GO'
      },
      payment: {
        platformCommission: 0.20,
        minimumBookingAmount: 10.00,
        maximumBookingAmount: 500.00,
        processingFee: 0.03,
        refundPolicy: 'Los reembolsos se procesan dentro de 5-7 días hábiles.',
        paymentMethods: ['CASH'],
        autoPayoutEnabled: true,
        payoutSchedule: 'weekly'
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        adminNotifications: true,
        userWelcomeEmail: true,
        bookingConfirmations: true,
        reviewReminders: true,
        maintenanceNotifications: true
      },
      security: {
        sessionTimeout: 60,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requireStrongPassword: true,
        twoFactorEnabled: false,
        ipWhitelist: [],
        auditLogging: true,
        dataEncryption: true
      },
      integrations: {
        analyticsEnabled: true,
        analyticsProvider: 'google',
        analyticsKey: '',
        socialLoginEnabled: false,
        socialProviders: [],
        webhookUrl: '',
        webhookSecret: '',
        apiRateLimit: 100
      },
      backup: {
        autoBackupEnabled: true,
        backupFrequency: 'daily',
        backupRetention: 30,
        backupLocation: 'cloud-storage',
        lastBackupDate: new Date().toISOString(),
        backupSize: '2.5 GB'
      }
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const settings = await request.json()
    
    // In a real app, you would save these settings to database
    // For now, we'll just log the action
    await prisma.adminLog.create({
      data: {
        adminId: (session.user as any).id,
        action: 'settings_update',
        entityType: 'settings',
        entityId: 'app_settings',
        details: {
          updatedAt: new Date().toISOString(),
          changedSections: Object.keys(settings)
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
