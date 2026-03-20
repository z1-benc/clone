<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginLog extends Model
{
    protected $table = 'v2_login_log';
    protected $dateFormat = 'U';

    protected $casts = [
        'created_at' => 'timestamp',
        'updated_at' => 'timestamp'
    ];

    protected $fillable = [
        'user_id',
        'ip',
        'user_agent',
        'login_at'
    ];
}
