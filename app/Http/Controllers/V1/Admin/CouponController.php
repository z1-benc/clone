<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CouponGenerate;
use App\Http\Requests\Admin\CouponSave;
use App\Models\Coupon;
use App\Models\Order;
use App\Utils\Helper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CouponController extends Controller
{
    public function fetch(Request $request)
    {
        $current = $request->input('current') ? $request->input('current') : 1;
        $pageSize = $request->input('pageSize') >= 10 ? $request->input('pageSize') : 10;
        $sortType = in_array($request->input('sort_type'), ['ASC', 'DESC']) ? $request->input('sort_type') : 'DESC';
        $sort = $request->input('sort') ? $request->input('sort') : 'id';
        $builder = Coupon::orderBy($sort, $sortType);
        $total = $builder->count();
        $coupons = $builder->forPage($current, $pageSize)
            ->get();
        return response([
            'data' => $coupons,
            'total' => $total
        ]);
    }

    public function show(Request $request)
    {
        if (empty($request->input('id'))) {
            abort(500, '参数有误');
        }
        $coupon = Coupon::find($request->input('id'));
        if (!$coupon) {
            abort(500, '优惠券不存在');
        }
        $coupon->show = $coupon->show ? 0 : 1;
        if (!$coupon->save()) {
            abort(500, '保存失败');
        }

        return response([
            'data' => true
        ]);
    }

    public function generate(CouponGenerate $request)
    {
        if ($request->input('generate_count')) {
            $this->multiGenerate($request);
            return;
        }

        $params = $request->validated();
        if (!$request->input('id')) {
            if (!isset($params['code'])) {
                $params['code'] = Helper::randomChar(8);
            }
            if (!Coupon::create($params)) {
                abort(500, '创建失败');
            }
        } else {
            try {
                Coupon::find($request->input('id'))->update($params);
            } catch (\Exception $e) {
                abort(500, '保存失败');
            }
        }

        return response([
            'data' => true
        ]);
    }

    private function multiGenerate(CouponGenerate $request)
    {
        $coupons = [];
        $coupon = $request->validated();
        $coupon['created_at'] = $coupon['updated_at'] = time();
        $coupon['show'] = 1;
        unset($coupon['generate_count']);
        for ($i = 0;$i < $request->input('generate_count');$i++) {
            $coupon['code'] = Helper::randomChar(8);
            array_push($coupons, $coupon);
        }
        DB::beginTransaction();
        if (!Coupon::insert(array_map(function ($item) use ($coupon) {
            // format data
            if (isset($item['limit_plan_ids']) && is_array($item['limit_plan_ids'])) {
                $item['limit_plan_ids'] = json_encode($coupon['limit_plan_ids']);
            }
            if (isset($item['limit_period']) && is_array($item['limit_period'])) {
                $item['limit_period'] = json_encode($coupon['limit_period']);
            }
            return $item;
        }, $coupons))) {
            DB::rollBack();
            abort(500, '生成失败');
        }
        DB::commit();
        $data = "名称,类型,金额或比例,开始时间,结束时间,可用次数,可用于订阅,券码,生成时间\r\n";
        foreach($coupons as $coupon) {
            $type = ['', '金额', '比例'][$coupon['type']];
            $value = ['', ($coupon['value'] / 100),$coupon['value']][$coupon['type']];
            $startTime = date('Y-m-d H:i:s', $coupon['started_at']);
            $endTime = date('Y-m-d H:i:s', $coupon['ended_at']);
            $limitUse = $coupon['limit_use'] ?? '不限制';
            $createTime = date('Y-m-d H:i:s', $coupon['created_at']);
            $limitPlanIds = isset($coupon['limit_plan_ids']) ? implode("/", $coupon['limit_plan_ids']) : '不限制';
            $data .= "{$coupon['name']},{$type},{$value},{$startTime},{$endTime},{$limitUse},{$limitPlanIds},{$coupon['code']},{$createTime}\r\n";
        }
        echo $data;
    }

    public function drop(Request $request)
    {
        if (empty($request->input('id'))) {
            abort(500, '参数有误');
        }
        $coupon = Coupon::find($request->input('id'));
        if (!$coupon) {
            abort(500, '优惠券不存在');
        }
        if (!$coupon->delete()) {
            abort(500, '删除失败');
        }

        return response([
            'data' => true
        ]);
    }

    // Coupon Statistics – tối ưu: 2 group-by queries thay vì N*2 queries
    public function stats(Request $request)
    {
        $coupons = Coupon::orderBy('id', 'DESC')->get();

        // 1 query để đếm số lần dùng
        $usedCounts = Order::whereNotIn('status', [0, 2])
            ->whereNotNull('coupon_id')
            ->selectRaw('coupon_id, COUNT(*) as cnt')
            ->groupBy('coupon_id')
            ->pluck('cnt', 'coupon_id');

        // 1 query để tổng giảm giá
        $totalDiscounts = Order::whereNotIn('status', [0, 2])
            ->whereNotNull('coupon_id')
            ->selectRaw('coupon_id, SUM(discount_amount) as total')
            ->groupBy('coupon_id')
            ->pluck('total', 'coupon_id');

        $stats = $coupons->map(function ($coupon) use ($usedCounts, $totalDiscounts) {
            return [
                'id'             => $coupon->id,
                'code'           => $coupon->code,
                'name'           => $coupon->name,
                'type'           => $coupon->type,
                'value'          => $coupon->value,
                'limit_use'      => $coupon->limit_use,
                'used_count'     => $usedCounts[$coupon->id] ?? 0,
                'total_discount' => $totalDiscounts[$coupon->id] ?? 0,
                'started_at'     => $coupon->started_at,
                'ended_at'       => $coupon->ended_at,
                'show'           => $coupon->show,
            ];
        });

        return response(['data' => $stats]);
    }
}
