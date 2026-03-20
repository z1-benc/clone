<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;

class CancelExpiredOrders extends Command
{
    protected $signature = 'order:cancel-expired';
    protected $description = 'Cancel unpaid orders older than 24 hours';

    public function handle()
    {
        $expiredTime = time() - 86400; // 24 giờ
        $count = Order::where('status', 0)
            ->where('created_at', '<', $expiredTime)
            ->update(['status' => 2]); // 2 = cancelled

        $this->info("Đã hủy {$count} đơn hàng hết hạn thanh toán.");
    }
}
