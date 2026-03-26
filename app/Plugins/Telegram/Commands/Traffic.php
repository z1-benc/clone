<?php

namespace App\Plugins\Telegram\Commands;

use App\Models\User;
use App\Plugins\Telegram\Telegram;
use App\Utils\Helper;

class Traffic extends Telegram {
    public $command = '/traffic';
    public $description = 'Tra cứu thông tin lưu lượng';

    public function handle($message, $match = []) {
        $telegramService = $this->telegramService;
        if (!$message->is_private) return;
        $user = User::where('telegram_id', $message->chat_id)->first();
        if (!$user) {
            $telegramService->sendMessage($message->chat_id, 'Không tìm thấy thông tin người dùng, vui lòng liên kết tài khoản trước', 'markdown');
            return;
        }
        $transferEnable = Helper::trafficConvert($user->transfer_enable);
        $up = Helper::trafficConvert($user->u);
        $down = Helper::trafficConvert($user->d);
        $remaining = Helper::trafficConvert($user->transfer_enable - ($user->u + $user->d));
        $text = "🚥 Thông tin lưu lượng\n———————————————\nTổng gói: `{$transferEnable}`\nĐã dùng upload: `{$up}`\nĐã dùng download: `{$down}`\nCòn lại: `{$remaining}`";
        $telegramService->sendMessage($message->chat_id, $text, 'markdown');
    }
}
