import React from "react";
import Navbar from "../../Components/common/Navbar";
import Courses from "../dashBoard/DCourses";

export default function InstructorCourses() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar page="instructor-courses" />
            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    <Courses />
                </div>
            </main>
        </div>
    );
}

