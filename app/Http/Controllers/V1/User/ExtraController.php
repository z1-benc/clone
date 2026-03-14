<?php

namespace App\Http\Controllers\V1\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Plan;
use App\Models\User;
use App\Services\OrderService;
use App\Utils\Helper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExtraController extends Controller
{
    // Buy extra device slots
    public function buyDevice(Request $request)
    {
        $user = User::find($request->user['id']);
        if (!$user) {
            abort(500, __('The user does not exist'));
        }
        if (!$user->plan_id) {
            abort(500, 'Bạn chưa có gói đăng ký');
        }
        $plan = Plan::find($user->plan_id);
        if (!$plan) {
            abort(500, 'Gói không tồn tại');
        }
        $price = $plan->extra_device_price ?? 0;
        if ($price <= 0) {
            abort(500, 'Gói này không hỗ trợ mua thêm thiết bị');
        }
        $quantity = (int)$request->input('quantity', 1);
        if ($quantity < 1 || $quantity > 10) {
            abort(500, 'Số lượng không hợp lệ (1-10)');
        }
        $totalCost = $price * $quantity;
        DB::beginTransaction();
        try {
            // Create unpaid order record
            $order = new Order();
            $order->user_id = $user->id;
            $order->plan_id = $user->plan_id;
            $order->period = 'extra_device';
            $order->trade_no = Helper::generateOrderNo();
            $order->total_amount = $totalCost;
            $order->status = 0; // unpaid
            $order->save();
            
            DB::commit();
            return response([
                'data' => $order->trade_no
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            abort(500, 'Lỗi: ' . $e->getMessage());
        }
    }

    // Buy extra data
    public function buyData(Request $request)
    {
        $user = User::find($request->user['id']);
        if (!$user) {
            abort(500, __('The user does not exist'));
        }
        if (!$user->plan_id) {
            abort(500, 'Bạn chưa có gói đăng ký');
        }
        $plan = Plan::find($user->plan_id);
        if (!$plan) {
            abort(500, 'Gói không tồn tại');
        }
        $price = $plan->extra_data_price ?? 0;
        $amount = $plan->extra_data_amount ?? 100; // GB
        if ($price <= 0) {
            abort(500, 'Gói này không hỗ trợ mua thêm dung lượng');
        }
        $quantity = (int)$request->input('quantity', 1);
        if ($quantity < 1 || $quantity > 10) {
            abort(500, 'Số lượng không hợp lệ (1-10)');
        }
        $totalCost = $price * $quantity;
        $totalData = $amount * $quantity; // GB
        DB::beginTransaction();
        try {
            // Create unpaid order record
            $order = new Order();
            $order->user_id = $user->id;
            $order->plan_id = $user->plan_id;
            $order->period = 'extra_data';
            $order->trade_no = Helper::generateOrderNo();
            $order->total_amount = $totalCost;
            $order->status = 0; // unpaid
            $order->save();

            DB::commit();
            return response([
                'data' => $order->trade_no
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            abort(500, 'Lỗi: ' . $e->getMessage());
        }
    }

    // Get extra purchase info for current plan
    public function getInfo(Request $request)
    {
        $user = User::find($request->user['id']);
        if (!$user || !$user->plan_id) {
            return response(['data' => null]);
        }
        $plan = Plan::find($user->plan_id);
        if (!$plan) {
            return response(['data' => null]);
        }
        return response([
            'data' => [
                'extra_device_price' => $plan->extra_device_price ?? 0,
                'extra_data_price' => $plan->extra_data_price ?? 0,
                'extra_data_amount' => $plan->extra_data_amount ?? 100,
                'extra_devices' => $user->extra_devices ?? 0,
                'device_limit' => $user->device_limit ?? 0,
            ]
        ]);
    }
}
