<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommissionLog;
use App\Models\Order;
use App\Models\Plan;
use App\Models\Stat;
use App\Models\StatServer;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StatDashboardController extends Controller
{
    /**
     * Unified Dashboard API - trả về tất cả KPI trong 1 request.
     * GET /admin/stat/getDashboard
     * Cache 60 giây để giảm tải DB.
     */
    public function getDashboard()
    {
        $now            = time();
        $todayStart     = strtotime(date('Y-m-d'));
        $monthStart     = strtotime(date('Y-m-1'));
        $lastMonthStart = strtotime('-1 month', $monthStart);

        $data = Cache::remember('admin_dashboard_kpi', 60, function () use (
            $now, $todayStart, $monthStart, $lastMonthStart
        ) {
            return [
                // --- Người dùng ---
                'total_users'       => User::count(),
                'online_users'      => User::where('t', '>=', $now - 600)->count(),
                'today_register'    => User::where('created_at', '>=', $todayStart)->count(),
                'month_register'    => User::where('created_at', '>=', $monthStart)->count(),
                'banned_users'      => User::where('banned', 1)->count(),
                'active_users'      => User::where('banned', 0)
                    ->whereNotNull('plan_id')
                    ->where(function ($q) use ($now) {
                        $q->where('expired_at', '>', $now)->orWhereNull('expired_at');
                    })->count(),

                // --- Doanh thu ---
                'today_income'      => Order::where('created_at', '>=', $todayStart)
                    ->whereNotIn('status', [0, 2])->sum('total_amount'),
                'month_income'      => Order::where('created_at', '>=', $monthStart)
                    ->whereNotIn('status', [0, 2])->sum('total_amount'),
                'last_month_income' => Order::where('created_at', '>=', $lastMonthStart)
                    ->where('created_at', '<', $monthStart)
                    ->whereNotIn('status', [0, 2])->sum('total_amount'),
                'today_orders'      => Order::where('created_at', '>=', $todayStart)->count(),
                'pending_orders'    => Order::where('status', 0)->count(),

                // --- Hoa hồng ---
                'commission_pending' => Order::where('commission_status', 0)
                    ->where('invite_user_id', '!=', null)
                    ->whereNotIn('status', [0, 2])
                    ->where('commission_balance', '>', 0)->count(),
                'commission_month'   => CommissionLog::where('created_at', '>=', $monthStart)
                    ->where('created_at', '<', $now)->sum('get_amount'),

                // --- Phiếu hỗ trợ ---
                'tickets_pending'   => Ticket::where('status', 0)->where('reply_status', 0)->count(),
                'tickets_total'     => Ticket::count(),

                // --- Gói sắp hết hạn ---
                'expiring_7d'       => User::where('banned', 0)
                    ->where('expired_at', '>', $now)
                    ->where('expired_at', '<=', $now + 7 * 86400)->count(),
                'expiring_30d'      => User::where('banned', 0)
                    ->where('expired_at', '>', $now)
                    ->where('expired_at', '<=', $now + 30 * 86400)->count(),
                'no_plan_users'     => User::whereNull('plan_id')->where('banned', 0)->count(),

                'generated_at'      => $now,
            ];
        });

        return response(['data' => $data]);
    }

    /**
     * Báo cáo hiệu suất từng gói dịch vụ.
     * GET /admin/stat/getPlanReport
     */
    public function getPlanReport()
    {
        $now        = time();
        $monthStart = strtotime(date('Y-m-1'));
        $lastMonth  = strtotime('-1 month', $monthStart);

        $plans = Plan::orderBy('sort', 'ASC')->get();

        // 2 queries thay vì N+1
        $monthRevenue = Order::whereNotIn('status', [0, 2])
            ->where('created_at', '>=', $monthStart)
            ->selectRaw('plan_id, SUM(total_amount) as revenue, COUNT(*) as orders')
            ->groupBy('plan_id')
            ->get()->keyBy('plan_id');

        $lastMonthRevenue = Order::whereNotIn('status', [0, 2])
            ->where('created_at', '>=', $lastMonth)
            ->where('created_at', '<', $monthStart)
            ->selectRaw('plan_id, SUM(total_amount) as revenue')
            ->groupBy('plan_id')
            ->get()->keyBy('plan_id');

        $activeUsers = User::where('banned', 0)
            ->where(function ($q) use ($now) {
                $q->where('expired_at', '>', $now)->orWhereNull('expired_at');
            })
            ->selectRaw('plan_id, COUNT(*) as cnt')
            ->groupBy('plan_id')
            ->pluck('cnt', 'plan_id');

        $totalUsers = User::whereNotNull('plan_id')
            ->selectRaw('plan_id, COUNT(*) as cnt')
            ->groupBy('plan_id')
            ->pluck('cnt', 'plan_id');

        $result = $plans->map(function ($plan) use ($monthRevenue, $lastMonthRevenue, $activeUsers, $totalUsers) {
            $mRev      = $monthRevenue[$plan->id] ?? null;
            $lmRev     = $lastMonthRevenue[$plan->id]->revenue ?? 0;
            $revenue   = $mRev->revenue ?? 0;
            $growth    = $lmRev > 0 ? round(($revenue - $lmRev) / $lmRev * 100, 1) : null;

            return [
                'id'                 => $plan->id,
                'name'               => $plan->name,
                'price'              => $plan->monthly_price ?? $plan->quarterly_price ?? $plan->yearly_price,
                'active_users'       => $activeUsers[$plan->id] ?? 0,
                'total_users'        => $totalUsers[$plan->id] ?? 0,
                'month_revenue'      => $revenue,
                'month_orders'       => $mRev->orders ?? 0,
                'last_month_revenue' => $lmRev,
                'revenue_growth_pct' => $growth,
                'show'               => $plan->show,
                'renew'              => $plan->renew,
            ];
        });

        return response(['data' => $result]);
    }

    /**
     * Thống kê lưu lượng theo server (từ bảng stat_server sẵn có).
     * GET /admin/stat/getServerTraffic
     */
    public function getServerTraffic()
    {
        $todayStart = strtotime(date('Y-m-d'));
        $monthStart = strtotime(date('Y-m-1'));

        // Lưu lượng hôm nay theo server
        $todayTraffic = StatServer::where('record_at', '>=', $todayStart)
            ->where('record_type', 'd')
            ->selectRaw('server_id, server_type, SUM(u + d) as total_bytes')
            ->groupBy('server_id', 'server_type')
            ->get();

        // Lưu lượng tháng này theo server
        $monthTraffic = StatServer::where('record_at', '>=', $monthStart)
            ->where('record_type', 'd')
            ->selectRaw('server_id, server_type, SUM(u + d) as total_bytes')
            ->groupBy('server_id', 'server_type')
            ->get();

        $monthly = $monthTraffic->keyBy(fn($r) => $r->server_type . '_' . $r->server_id);

        $result = $todayTraffic->map(function ($row) use ($monthly) {
            $key = $row->server_type . '_' . $row->server_id;
            return [
                'server_id'        => $row->server_id,
                'server_type'      => $row->server_type,
                'today_traffic_gb' => round($row->total_bytes / 1073741824, 3),
                'month_traffic_gb' => round(($monthly[$key]->total_bytes ?? 0) / 1073741824, 3),
            ];
        })->sortByDesc('today_traffic_gb')->values();

        return response(['data' => $result]);
    }
}
