<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('emergency_reports', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number', 20)->nullable()->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('emergency_type_id')->constrained()->restrictOnDelete();
            $table->text('description');
            $table->unsignedSmallInteger('people_affected')->default(1);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('location_description')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('priority', 20)->default('medium');
            $table->string('status', 20)->default('submitted');
            $table->timestamp('reported_at');
            $table->timestamps();

            $table->index(['status', 'priority']);
            $table->index('reported_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergency_reports');
    }
};
