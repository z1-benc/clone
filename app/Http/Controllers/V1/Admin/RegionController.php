<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscribeRegion;
use Illuminate\Http\Request;

class RegionController extends Controller
{
    public function fetch(Request $request)
    {
        $regions = SubscribeRegion::orderBy('sort', 'ASC')->get();
        return response([
            'data' => $regions
        ]);
    }

    public function save(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:64',
            'code' => 'required|string|max:10',
            'domain' => 'required|string|max:255',
        ]);

        $data = $request->only([
            'name', 'code', 'domain', 'default_sni', 'icon', 'sort', 'status'
        ]);

        if ($request->input('id')) {
            $region = SubscribeRegion::find($request->input('id'));
            if (!$region) abort(500, 'Khu vực không tồn tại');
            try {
                $region->update($data);
            } catch (\Exception $e) {
                abort(500, 'Cập nhật thất bại');
            }
            return response(['data' => true]);
        }

        // Check duplicate domain
        if (SubscribeRegion::where('domain', $data['domain'])->first()) {
            abort(500, 'Domain đã tồn tại');
        }
        if (SubscribeRegion::where('code', $data['code'])->first()) {
            abort(500, 'Mã khu vực đã tồn tại');
        }

        if (!isset($data['sort'])) $data['sort'] = 0;
        if (!isset($data['status'])) $data['status'] = 1;

        if (!SubscribeRegion::create($data)) {
            abort(500, 'Tạo khu vực thất bại');
        }

        return response(['data' => true]);
    }

    public function drop(Request $request)
    {
        $request->validate([
            'id' => 'required|integer'
        ]);

        $region = SubscribeRegion::find($request->input('id'));
        if (!$region) abort(500, 'Khu vực không tồn tại');

        if (!$region->delete()) {
            abort(500, 'Xóa khu vực thất bại');
        }

        return response(['data' => true]);
    }

    public function sort(Request $request)
    {
        $request->validate([
            'ids' => 'required|array'
        ]);

        foreach ($request->input('ids') as $k => $id) {
            $region = SubscribeRegion::find($id);
            if ($region) {
                $region->update(['sort' => $k + 1]);
            }
        }

        return response(['data' => true]);
    }
}
