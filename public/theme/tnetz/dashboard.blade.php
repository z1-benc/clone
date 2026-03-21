<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
    <title>{{$title}}</title>
    <meta name="description" content="{{$description}}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/theme/tnetz/assets/custom.css?v={{$version}}&t={{time()}}">
    <script>
        window.v2board = {
            title: '{{$title}}',
            logo: '{{$logo}}',
            version: '{{$version}}',
            description: '{{$description}}'
        };
    </script>
</head>
<body>
    <div id="app"></div>
    {!! $theme_config['custom_html'] ?? '' !!}
    <script src="/theme/tnetz/assets/custom.js?v={{$version}}&t={{time()}}"></script>
</body>
</html>
