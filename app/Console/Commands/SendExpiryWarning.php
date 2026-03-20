<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\TelegramService;
use Illuminate\Console\Command;

class SendExpiryWarning extends Command
{
    protected $signature = 'user:expiry-warning';
    protected $description = 'Send warning notification to users whose plans expire within 3 days';

    public function handle()
    {
        $warningTime = time() + (3 * 86400); // 3 ngày tới
        $users = User::where('expired_at', '>', time())
            ->where('expired_at', '<=', $warningTime)
            ->where('banned', 0)
            ->get();

        $count = 0;
        foreach ($users as $user) {
            $daysLeft = ceil(($user->expired_at - time()) / 86400);
            
            // Send Telegram notification if user has telegram_id
            if ($user->telegram_id) {
                try {
                    $message = "⚠️ Cảnh báo: Gói của bạn sẽ hết hạn sau {$daysLeft} ngày.\n";
                    $message .= "Vui lòng gia hạn để tiếp tục sử dụng dịch vụ.";
                    
                    $telegramService = new TelegramService();
                    $telegramService->sendMessage($user->telegram_id, $message);
                    $count++;
                } catch (\Exception $e) {
                    // Skip if Telegram fails
                }
            }
        }

        $this->info("Đã gửi cảnh báo cho {$count}/{$users->count()} users sắp hết hạn.");
    }
}
