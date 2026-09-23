<?php

use Illuminate\Support\Facades\Route;

/*
 * The React single-page app handles every non-API URL client-side.
 */
Route::view('/{path?}', 'app')
    ->where('path', '^(?!api/|up$|storage/).*$')
    ->name('home');
