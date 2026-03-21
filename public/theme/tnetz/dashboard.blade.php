<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="/theme/default/assets/components.chunk.css?v={{$version}}">
    <link rel="stylesheet" href="/theme/default/assets/umi.css?v={{$version}}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/theme/tnetz/assets/custom.css?v={{$version}}&t={{time()}}">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no">
    @php ($colors = [
        'darkblue' => '#3b5998',
        'black' => '#343a40',
        'default' => '#0665d0',
        'green' => '#319795'
    ])
    <meta name="theme-color" content="{{$colors[$theme_config['theme_color'] ?? 'default'] ?? '#0665d0'}}">
    <title>{{$title}}</title>
    <script>window.routerBase = "/";</script>
    <script>
        window.settings = {
            title: '{{$title}}',
            assets_path: '/theme/default/assets',
            theme: {
                sidebar: '{{$theme_config['theme_sidebar'] ?? 'light'}}',
                header: '{{$theme_config['theme_header'] ?? 'dark'}}',
                color: '{{$theme_config['theme_color'] ?? 'default'}}',
            },
            version: '{{$version}}',
            background_url: '{{$theme_config['background_url'] ?? ''}}',
            description: '{{$description}}',
            i18n: ['zh-CN','en-US','ja-JP','vi-VN','ko-KR','zh-TW','fa-IR'],
            logo: '{{$logo}}'
        }
    </script>
    <script src="/theme/default/assets/i18n/zh-CN.js?v={{$version}}"></script>
    <script src="/theme/default/assets/i18n/zh-TW.js?v={{$version}}"></script>
    <script src="/theme/default/assets/i18n/en-US.js?v={{$version}}"></script>
    <script src="/theme/default/assets/i18n/ja-JP.js?v={{$version}}"></script>
    <script src="/theme/default/assets/i18n/vi-VN.js?v={{$version}}"></script>
    <script src="/theme/default/assets/i18n/ko-KR.js?v={{$version}}"></script>
    <script src="/theme/default/assets/i18n/fa-IR.js?v={{$version}}"></script>
</head>
<body>
<div id="root"></div>
{!! $theme_config['custom_html'] ?? '' !!}
<script src="/theme/default/assets/vendors.async.js?v={{$version}}"></script>
<script src="/theme/default/assets/components.async.js?v={{$version}}"></script>
<script src="/theme/default/assets/umi.js?v={{$version}}"></script>
<script src="/theme/tnetz/assets/custom.js?v={{$version}}&t={{time()}}"></script>
</body>
</html>
