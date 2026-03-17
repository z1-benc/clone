<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\WebconSave;
use App\Models\Staff;
use App\Models\User;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class WebconController extends Controller
{
    public function fetch(Request $request)
    {
        $staffs = Staff::orderBy('id', 'DESC')->get();
    
        $staffs->transform(function ($staff) {
            $user = User::find($staff->user_id);
            $staff->email = $user ? $user->email : null;
            $staff->staff = $user ? $user->is_staff : 0;
            
            // Stats: active users with plan / total users for this staff
            $planIds = $staff->plan_id ?? [];
            if (!empty($planIds)) {
                $totalUsers = User::whereIn('plan_id', $planIds)->count();
                $activeUsers = User::whereIn('plan_id', $planIds)
                    ->where(function ($q) {
                        $q->where('expired_at', '>', time())
                          ->orWhereNull('expired_at');
                    })
                    ->where('banned', 0)
                    ->count();
                $staff->total_users = $totalUsers;
                $staff->active_users = $activeUsers;
            } else {
                $staff->total_users = 0;
                $staff->active_users = 0;
            }
            return $staff;
        });
        
        return response([
            'data' => $staffs
        ]);
    }
    

    public function save(WebconSave $request)
    {
        
        $data = $request->only([
            'email',
            'domain',
            'title',
            'description',
            'logo',
            'background_url',
            'custom_html',
            'path',
        ]);
        if ($request->has('plan_ids')) {
            $planIds = $request->input('plan_ids', []);
            $data['plan_id'] = array_map('intval', (array)$planIds);
        }

        // Subscribe info config (which fields to show)
        $subscribeInfoConfig = $request->input('subscribe_info_config');
        if ($subscribeInfoConfig !== null) {
            $data['subscribe_info_config'] = $subscribeInfoConfig;
        }

        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            abort(500, 'Email không tồn tại trong hệ thống!');
        }

        $data['user_id'] = $user->id;
        unset($data['email']);
        if (!$request->input('id')) {
            if (!Staff::create($data)) {
                abort(500, 'Lưu thất bại');
            }
        } else {
            try {
                Staff::find($request->input('id'))->update($data);
            } catch (\Exception $e) {
                abort(500, 'Lưu thất bại');
            }
        }
        return response([
            'data' => true
        ]);
    }



    public function show(Request $request)
    {
        if (empty($request->input('id'))) {
            abort(500, 'Tham số không hợp lệ');
        }
        $staff = Staff::find($request->input('id'));
        if (!$staff) {
            abort(500, 'Không tìm thấy web con');
        }
        $staff->status = $staff->status ? 0 : 1;
        if (!$staff->save()) {
            abort(500, 'Lưu thất bại');
        }

        return response([
            'data' => true
        ]);
    }

    public function drop(Request $request)
    {
        if (empty($request->input('id'))) {
            abort(500, 'Tham số không hợp lệ');
        }
        $staff = Staff::find($request->input('id'));
        if (!$staff) {
            abort(500, 'Không tìm thấy web con');
        }
        if (!$staff->delete()) {
            abort(500, 'Xóa thất bại');
        }
        return response([
            'data' => true
        ]);
    }

    // Get users list for a specific staff site
    public function getUsers(Request $request)
    {
        $staffId = $request->input('id');
        if (!$staffId) {
            abort(500, 'Tham số không hợp lệ');
        }
        $staff = Staff::find($staffId);
        if (!$staff) {
            abort(500, 'Không tìm thấy web con');
        }
        $planIds = $staff->plan_id ?? [];
        if (empty($planIds)) {
            return response(['data' => []]);
        }
        
        $users = User::whereIn('plan_id', $planIds)
            ->select(['id', 'email', 'plan_id', 'expired_at', 'transfer_enable', 'u', 'd', 'banned', 'created_at'])
            ->orderBy('id', 'DESC')
            ->get();
        
        $users->transform(function ($user) {
            $user->plan_name = optional(Plan::find($user->plan_id))->name;
            return $user;
        });
        
        return response(['data' => $users]);
    }
}

