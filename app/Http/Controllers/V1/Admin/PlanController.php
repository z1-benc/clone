<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PlanSave;
use App\Http\Requests\Admin\PlanSort;
use App\Http\Requests\Admin\PlanUpdate;
use App\Models\Order;
use App\Models\Plan;
use App\Models\User;
use App\Services\PlanService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlanController extends Controller
{
    public function fetch(Request $request)
    {
        $counts = PlanService::countActiveUsers();
        $plans = Plan::orderBy('sort', 'ASC')->get();
        foreach ($plans as $k => $v) {
            $plans[$k]->count = 0;
            foreach ($counts as $kk => $vv) {
                if ($plans[$k]->id === $counts[$kk]->plan_id) $plans[$k]->count = $counts[$kk]->count;
            }
        }
        return response([
            'data' => $plans
        ]);
    }

    public function save(PlanSave $request)
    {
        $params = $request->validated();
        if ($request->input('id')) {
            $plan = Plan::find($request->input('id'));
            if (!$plan) {
                abort(500, '该订阅不存在');
            }
            DB::beginTransaction();
            // update user group id and transfer
            try {
                if ($request->input('force_update')) {
                    // Preserve extra_devices when force updating
                    $users = User::where('plan_id', $plan->id)->get();
                    foreach ($users as $u) {
                        $totalDeviceLimit = $params['device_limit'] + ($u->extra_devices ?? 0);
                        $u->update([
                            'group_id' => $params['group_id'],
                            'transfer_enable' => $params['transfer_enable'] * 1073741824,
                            'device_limit' => $totalDeviceLimit,
                            'speed_limit' => $params['speed_limit']
                        ]);
                    }
                }
                $plan->update($params);
            } catch (\Exception $e) {
                DB::rollBack();
                abort(500, '保存失败');
            }
            DB::commit();
            return response([
                'data' => true
            ]);
        }
        if (!Plan::create($params)) {
            abort(500, '创建失败');
        }
        return response([
            'data' => true
        ]);
    }

    public function saveExtra(Request $request)
    {
        $plan = Plan::find($request->input('id'));
        if (!$plan) {
            abort(500, 'Gói không tồn tại');
        }
        $updateData = [];
        if ($request->has('extra_device_price')) {
            $updateData['extra_device_price'] = $request->input('extra_device_price');
        }
        if ($request->has('extra_data_price')) {
            $updateData['extra_data_price'] = $request->input('extra_data_price');
        }
        if ($request->has('extra_data_amount')) {
            $updateData['extra_data_amount'] = $request->input('extra_data_amount');
        }
        try {
            $plan->update($updateData);
        } catch (\Exception $e) {
            abort(500, 'Lưu thất bại');
        }
        return response([
            'data' => true
        ]);
    }

    public function drop(Request $request)
    {
        if (Order::where('plan_id', $request->input('id'))->first()) {
            abort(500, '该订阅下存在订单无法删除');
        }
        if (User::where('plan_id', $request->input('id'))->first()) {
            abort(500, '该订阅下存在用户无法删除');
        }
        if ($request->input('id')) {
            $plan = Plan::find($request->input('id'));
            if (!$plan) {
                abort(500, '该订阅ID不存在');
            }
        }
        return response([
            'data' => $plan->delete()
        ]);
    }

    public function update(PlanUpdate $request)
    {
        $updateData = $request->only([
            'show',
            'renew'
        ]);

        $plan = Plan::find($request->input('id'));
        if (!$plan) {
            abort(500, '该订阅不存在');
        }

        try {
            $plan->update($updateData);
        } catch (\Exception $e) {
            abort(500, '保存失败');
        }

        return response([
            'data' => true
        ]);
    }

    public function sort(PlanSort $request)
    {
        DB::beginTransaction();
        foreach ($request->input('plan_ids') as $k => $v) {
            if (!Plan::find($v)->update(['sort' => $k + 1])) {
                DB::rollBack();
                abort(500, '保存失败');
            }
        }
        DB::commit();
        return response([
            'data' => true
        ]);
    }

    // Get users list for a specific plan
    public function getUsers(Request $request)
    {
        $planId = $request->input('plan_id');
        if (!$planId) {
            abort(500, 'Tham số không hợp lệ');
        }
        $plan = Plan::find($planId);
        if (!$plan) {
            abort(500, 'Gói không tồn tại');
        }
        $users = User::where('plan_id', $planId)
            ->select(['id', 'email', 'plan_id', 'expired_at', 'transfer_enable', 'u', 'd', 'banned', 'created_at', 'extra_devices'])
            ->orderBy('id', 'DESC')
            ->get();
        return response(['data' => $users]);
    }
}
