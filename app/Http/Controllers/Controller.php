<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

abstract class Controller
{
    /**
     * Wrap a payload in the API's standard `{success, message, data}` envelope.
     */
    protected function success(mixed $data = null, string $message = '', int $status = 200): JsonResponse
    {
        if ($data instanceof JsonResource) {
            return $data
                ->additional([...$data->additional, 'success' => true, 'message' => $message])
                ->response()
                ->setStatusCode($status);
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }
}
