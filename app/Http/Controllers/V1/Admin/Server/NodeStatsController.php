<?php

namespace App\Http\Controllers\V1\Admin\Server;

use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\Controller;
use App\Models\Server;

class NodeStatsController extends Controller
{
    /**
     * Fetch all node stats for admin dashboard
     * GET /admin/server/stats/fetch
     */
    public function fetch()
    {
        // Get all server nodes
        $nodes = collect();

        // Collect all server types
        $types = ['trojan', 'vmess', 'shadowsocks', 'hysteria', 'vless'];
        foreach ($types as $type) {
            $model = '\\App\\Models\\Server' . ucfirst($type);
            if (class_exists($model)) {
                $servers = $model::select('id', 'name', 'group_id', 'parent_id')
                    ->where('show', 1)
                    ->get()
                    ->map(function ($s) use ($type) {
                        $stats = Cache::get("node_stats:{$s->id}", null);
                        return [
                            'id' => $s->id,
                            'name' => $s->name,
                            'type' => $type,
                            'group_id' => $s->group_id,
                            'online' => $stats !== null && (time() - ($stats['updated_at'] ?? 0)) < 90,
                            'stats' => $stats,
                        ];
                    });
                $nodes = $nodes->merge($servers);
            }
        }

        // Fallback: also try generic Server model
        if ($nodes->isEmpty()) {
            try {
                $servers = \DB::table('v2_server')
                    ->select('id', 'name', 'group_id')
                    ->get()
                    ->map(function ($s) {
                        $stats = Cache::get("node_stats:{$s->id}", null);
                        return [
                            'id' => $s->id,
                            'name' => $s->name,
                            'type' => 'unknown',
                            'group_id' => $s->group_id ?? '',
                            'online' => $stats !== null && (time() - ($stats['updated_at'] ?? 0)) < 90,
                            'stats' => $stats,
                        ];
                    });
                $nodes = $servers;
            } catch (\Exception $e) {
                // ignore
            }
        }

        return response([
            'data' => $nodes->values()
        ]);
    }
}
