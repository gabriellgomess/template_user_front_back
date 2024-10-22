<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;

// Rotas de Autenticação
Route::post("register", [AuthController::class, "register"]);
Route::post("login", [AuthController::class, "login"]);

// Rotas protegidas
Route::group(["middleware" => ["auth:sanctum"]], function () {
    Route::get("profile", [AuthController::class, "profile"]);
    Route::post("logout", [AuthController::class, "logout"]);

    // Rotas de Usuários (Apenas após autenticação)
    Route::get("users", [UserController::class, "index"]);
    Route::post("users", [UserController::class, "store"]);
    Route::put("users/{id}", [UserController::class, "update"]);
    Route::delete("users/{id}", [UserController::class, "destroy"]);
});


