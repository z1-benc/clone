<?php

namespace App\Utils;

class CacheKey
{
    CONST KEYS = [
        'EMAIL_VERIFY_CODE' => 'Mã xác thực email',
        'LAST_SEND_EMAIL_VERIFY_TIMESTAMP' => 'Thời gian gửi mã xác thực email lần cuối',
        'SERVER_VMESS_ONLINE_USER' => 'Node VMess - người dùng trực tuyến',
        'SERVER_VMESS_LAST_CHECK_AT' => 'Node VMess - thời gian kiểm tra cuối',
        'SERVER_VMESS_LAST_PUSH_AT' => 'Node VMess - thời gian đẩy cuối',
        'SERVER_TROJAN_ONLINE_USER' => 'Node Trojan - người dùng trực tuyến',
        'SERVER_TROJAN_LAST_CHECK_AT' => 'Node Trojan - thời gian kiểm tra cuối',
        'SERVER_TROJAN_LAST_PUSH_AT' => 'Node Trojan - thời gian đẩy cuối',
        'SERVER_SHADOWSOCKS_ONLINE_USER' => 'Node Shadowsocks - người dùng trực tuyến',
        'SERVER_SHADOWSOCKS_LAST_CHECK_AT' => 'Node Shadowsocks - thời gian kiểm tra cuối',
        'SERVER_SHADOWSOCKS_LAST_PUSH_AT' => 'Node Shadowsocks - thời gian đẩy cuối',
        'SERVER_HYSTERIA_ONLINE_USER' => 'Node Hysteria - người dùng trực tuyến',
        'SERVER_HYSTERIA_LAST_CHECK_AT' => 'Node Hysteria - thời gian kiểm tra cuối',
        'SERVER_HYSTERIA_LAST_PUSH_AT' => 'Node Hysteria - thời gian đẩy cuối',
        'SERVER_TUIC_ONLINE_USER' => 'Node TUIC - người dùng trực tuyến',
        'SERVER_TUIC_LAST_CHECK_AT' => 'Node TUIC - thời gian kiểm tra cuối',
        'SERVER_TUIC_LAST_PUSH_AT' => 'Node TUIC - thời gian đẩy cuối',
        'SERVER_VLESS_ONLINE_USER' => 'Node VLESS - người dùng trực tuyến',
        'SERVER_VLESS_LAST_CHECK_AT' => 'Node VLESS - thời gian kiểm tra cuối',
        'SERVER_VLESS_LAST_PUSH_AT' => 'Node VLESS - thời gian đẩy cuối',
        'SERVER_ANYTLS_ONLINE_USER' => 'Node AnyTLS - người dùng trực tuyến',
        'SERVER_ANYTLS_LAST_CHECK_AT' => 'Node AnyTLS - thời gian kiểm tra cuối',
        'SERVER_ANYTLS_LAST_PUSH_AT' => 'Node AnyTLS - thời gian đẩy cuối',
        'SERVER_V2NODE_ONLINE_USER' => 'Node V2Node - người dùng trực tuyến',
        'SERVER_V2NODE_LAST_CHECK_AT' => 'Node V2Node - thời gian kiểm tra cuối',
        'SERVER_V2NODE_LAST_PUSH_AT' => 'Node V2Node - thời gian đẩy cuối',
        'TEMP_TOKEN' => 'Token tạm thời',
        'LAST_SEND_EMAIL_REMIND_TRAFFIC' => 'Lần cuối gửi email nhắc nhở lưu lượng',
        'SCHEDULE_LAST_CHECK_AT' => 'Thời gian kiểm tra cron job cuối',
        'REGISTER_IP_RATE_LIMIT' => 'Giới hạn tần suất đăng ký theo IP',
        'LAST_SEND_LOGIN_WITH_MAIL_LINK_TIMESTAMP' => 'Thời gian gửi link đăng nhập qua email lần cuối',
        'PASSWORD_ERROR_LIMIT' => 'Giới hạn số lần nhập sai mật khẩu',
        'USER_SESSIONS' => 'Phiên đăng nhập người dùng',
        'FORGET_REQUEST_LIMIT' => 'Giới hạn số lần yêu cầu quên mật khẩu'
    ];

    public static function get(string $key, $uniqueValue)
    {
        if (!in_array($key, array_keys(self::KEYS))) {
            abort(500, 'key is not in cache key list');
        }
        return $key . '_' . $uniqueValue;
    }
}
