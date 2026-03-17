<?php

namespace App\Http\Controllers\V1\Client;

use App\Http\Controllers\Controller;
use App\Protocols\General;
use App\Protocols\Singbox\Singbox;
use App\Protocols\ClashMeta;
use App\Services\ServerService;
use App\Services\UserService;
use App\Models\Plan;
use App\Models\Staff;
use App\Utils\Helper;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function subscribe(Request $request)
    {

        $flag = $request->input('flag')
            ?? ($_SERVER['HTTP_USER_AGENT'] ?? '');
        $flag = strtolower($flag);
        $user = $request->user;
        $custom_sni = $request->input('sni');
        if ($custom_sni === null && isset($user['network_settings'])) {
            $custom_sni = $user['network_settings'] ?? null;
        }
        // Plan SNI override — nếu gói có set SNI thì dùng SNI của gói
        if (isset($user['plan_id']) && $user['plan_id']) {
            $userPlan = Plan::find($user['plan_id']);
            if ($userPlan && !empty($userPlan->plan_sni)) {
                $custom_sni = $userPlan->plan_sni;
            }
        }

        $userService = new UserService();
        if ($userService->isAvailable($user)) {
            $serverService = new ServerService();
            $servers = $serverService->getAvailableServers($user);

            if ($flag) {
                if (!strpos($flag, 'sing')) {
                    $this->setSubscribeInfoToServers($servers, $user, $custom_sni);
                    foreach (array_reverse(glob(app_path('Protocols') . '/*.php')) as $file) {
                        $file = 'App\\Protocols\\' . basename($file, '.php');
                        $class = new $file($user, $servers);
                        if (strpos($flag, $class->flag) !== false) {
                            return $class->handle();
                        }
                    }
                }
                if (strpos($flag, 'sing') !== false) {
                    $class = new Singbox($user, $servers);
                    return $class->handle();
                }
            }
            $class = new General($user, $servers);
            return $class->handle();
        } else {
            return $this->handleExpiredUser($request, $flag, $user, $custom_sni);
        }
    }

    private function setSubscribeInfoToServers(&$servers, $user, $custom_sni)
    {
        if ($custom_sni !== null) {
            foreach ($servers as &$server) {
                if ($server['type'] === 'shadowsocks' && isset($server['obfs']) && $server['obfs'] === 'http') {
                    $server['obfs-host'] = $custom_sni;
                }
                if ($server['type'] === 'vmess') {
                    if ($server['tls'] && isset($server['tlsSettings']['serverName'])) {
                        $server['tlsSettings']['serverName'] = $custom_sni;
                    }
                    if ($server['network'] === 'ws' && isset($server['networkSettings']['headers']['Host'])) {
                        $server['networkSettings']['headers']['Host'] = $custom_sni;
                    }
                }
                if ($server['type'] === 'vless') {
                    if ($server['tls'] && isset($server['tls_settings']['server_name'])) {
                        $server['tls_settings']['server_name'] = $custom_sni;
                    }
                    if ($server['network'] === 'ws' && isset($server['network_settings']['headers']['Host'])) {
                        $server['network_settings']['headers']['Host'] = $custom_sni;
                    }
                }
                if ($server['type'] === 'trojan') {
                    if (!empty($server['server_name'])) {
                        $server['server_name'] = $custom_sni;
                    }
                    if ($server['network'] === 'ws' && isset($server['network_settings']['headers']['Host'])) {
                        $server['network_settings']['headers']['Host'] = $custom_sni;
                    }
                }
                if ($server['type'] === 'hysteria') {
                    if (isset($server['server_name'])) {
                        $server['server_name'] = $custom_sni;
                    }
                }
                if ($server['type'] === 'tuic') {
                    if (isset($server['server_name'])) {
                        $server['server_name'] = $custom_sni;
                    }
                }
                if ($server['type'] === 'anytls') {
                    if (isset($server['server_name'])) {
                        $server['server_name'] = $custom_sni;
                    }
                }
            }
        }

        if (!isset($servers[0]))
            return;
        if (!(int) config('v2board.show_info_to_server_enable', 0))
            return;

        // Check per-staff subscribe info config
        $infoConfig = $this->getStaffSubscribeInfoConfig($user);

        $useTraffic = $user['u'] + $user['d'];
        $totalTraffic = $user['transfer_enable'];
        $remainingTraffic = Helper::trafficConvert($totalTraffic - $useTraffic);
        $expiredDate = $user['expired_at'] ? date('d-m-Y H:i:s', $user['expired_at']) : 'Vĩnh Viễn';
        $userService = new UserService();
        $resetDay = $userService->getResetDay($user);
        $userPlanId = $user['plan_id'];
        $v2Plan = Plan::find($userPlanId);
        $UserID = $user['id'];
        $planName = $v2Plan ? $v2Plan->name : 'N/A';
        if ($totalTraffic - $useTraffic <= 0) {
            $dataStatus = 'Đã hết data';
        } else {
            $dataStatus = $remainingTraffic;
        }

        // Build info lines based on config (reverse order since array_unshift)
        if ($infoConfig['show_expiry'] ?? true) {
            array_unshift($servers, array_merge($servers[0], [
                'name' => "Hạn: {$expiredDate}",
            ]));
        }
        if (($infoConfig['show_reset'] ?? true) && $resetDay) {
            array_unshift($servers, array_merge($servers[0], [
                'name' => "Làm mới sau: {$resetDay} Ngày",
            ]));
        }
        if ($infoConfig['show_data'] ?? true) {
            array_unshift($servers, array_merge($servers[0], [
                'name' => "Còn: {$dataStatus}",
            ]));
        }
        if ($infoConfig['show_plan'] ?? true) {
            array_unshift($servers, array_merge($servers[0], [
                'name' => "Gói: {$planName}",
            ]));
        }
        if ($infoConfig['show_user_id'] ?? true) {
            array_unshift($servers, array_merge($servers[0], [
                'name' => "ID: {$UserID}",
            ]));
        }
    }

    private function getStaffSubscribeInfoConfig($user = null)
    {
        $defaults = [
            'show_user_id' => true,
            'show_plan' => true,
            'show_data' => true,
            'show_reset' => true,
            'show_expiry' => true,
        ];

        $staff = null;

        // 1. Try match by domain
        $host = request()->getHost();
        $staff = Staff::where('domain', $host)->where('status', 1)->first();

        // 2. If no domain match, try match by user's invite_user_id (người mời)
        if (!$staff && $user && isset($user['invite_user_id']) && $user['invite_user_id']) {
            $staff = Staff::where('user_id', $user['invite_user_id'])
                ->where('status', 1)
                ->first();
        }

        if ($staff && $staff->subscribe_info_config) {
            // Web con: use staff config
            $config = is_array($staff->subscribe_info_config)
                ? $staff->subscribe_info_config
                : json_decode($staff->subscribe_info_config, true);
            return array_merge($defaults, $config ?? []);
        }

        // Web mẹ (main site): read from system config
        $sysConfig = config('v2board.subscribe_info_config');
        if ($sysConfig) {
            $config = is_array($sysConfig) ? $sysConfig : json_decode($sysConfig, true);
            return array_merge($defaults, $config ?? []);
        }

        return $defaults;
    }
    private function handleExpiredUser($request, $flag, $user, $custom_sni)
    {

        $servers = [
            [
                'id' => 9991,
                'name' => 'User ID: ' . $user['id'],
                'type' => 'vmess',
                'host' => 'expired.example.com',
                'port' => 80,
                'server_port' => 80,
                'tls' => 0,
                'network' => 'ws',
                'networkSettings' => [
                    'path' => '/expired',
                    'headers' => [
                        'Host' => 'expired.example.com',
                    ],
                ],
                'show' => 1,
                'is_online' => 1,
            ],
            [
                'id' => 9992,
                'name' => 'Gói của bạn đã hết hạn',
                'type' => 'vmess',
                'host' => 'expired.example.com',
                'port' => 80,
                'server_port' => 80,
                'tls' => 0,
                'network' => 'ws',
                'networkSettings' => [
                    'path' => '/expired',
                    'headers' => [
                        'Host' => 'expired.example.com',
                    ],
                ],
                'show' => 1,
                'is_online' => 1,
            ],
        ];


        if ($flag) {
            if (!strpos($flag, 'sing')) {
                foreach (array_reverse(glob(app_path('Protocols') . '/*.php')) as $file) {
                    $file = 'App\\Protocols\\' . basename($file, '.php');
                    $class = new $file($user, $servers);
                    if (strpos($flag, $class->flag) !== false) {
                        return $class->handle();
                    }
                }
            }
            if (strpos($flag, 'sing') !== false) {
                $class = new Singbox($user, $servers);
                return $class->handle();
            }
        }
        $class = new General($user, $servers);
        return $class->handle();
    }

}
