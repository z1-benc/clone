<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UserUpdate extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'email' => 'required|email:strict',
            'password' => 'nullable|min:8',
            'transfer_enable' => 'numeric',
            'device_limit' => 'nullable|integer',
            'expired_at' => 'nullable|integer',
            'banned' => 'required|in:0,1',
            'plan_id' => 'nullable|integer',
            'commission_rate' => 'nullable|integer|min:0|max:100',
            'discount' => 'nullable|integer|min:0|max:100',
            'is_admin' => 'required|in:0,1',
            'is_staff' => 'required|in:0,1',
            'u' => 'integer',
            'd' => 'integer',
            'network_settings' => 'nullable',
            'balance' => 'integer',
            'commission_type' => 'integer',
            'commission_balance' => 'integer',
            'remarks' => 'nullable',
            'speed_limit' => 'nullable|integer'
        ];
    }

    public function messages()
    {
        return [
            'email.required' => 'Email không được để trống',
            'email.email' => 'Định dạng email không đúng',
            'transfer_enable.numeric' => 'Định dạng lưu lượng không đúng',
            'device_limit.integer' => 'Định dạng giới hạn thiết bị không đúng',
            'expired_at.integer' => 'Định dạng thời gian hết hạn không đúng',
            'banned.required' => 'Trạng thái chặn không được để trống',
            'banned.in' => 'Định dạng trạng thái chặn không đúng',
            'is_admin.required' => 'Quyền quản trị không được để trống',
            'is_admin.in' => 'Định dạng quyền quản trị không đúng',
            'is_staff.required' => 'Quyền nhân viên không được để trống',
            'is_staff.in' => 'Định dạng quyền nhân viên không đúng',
            'plan_id.integer' => 'Định dạng gói đăng ký không đúng',
            'commission_rate.integer' => 'Định dạng tỷ lệ hoa hồng không đúng',
            'commission_rate.nullable' => 'Định dạng tỷ lệ hoa hồng không đúng',
            'commission_rate.min' => 'Tỷ lệ hoa hồng tối thiểu là 0',
            'commission_rate.max' => 'Tỷ lệ hoa hồng tối đa là 100',
            'discount.integer' => 'Định dạng tỷ lệ giảm giá riêng không đúng',
            'discount.nullable' => 'Định dạng tỷ lệ giảm giá riêng không đúng',
            'discount.min' => 'Tỷ lệ giảm giá riêng tối thiểu là 0',
            'discount.max' => 'Tỷ lệ giảm giá riêng tối đa là 100',
            'u.integer' => 'Định dạng lưu lượng upload không đúng',
            'd.integer' => 'Định dạng lưu lượng download không đúng',
            'balance.integer' => 'Định dạng số dư không đúng',
            'commission_balance.integer' => 'Định dạng hoa hồng không đúng',
            'password.min' => 'Độ dài mật khẩu tối thiểu 8 ký tự',
            'speed_limit.integer' => 'Định dạng giới hạn tốc độ không đúng'
        ];
    }
}
