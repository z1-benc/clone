<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Cảnh báo lưu lượng - {{$name}}">
    <title>Lưu lượng sắp hết - {{$name}}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
        <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
                <tr><td style="background:linear-gradient(135deg,#f6ad55 0%,#e53e3e 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
                    <h1 style="color:#fff;font-size:20px;font-weight:600;margin:0 0 4px;">📊 Lưu Lượng Sắp Hết</h1>
                    <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0;">{{$name}}</p>
                </td></tr>
                <tr><td style="background:#fff;padding:36px 40px;">
                    <p style="font-size:15px;color:#2d3748;margin:0 0 20px;line-height:1.6;">Xin chào,</p>
                    <p style="font-size:14px;color:#4a5568;margin:0 0 24px;line-height:1.6;">Lưu lượng dữ liệu của bạn tại <strong>{{$name}}</strong> đã gần đạt giới hạn. Để tránh gián đoạn dịch vụ, vui lòng nâng cấp hoặc mua thêm lưu lượng.</p>
                    <div style="background:#fff8f0;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px;margin:0 0 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="font-size:13px;color:#9c4221;padding:4px 0;">📈 <strong>Sử dụng:</strong></td>
                                <td style="font-size:13px;color:#e53e3e;text-align:right;font-weight:600;">Gần giới hạn</td>
                            </tr>
                            <tr>
                                <td style="font-size:13px;color:#9c4221;padding:4px 0;">⚡ <strong>Hành động:</strong></td>
                                <td style="font-size:13px;color:#9c4221;text-align:right;">Nâng cấp gói hoặc mua data</td>
                            </tr>
                        </table>
                    </div>
                    <div style="text-align:center;">
                        <a href="{{$url}}/#/plan" style="display:inline-block;background:linear-gradient(135deg,#f6ad55 0%,#e53e3e 100%);color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 32px;border-radius:8px;">📦 Mua thêm lưu lượng</a>
                    </div>
                </td></tr>
                <tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #edf2f7;">
                    <p style="font-size:11px;color:#a0aec0;margin:0 0 8px;">Email tự động — vui lòng không trả lời</p>
                    <p style="font-size:11px;color:#a0aec0;margin:0;">© {{$name}} · <a href="{{$url}}/#/subscribe" style="color:#667eea;text-decoration:none;">Đăng ký</a> · <a href="{{$url}}/#/knowledge" style="color:#667eea;text-decoration:none;">Hướng dẫn</a></p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>
