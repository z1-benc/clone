<?php

namespace App\Http\Controllers\V1\User;

use App\Http\Controllers\Controller;
use App\Models\StatUser;
use App\Models\LoginLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatController extends Controller
{
    public function getTrafficLog(Request $request)
    {
        $userId = $request->user['id'];
    
        $data = StatUser::where('user_id', $userId)
            ->where('record_at', '>=', strtotime(date('Y-m-1')))
            ->orderBy('record_at', 'DESC')
            ->selectRaw('
                CAST(u * server_rate AS UNSIGNED)   AS u,
                CAST(d * server_rate AS UNSIGNED)   AS d,
                record_at,
                user_id,
                1                                   AS server_rate
            ')
            ->get();
    
        return response(['data' => $data]);
    }

    // Feature 10: Login History
    public function getLoginLog(Request $request)
    {
        $userId = $request->user['id'];
        $logs = LoginLog::where('user_id', $userId)
            ->orderBy('login_at', 'DESC')
            ->limit(50)
            ->get();
        return response(['data' => $logs]);
    }

    // Feature 11: Announcement Read Status
    public function markNoticeRead(Request $request)
    {
        $request->validate(['notice_id' => 'required|integer']);
        $userId = $request->user['id'];
        $noticeId = $request->input('notice_id');

        // Store read status in cache (user:notice_read:{userId})
        $key = "user:notice_read:{$userId}";
        $readList = json_decode(\Illuminate\Support\Facades\Cache::get($key, '[]'), true);
        if (!in_array($noticeId, $readList)) {
            $readList[] = $noticeId;
            \Illuminate\Support\Facades\Cache::put($key, json_encode($readList), 86400 * 30);
        }
        return response(['data' => true]);
    }

    public function getNoticeReadStatus(Request $request)
    {
        $userId = $request->user['id'];
        $key = "user:notice_read:{$userId}";
        $readList = json_decode(\Illuminate\Support\Facades\Cache::get($key, '[]'), true);
        return response(['data' => $readList]);
    }

    // Feature 12: Subscription Pause/Resume
    public function toggleSubscription(Request $request)
    {
        $userId = $request->user['id'];
        $user = User::find($userId);
        if (!$user) abort(500, 'User không tồn tại');

        // Toggle: 0 = active, 1 = paused
        $isPaused = $user->banned == 2; // Use banned=2 as "paused" state
        if ($isPaused) {
            $user->banned = 0;
            $message = 'Đã kích hoạt lại gói đăng ký';
        } else {
            $user->banned = 2;
            $message = 'Đã tạm dừng gói đăng ký';
        }
        $user->save();

        return response([
            'data' => [
                'paused' => !$isPaused,
                'message' => $message
            ]
        ]);
    }

}
