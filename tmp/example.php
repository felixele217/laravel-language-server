<?php

declare(strict_types=1);

class Controller
{
    public function index()
    {
        return Inertia::render('Dashboard/DashboardPage.vue', [
            'name' => 'John Doe',
            'age' => 30,
        ]);

        return Inertia::render('timesheet/TimesheetPage.vue', [
            'name' => 'John Doe',
            'age' => 30,
        ]);
    }
}
