<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\ServerService;
use Illuminate\Support\Facades\Cache;
use App\Utils\CacheKey;

class HealthController extends Controller
{
    // Feature 18: Server Health Check
    public function check()
    {
        $serverService = new ServerService();
        $servers = $serverService->getAllServers();
        $result = [];

        foreach ($servers as $server) {
            $isOnline = isset($server['last_check_at']) && (time() - 300) < $server['last_check_at'];
            $result[] = [
                'id' => $server['id'],
                'name' => $server['name'],
                'type' => $server['type'],
                'host' => $server['host'] ?? '',
                'status' => $isOnline ? 'online' : 'offline',
                'last_check_at' => $server['last_check_at'] ?? 0,
                'online_users' => $server['online'] ?? 0,
                'available_status' => $server['available_status'] ?? 0,
            ];
        }

        return response(['data' => $result]);
    }
}
