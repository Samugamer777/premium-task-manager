import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/verify
 * Checks if a given email has an active Lemon Squeezy subscription.
 * 
 * In production: Set LEMON_SQUEEZY_API_KEY in Vercel environment variables.
 * Lemon Squeezy API docs: https://docs.lemonsqueezy.com/api
 */

const LEMON_API = 'https://api.lemonsqueezy.com/v1';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ active: false, error: 'Email required' }, { status: 400 });
    }

    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

    // If no API key configured, use trial-only mode (development)
    if (!apiKey) {
      return NextResponse.json({
        active: false,
        trial: true,
        message: 'Lemon Squeezy API key not configured. Running in trial mode.',
      });
    }

    // 1. Find customer by email
    const customersRes = await fetch(
      `${LEMON_API}/customers?filter[email]=${encodeURIComponent(email.toLowerCase().trim())}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/vnd.api+json',
        },
      }
    );

    if (!customersRes.ok) {
      console.error('Lemon Squeezy API error:', customersRes.status);
      return NextResponse.json({ active: false, error: 'API error' }, { status: 500 });
    }

    const customersData = await customersRes.json();
    const customers = customersData.data || [];

    if (customers.length === 0) {
      return NextResponse.json({ active: false, error: 'No account found for this email' });
    }

    // 2. Check subscriptions for this customer
    const customerId = customers[0].id;
    const subsRes = await fetch(
      `${LEMON_API}/subscriptions?filter[customer_id]=${customerId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/vnd.api+json',
        },
      }
    );

    if (!subsRes.ok) {
      return NextResponse.json({ active: false, error: 'Subscription check failed' }, { status: 500 });
    }

    const subsData = await subsRes.json();
    const subscriptions = subsData.data || [];

    // Check if any subscription is active, on_trial, or paused (still has access)
    const activeSub = subscriptions.find((sub: any) => {
      const status = sub.attributes?.status;
      return status === 'active' || status === 'on_trial' || status === 'past_due';
    });

    if (activeSub) {
      const attrs = activeSub.attributes;
      return NextResponse.json({
        active: true,
        plan: attrs.variant_name || 'Pro',
        status: attrs.status,
        renewsAt: attrs.renews_at,
        customerPortal: attrs.urls?.customer_portal || null,
      });
    }

    return NextResponse.json({
      active: false,
      error: 'Subscription expired or cancelled',
      customerPortal: subscriptions[0]?.attributes?.urls?.customer_portal || null,
    });

  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json({ active: false, error: 'Server error' }, { status: 500 });
  }
}
