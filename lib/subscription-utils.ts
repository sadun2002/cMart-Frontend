import { AuthUser } from './auth-store';

export interface SubscriptionStatusInfo {
  isExpired: boolean;
  isTrial: boolean;
  isActive: boolean;
  isSuspended: boolean;
  status: string; // 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED' | 'NO_SUBSCRIPTION'
  plan: string;
  daysLeft: number | null;
  hoursLeft: number | null;
  endDate: Date | null;
  formattedEndDate: string | null;
}

export function getSubscriptionStatus(user: AuthUser | null): SubscriptionStatusInfo {
  if (!user?.tenant) {
    return {
      isExpired: false,
      isTrial: false,
      isActive: false,
      isSuspended: false,
      status: 'NO_SUBSCRIPTION',
      plan: 'STARTUP',
      daysLeft: null,
      hoursLeft: null,
      endDate: null,
      formattedEndDate: null,
    };
  }

  const tenant = user.tenant;
  const sub = tenant.subscription;
  const plan = tenant.plan || sub?.plan || 'STARTUP';

  if (tenant.suspended) {
    return {
      isExpired: true,
      isTrial: false,
      isActive: false,
      isSuspended: true,
      status: 'SUSPENDED',
      plan,
      daysLeft: 0,
      hoursLeft: 0,
      endDate: null,
      formattedEndDate: null,
    };
  }

  if (!sub) {
    return {
      isExpired: false,
      isTrial: false,
      isActive: true,
      isSuspended: false,
      status: 'ACTIVE',
      plan,
      daysLeft: null,
      hoursLeft: null,
      endDate: null,
      formattedEndDate: null,
    };
  }

  const now = Date.now();

  // If explicitly expired or cancelled
  if (sub.status === 'EXPIRED' || sub.status === 'CANCELLED') {
    const rawDate = sub.endDate || sub.nextBillingDate || sub.trialEndDate;
    const d = rawDate ? new Date(rawDate) : null;
    return {
      isExpired: true,
      isTrial: false,
      isActive: false,
      isSuspended: false,
      status: sub.status,
      plan,
      daysLeft: 0,
      hoursLeft: 0,
      endDate: d,
      formattedEndDate: d ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null,
    };
  }

  // If Trial
  if (sub.status === 'TRIAL') {
    const rawEnd = sub.trialEndDate;
    if (rawEnd) {
      const endMs = new Date(rawEnd).getTime();
      const diffMs = endMs - now;
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.ceil(diffMs / (1000 * 60 * 60));
      const d = new Date(rawEnd);
      const isExpired = diffMs <= 0;

      return {
        isExpired,
        isTrial: true,
        isActive: !isExpired,
        isSuspended: false,
        status: isExpired ? 'EXPIRED' : 'TRIAL',
        plan,
        daysLeft: Math.max(0, daysLeft),
        hoursLeft: Math.max(0, hoursLeft),
        endDate: d,
        formattedEndDate: d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      };
    }
  }

  // If Active
  if (sub.status === 'ACTIVE') {
    const rawEnd = sub.endDate || sub.nextBillingDate;
    if (rawEnd) {
      const endMs = new Date(rawEnd).getTime();
      const diffMs = endMs - now;
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.ceil(diffMs / (1000 * 60 * 60));
      const d = new Date(rawEnd);
      const isExpired = diffMs <= 0;

      return {
        isExpired,
        isTrial: false,
        isActive: !isExpired,
        isSuspended: false,
        status: isExpired ? 'EXPIRED' : 'ACTIVE',
        plan,
        daysLeft: Math.max(0, daysLeft),
        hoursLeft: Math.max(0, hoursLeft),
        endDate: d,
        formattedEndDate: d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      };
    }

    // Active without end date (perpetual or renewed)
    return {
      isExpired: false,
      isTrial: false,
      isActive: true,
      isSuspended: false,
      status: 'ACTIVE',
      plan,
      daysLeft: null,
      hoursLeft: null,
      endDate: null,
      formattedEndDate: null,
    };
  }

  return {
    isExpired: false,
    isTrial: false,
    isActive: true,
    isSuspended: false,
    status: sub.status,
    plan,
    daysLeft: null,
    hoursLeft: null,
    endDate: null,
    formattedEndDate: null,
  };
}
