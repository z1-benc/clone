<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class LogController extends Controller
{
    // Feature 7: Admin System Log Viewer
    public function fetch(Request $request)
    {
        $level = $request->input('level', 'all'); // all, error, warning, info
        $lines = $request->input('lines', 200);

        $logPath = storage_path('logs/laravel.log');
        if (!File::exists($logPath)) {
            return response(['data' => [], 'total' => 0]);
        }

        $content = File::get($logPath);
        $logEntries = [];

        // Parse log entries
        preg_match_all('/\[(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[^\]]*)\]\s+(\w+)\.(\w+):\s+(.*?)(?=\[\d{4}-|\Z)/s', $content, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $entry = [
                'timestamp' => $match[1],
                'channel' => $match[2],
                'level' => strtolower($match[3]),
                'message' => trim(substr($match[4], 0, 500)),
            ];

            if ($level !== 'all' && $entry['level'] !== $level) {
                continue;
            }

            $logEntries[] = $entry;
        }

        // Newest first, limit
        $logEntries = array_reverse($logEntries);
        $total = count($logEntries);
        $logEntries = array_slice($logEntries, 0, $lines);

        return response([
            'data' => $logEntries,
            'total' => $total,
        ]);
    }

    public function clear(Request $request)
    {
        $logPath = storage_path('logs/laravel.log');
        if (File::exists($logPath)) {
            File::put($logPath, '');
        }
        return response(['data' => true]);
    }
}
