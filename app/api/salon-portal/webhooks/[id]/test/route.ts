
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get user's salon
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Get webhook
    const webhook = await prisma.salonWebhook.findFirst({
      where: {
        id: id,
        salonId: salon.id
      }
    })

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    // Send test webhook
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        salonId: salon.id,
        salonName: salon.name,
        message: 'This is a test webhook from Beauty GO Salon Portal'
      }
    }

    try {
      const webhookResponse = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': webhook.secret
        },
        body: JSON.stringify(testPayload)
      })

      // Update webhook with test result
      await prisma.salonWebhook.update({
        where: {
          id: webhook.id
        },
        data: {
          lastTriggered: new Date(),
          failureCount: webhookResponse.ok ? 0 : webhook.failureCount + 1
        }
      })

      return NextResponse.json({
        success: webhookResponse.ok,
        status: webhookResponse.status,
        statusText: webhookResponse.statusText
      })
    } catch (error) {
      // Update failure count
      await prisma.salonWebhook.update({
        where: {
          id: webhook.id
        },
        data: {
          failureCount: webhook.failureCount + 1
        }
      })

      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test webhook API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
