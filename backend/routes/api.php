<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

Route::post('/contact', function (Request $request) {
    $validated = $request->validate([
        'name' => ['required', 'string', 'min:2', 'max:100'],
        'email' => ['required', 'email:rfc', 'max:254'],
        'message' => ['required', 'string', 'min:10', 'max:5000'],
    ]);

    try {
        Mail::raw(
            "Nom : {$validated['name']}\nE-mail : {$validated['email']}\n\n{$validated['message']}",
            function ($mail) use ($validated) {
                $mail
                    ->to(config('mail.from.address'))
                    ->replyTo($validated['email'], $validated['name'])
                    ->subject("Nouveau message portfolio — {$validated['name']}");
            }
        );
    } catch (\Throwable $exception) {
        Log::error('Portfolio contact email could not be delivered.', [
            'exception' => $exception,
        ]);

        return response()->json([
            'message' => 'Le message n’a pas pu être envoyé pour le moment.',
        ], 500);
    }

    return response()->json([
        'message' => 'Merci ! Ton message a bien été envoyé.',
    ], 201);
})->middleware('throttle:5,1');
