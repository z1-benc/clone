<?php

namespace App\Http\Controllers\V1\Server;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\Controller;

class NodeStatsController extends Controller
{
    /**
     * Receive system stats from v2node
     * POST /api/v2/server/stats?node_id=X&token=Y
     */
    public function report(Request $request)
    {
        $nodeId = $request->input('node_id');
        if (!$nodeId) {
            return response()->json(['error' => 'node_id required'], 400);
        }

        $stats = [
            'cpu_percent'  => round((float) $request->input('cpu_percent', 0), 1),
            'mem_total'    => (int) $request->input('mem_total', 0),
            'mem_used'     => (int) $request->input('mem_used', 0),
            'mem_percent'  => round((float) $request->input('mem_percent', 0), 1),
            'net_in_speed' => (int) $request->input('net_in_speed', 0),
            'net_out_speed'=> (int) $request->input('net_out_speed', 0),
            'uptime'       => (int) $request->input('uptime', 0),
            'cpu_cores'    => (int) $request->input('cpu_cores', 0),
            'hostname'     => (string) $request->input('hostname', ''),
            'updated_at'   => time(),
        ];

        // Cache for 120 seconds (stats should be refreshed every 30s, 120s gives buffer)
        Cache::put("node_stats:{$nodeId}", $stats, 120);

        return response()->json(['data' => true]);
    }
}
