import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/identity/analytics
 * Statistiche verifica identità per admin dashboard
 * Solo ADMIN
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    // Get all verifications for analysis
    const verifications = await prisma.identityVerification.findMany({
      select: {
        id: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
        rejectionReason: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Overall stats
    const totalVerifications = verifications.length;
    const pendingCount = verifications.filter(v => v.status === 'PENDING').length;
    const approvedCount = verifications.filter(v => v.status === 'APPROVED').length;
    const rejectedCount = verifications.filter(v => v.status === 'REJECTED').length;
    const expiredCount = verifications.filter(v => v.status === 'EXPIRED').length;

    const approvalRate = totalVerifications > 0 
      ? Math.round((approvedCount / (approvedCount + rejectedCount)) * 100) || 0
      : 0;

    // Average review time (in hours)
    const reviewedVerifications = verifications.filter(v => v.reviewedAt && v.createdAt);
    const avgReviewTimeMs = reviewedVerifications.length > 0
      ? reviewedVerifications.reduce((sum, v) => {
          return sum + (new Date(v.reviewedAt!).getTime() - new Date(v.createdAt).getTime());
        }, 0) / reviewedVerifications.length
      : 0;
    const avgReviewTimeHours = Math.round(avgReviewTimeMs / (1000 * 60 * 60) * 10) / 10;

    // Monthly stats (last 6 months)
    const now = new Date();
    const monthlyStats = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthVerifications = verifications.filter(v => {
        const createdDate = new Date(v.createdAt);
        return createdDate >= monthDate && createdDate < nextMonthDate;
      });

      const monthApproved = monthVerifications.filter(v => v.status === 'APPROVED').length;
      const monthRejected = monthVerifications.filter(v => v.status === 'REJECTED').length;
      const monthTotal = monthApproved + monthRejected;
      const monthApprovalRate = monthTotal > 0 ? Math.round((monthApproved / monthTotal) * 100) : 0;

      monthlyStats.push({
        month: monthDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
        total: monthVerifications.length,
        approved: monthApproved,
        rejected: monthRejected,
        approvalRate: monthApprovalRate,
      });
    }

    // Top rejection reasons
    const rejectionReasons = verifications
      .filter(v => v.status === 'REJECTED' && v.rejectionReason)
      .map(v => v.rejectionReason!);

    const reasonCounts: Record<string, number> = {};
    rejectionReasons.forEach(reason => {
      // Normalize reason to group similar ones
      const normalized = reason.toLowerCase().trim();
      reasonCounts[normalized] = (reasonCounts[normalized] || 0) + 1;
    });

    const topRejectionReasons = Object.entries(reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: Math.round((count / rejectionReasons.length) * 100),
      }));

    // Daily stats (last 7 days)
    const dailyStats = [];
    
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(now);
      dayDate.setDate(dayDate.getDate() - i);
      dayDate.setHours(0, 0, 0, 0);
      
      const nextDayDate = new Date(dayDate);
      nextDayDate.setDate(nextDayDate.getDate() + 1);
      
      const dayVerifications = verifications.filter(v => {
        const createdDate = new Date(v.createdAt);
        return createdDate >= dayDate && createdDate < nextDayDate;
      });

      dailyStats.push({
        date: dayDate.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }),
        pending: dayVerifications.filter(v => v.status === 'PENDING').length,
        approved: dayVerifications.filter(v => v.status === 'APPROVED').length,
        rejected: dayVerifications.filter(v => v.status === 'REJECTED').length,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        overall: {
          total: totalVerifications,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          expired: expiredCount,
          approvalRate,
          avgReviewTimeHours,
        },
        monthly: monthlyStats,
        daily: dailyStats,
        topRejectionReasons,
      },
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Errore durante il recupero delle statistiche' },
      { status: 500 }
    );
  }
}
