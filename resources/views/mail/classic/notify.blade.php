<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Thông báo từ {{$name}}">
    <title>Thông báo - {{$name}}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
        <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
                <!-- Header -->
                <tr><td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
                    <h1 style="color:#fff;font-size:20px;font-weight:600;margin:0 0 4px;">📢 Thông Báo</h1>
                    <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0;">{{$name}}</p>
                </td></tr>
                <!-- Body -->
                <tr><td style="background:#fff;padding:36px 40px;">
                    <p style="font-size:15px;color:#2d3748;margin:0 0 20px;line-height:1.6;">Xin chào,</p>
                    <div style="font-size:14px;color:#4a5568;line-height:1.7;margin:0 0 28px;padding:16px 20px;background:#f8fafc;border-left:4px solid #667eea;border-radius:0 8px 8px 0;">
                        {!!$content!!}
                    </div>
                    <!-- CTA Button -->
                    <div style="text-align:center;">
                        <a href="{{$url}}" style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 32px;border-radius:8px;">Truy cập {{$name}}</a>
                    </div>
                </td></tr>
                <!-- Footer -->
                <tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #edf2f7;">
                    <p style="font-size:11px;color:#a0aec0;margin:0 0 8px;">Email tự động — vui lòng không trả lời</p>
                    <p style="font-size:11px;color:#a0aec0;margin:0;">© {{$name}} · <a href="{{$url}}/#/subscribe" style="color:#667eea;text-decoration:none;">Đăng ký</a> · <a href="{{$url}}/#/knowledge" style="color:#667eea;text-decoration:none;">Hướng dẫn</a></p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>
