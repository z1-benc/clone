<?php

namespace App\Plugins\Telegram\Commands;

use App\Models\User;
use App\Plugins\Telegram\Telegram;

class GetLatestUrl extends Telegram {
    public $command = '/getlatesturl';
    public $description = 'Lấy địa chỉ website mới nhất';

    public function handle($message, $match = []) {
        $telegramService = $this->telegramService;
        $text = sprintf(
            "Địa chỉ mới nhất của %s là: %s",
            config('v2board.app_name', 'V2Board'),
            config('v2board.app_url')
        );
        $telegramService->sendMessage($message->chat_id, $text, 'markdown');
    }
}
