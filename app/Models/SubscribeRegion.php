<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscribeRegion extends Model
{
    protected $table = 'v2_subscribe_region';
    protected $dateFormat = 'U';

    protected $casts = [
        'created_at' => 'timestamp',
        'updated_at' => 'timestamp'
    ];

    protected $fillable = [
        'name',
        'code',
        'domain',
        'default_sni',
        'icon',
        'sort',
        'status'
    ];
}
