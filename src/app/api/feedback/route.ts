import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendManagerWhatsAppAlert, IssueType, UrgencyLevel } from '@/lib/whatsapp';

interface FeedbackRequestBody {
  rating: number; // 1 to 5
  category?: IssueType;
  comment?: string;
  tableNumber: string | number;
  venueName?: string;
  sessionId?: string;
  guestContact?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: FeedbackRequestBody = await req.json();
    const {
      rating,
      category = 'other',
      comment = '',
      tableNumber,
      venueName = 'Signature Venue',
      sessionId,
      guestContact = '',
    } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'A valid rating between 1 and 5 is required.' },
        { status: 400 }
      );
    }

    if (!tableNumber && tableNumber !== 0) {
      return NextResponse.json(
        { error: 'Table number is required.' },
        { status: 400 }
      );
    }

    // 1. Fetch Venue Settings to retrieve Google Review URL
    let googleReviewUrl = 'https://maps.google.com';
    let businessName = venueName;

    try {
      const settings = await prisma.businessSettings.findFirst();
      if (settings?.googleReviewUrl) {
        googleReviewUrl = settings.googleReviewUrl;
      }
      if (settings?.cafeName) {
        businessName = settings.cafeName;
      }
    } catch (dbErr) {
      console.warn('[Feedback API] Could not load businessSettings from database:', dbErr);
    }

    // 2. High Rating Flow (4 or 5 stars) -> Route directly to Google Reviews
    if (rating >= 4) {
      return NextResponse.json({
        success: true,
        route: 'google_review',
        googleReviewUrl,
        rating,
        message: 'Thank you for your high praise! Redirecting to Google Reviews.',
      });
    }

    // 3. Low Rating Flow (1, 2, or 3 stars) -> Reputation Protection & Floor Alert
    const urgencyMap: Record<number, UrgencyLevel> = {
      1: 'critical',
      2: 'high',
      3: 'medium',
    };
    const urgency: UrgencyLevel = urgencyMap[rating] || 'medium';

    const fullComplaintSummary =
      `[${rating}-Star Guest Feedback]\n` +
      `Category: ${category}\n` +
      `Details: ${comment || 'No specific text comment provided.'}` +
      (guestContact ? `\nGuest Follow-up Contact: ${guestContact}` : '');

    // Asynchronously dispatch WhatsApp alert to floor/shift manager
    sendManagerWhatsAppAlert({
      venueName: businessName,
      tableNumber,
      issueType: category,
      details: fullComplaintSummary,
      urgency,
    }).catch((err) => {
      console.error('[Feedback API] WhatsApp alert dispatch error:', err);
    });

    // Optionally record service call / internal notification in database
    if (sessionId) {
      try {
        await prisma.serviceCall.create({
          data: {
            sessionId,
            tableNumber: String(tableNumber),
            type: 'complaint_alert',
            status: 'PENDING',
            notes: fullComplaintSummary,
          },
        });
      } catch (serviceCallErr) {
        console.warn('[Feedback API] Could not write to ServiceCall:', serviceCallErr);
      }
    }

    return NextResponse.json({
      success: true,
      route: 'internal_escalation',
      alertDispatched: true,
      rating,
      message:
        'Your feedback has been received. Our floor manager has been alerted to review and resolve this immediately.',
    });
  } catch (error: any) {
    console.error('[Feedback API Error]:', error);
    return NextResponse.json(
      {
        error: 'Failed to process guest feedback.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

