import React from "react";
import Navbar from "../../Components/common/Navbar";
import Courses from "../dashBoard/DCourses";

export default function InstructorCourses() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar page="instructor-courses" />
            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-800 mb-4">Quản lý khóa học của tôi</h1>
                    <Courses />
                </div>
            </main>
        </div>
    );
}

