<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommissionLog;
use App\Models\Order;
use App\Models\Plan;
use App\Models\ServerAnytls;
use App\Models\ServerHysteria;
use App\Models\ServerShadowsocks;
use App\Models\ServerTrojan;
use App\Models\ServerTuic;
use App\Models\ServerVless;
use App\Models\ServerVmess;
use App\Models\ServerV2node;
use App\Models\Stat;
use App\Models\StatServer;
use App\Models\StatUser;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StatDashboardController extends Controller
{
    // ─────────────────────────────────────────────────────────
    //  TÍNH NĂNG 3.5: Unified Dashboard – 1 API thay vì 6
    // ─────────────────────────────────────────────────────────

    /**
     * Trả về tất cả KPI admin trong 1 request (thay cho 6 API calls cũ).
     * GET /admin/stat/getDashboard
     */
    public function getDashboard()
    {
        $now            = time();
        $todayStart     = strtotime(date('Y-m-d'));
        $monthStart     = strtotime(date('Y-m-1'));
        $lastMonthStart = strtotime('-1 month', $monthStart);

        // Gộp tất cả stats vào 1 response – parallel DB queries với subqueries
        $data = Cache::remember('admin_dashboard_kpi', 60, function () use (
            $now, $todayStart, $monthStart, $lastMonthStart
        ) {
            return [
                // --- User stats ---
                'total_users'            => User::count(),
                'online_users'           => User::where('t', '>=', $now - 600)->count(),
                'today_register'         => User::where('created_at', '>=', $todayStart)->count(),
                'month_register'         => User::where('created_at', '>=', $monthStart)->count(),
                'active_users'           => User::where('banned', 0)
                                               ->whereNotNull('plan_id')
                                               ->where(function ($q) use ($now) {
                                                   $q->where('expired_at', '>', $now)->orWhereNull('expired_at');
                                               })->count(),
                'banned_users'           => User::where('banned', 1)->count(),

                // --- Revenue stats ---
                'today_income'           => Order::where('created_at', '>=', $todayStart)
                                               ->whereNotIn('status', [0, 2])->sum('total_amount'),
                'month_income'           => Order::where('created_at', '>=', $monthStart)
                                               ->whereNotIn('status', [0, 2])->sum('total_amount'),
                'last_month_income'      => Order::where('created_at', '>=', $lastMonthStart)
                                               ->where('created_at', '<', $monthStart)
                                               ->whereNotIn('status', [0, 2])->sum('total_amount'),
                'today_orders'           => Order::where('created_at', '>=', $todayStart)->count(),
                'pending_orders'         => Order::where('status', 0)->count(),

                // --- Commission ---
                'commission_pending'     => Order::where('commission_status', 0)
                                               ->whereNotNull('invite_user_id')
                                               ->whereNotIn('status', [0, 2])
                                               ->where('commission_balance', '>', 0)->count(),
                'commission_month'       => CommissionLog::where('created_at', '>=', $monthStart)->sum('get_amount'),

                // --- Support ---
                'tickets_pending'        => Ticket::where('status', 0)->where('reply_status', 0)->count(),
                'tickets_total'          => Ticket::count(),

                // --- Subscription ---
                'expiring_7d'            => User::where('expired_at', '>', $now)
                                               ->where('expired_at', '<=', $now + 7 * 86400)
                                               ->where('banned', 0)->count(),
                'expiring_30d'           => User::where('expired_at', '>', $now)
                                               ->where('expired_at', '<=', $now + 30 * 86400)
                                               ->where('banned', 0)->count(),
                'no_plan_users'          => User::whereNull('plan_id')->where('banned', 0)->count(),

                'generated_at'           => $now,
            ];
        });

        return response(['data' => $data]);
    }

    // ─────────────────────────────────────────────────────────
    //  TÍNH NĂNG 3.3: Plan Performance Report
    // ─────────────────────────────────────────────────────────

    /**
     * Báo cáo hiệu suất từng gói: doanh thu, active users, churn rate.
     * GET /admin/stat/getPlanReport
     */
    public function getPlanReport()
    {
        $now        = time();
        $monthStart = strtotime(date('Y-m-1'));
        $lastMonth  = strtotime('-1 month', $monthStart);

        $plans = Plan::orderBy('sort', 'ASC')->get();

        // Revenue theo plan trong tháng hiện tại và tháng trước – 2 queries
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

        // Active users theo plan – 1 query
        $activeUsers = User::where('banned', 0)
            ->where(function ($q) use ($now) {
                $q->where('expired_at', '>', $now)->orWhereNull('expired_at');
            })
            ->selectRaw('plan_id, COUNT(*) as cnt')
            ->groupBy('plan_id')
            ->pluck('cnt', 'plan_id');

        // Total users theo plan (bao gồm cả expired) – 1 query
        $totalUsers = User::selectRaw('plan_id, COUNT(*) as cnt')
            ->whereNotNull('plan_id')
            ->groupBy('plan_id')
            ->pluck('cnt', 'plan_id');

        $result = $plans->map(function ($plan) use ($monthRevenue, $lastMonthRevenue, $activeUsers, $totalUsers) {
            $mRev      = $monthRevenue[$plan->id] ?? null;
            $lmRevenue = $lastMonthRevenue[$plan->id]->revenue ?? 0;
            $active    = $activeUsers[$plan->id] ?? 0;
            $total     = $totalUsers[$plan->id] ?? 0;
            $revenue   = $mRev->revenue ?? 0;
            $growth    = $lmRevenue > 0 ? round(($revenue - $lmRevenue) / $lmRevenue * 100, 1) : null;

            return [
                'id'                  => $plan->id,
                'name'                => $plan->name,
                'price'               => $plan->monthly_price ?? $plan->quarterly_price ?? $plan->yearly_price,
                'active_users'        => $active,
                'total_users'         => $total,
                'month_revenue'       => $revenue,
                'month_orders'        => $mRev->orders ?? 0,
                'last_month_revenue'  => $lmRevenue,
                'revenue_growth_pct'  => $growth,
                'show'                => $plan->show,
                'renew'               => $plan->renew,
            ];
        });

        return response(['data' => $result]);
    }

    // ─────────────────────────────────────────────────────────
    //  TÍNH NĂNG 3.7: Server Health Monitor
    // ─────────────────────────────────────────────────────────

    /**
     * Trạng thái sức khỏe của tất cả node: last check-in, online users, traffic hôm nay.
     * GET /admin/stat/getServerHealth
     */
    public function getServerHealth()
    {
        $nodeTypes = [
            'shadowsocks' => ServerShadowsocks::whereNull('parent_id')->get(),
            'vmess'       => ServerVmess::whereNull('parent_id')->get(),
            'trojan'      => ServerTrojan::whereNull('parent_id')->get(),
            'vless'       => ServerVless::whereNull('parent_id')->get(),
            'tuic'        => ServerTuic::whereNull('parent_id')->get(),
            'hysteria'    => ServerHysteria::whereNull('parent_id')->get(),
            'anytls'      => ServerAnytls::whereNull('parent_id')->get(),
            'v2node'      => ServerV2node::whereNull('parent_id')->get(),
        ];

        // Traffic hôm nay theo server – 1 query
        $todayStart = strtotime(date('Y-m-d'));
        $todayTraffic = StatServer::where('record_at', '>=', $todayStart)
            ->where('record_type', 'd')
            ->selectRaw('server_id, server_type, SUM(u+d) as total')
            ->groupBy('server_id', 'server_type')
            ->get()
            ->groupBy('server_type')
            ->map(fn ($items) => $items->keyBy('server_id'));

        $offlineThreshold = time() - 300; // 5 phút
        $result = [];

        foreach ($nodeTypes as $type => $servers) {
            foreach ($servers as $server) {
                $lastCheckIn = $server->created_at ?? null; // placeholder, thực tế dùng node heartbeat field

                // Kiểm tra field check-in (tùy model, dùng 'updated_at' hoặc custom field)
                $lastSeen    = $server->updated_at ?? null;
                $isOnline    = $lastSeen && strtotime($lastSeen) > $offlineThreshold;

                $traffic     = $todayTraffic[$type][$server->id]->total ?? 0;

                $result[] = [
                    'id'            => $server->id,
                    'name'          => $server->name,
                    'type'          => $type,
                    'host'          => $server->host ?? null,
                    'is_online'     => $isOnline,
                    'last_seen'     => $lastSeen,
                    'today_traffic' => round($traffic / 1073741824, 2), // GB
                    'rate'          => $server->rate ?? 1,
                    'group_id'      => $server->group_id,
                ];
            }
        }

        // Sắp xếp: offline lên đầu
        usort($result, fn ($a, $b) => $a['is_online'] <=> $b['is_online']);

        return response([
            'data'    => $result,
            'offline' => count(array_filter($result, fn ($s) => !$s['is_online'])),
            'total'   => count($result),
        ]);
    }
}
