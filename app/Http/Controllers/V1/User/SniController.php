<?php

namespace App\Http\Controllers\V1\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class SniController extends Controller
{
    public function fetchSni(Request $request)
    {
        // Read SNI list from admin config (v2board.sni_list)
        // Format: each line = "name|value" or just "value"
        $sniListRaw = config('v2board.sni_list', '');
        $sniData = [];
        
        if (!empty($sniListRaw)) {
            $lines = array_filter(array_map('trim', explode("\n", $sniListRaw)));
            $id = 1;
            foreach ($lines as $line) {
                if (strpos($line, '|') !== false) {
                    [$name, $value] = explode('|', $line, 2);
                } else {
                    $name = $line;
                    $value = $line;
                }
                $sniData[] = [
                    'id' => $id++,
                    'name_sni' => trim($name),
                    'network_settings' => trim($value),
                ];
            }
        }

        $user = User::find($request->user['id']);
        
        return response([
            'data' => $sniData,
            'total' => count($sniData),
            'current_sni' => $user ? $user->name_sni : null,
        ]);
    }

    public function changeSNI(Request $request)
    {
        $dname_sni = $request->input('name_sni');
        $network_settings = $request->input('network_settings');

        $user = User::find($request->user['id']);
        if (!$user) {
            abort(500, __('The user does not exist'));
        }

        $user->name_sni = $dname_sni;
        $user->network_settings = $network_settings;
        if (!$user->save()) {
            abort(500, __('Update failed'));
        }

        return response([
            'data' => true,
            'message' => 'Cập nhật SNI thành công'
        ]);
    }
}