<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Cache;

class RateLimitMiddleware
{
    /**
     * Feature 17: Login Rate Limiting & IP Ban
     * Limit login attempts: 10 failed attempts → ban IP for 30 minutes
     */
    public function handle($request, Closure $next)
    {
        $ip = $request->ip();
        $key = 'rate_limit:' . $ip;
        $banKey = 'rate_ban:' . $ip;

        // Check if IP is banned
        if (Cache::has($banKey)) {
            $ttl = Cache::get($banKey);
            abort(429, "Quá nhiều lần thử. Vui lòng đợi 30 phút.");
        }

        $response = $next($request);

        // If login failed (401/403), increment counter
        if (in_array($response->getStatusCode(), [401, 403, 500])) {
            $attempts = Cache::get($key, 0) + 1;
            Cache::put($key, $attempts, 1800); // 30 min window

            if ($attempts >= 10) {
                Cache::put($banKey, true, 1800); // Ban 30 min
                Cache::forget($key);
            }
        } else {
            // Successful login → reset counter
            Cache::forget($key);
        }

        return $response;
    }
}
