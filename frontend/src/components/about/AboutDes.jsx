import React from "react";

const AboutJobOrbit = () => {
  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-600 mb-6">
          About JobOrbit
        </h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-6 text-center">
          Welcome to <span className="font-semibold">JobOrbit</span>, your one-stop platform for connecting talent with opportunity. 
          At JobOrbit, we are committed to making job searching and hiring 
          <span className="font-semibold"> fast, simple, and effective</span> — just like a zip!
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">Who We Are</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          JobOrbit is a modern job portal designed to <span className="font-medium">bridge the gap between job seekers and employers</span>. Whether you're a professional looking for your next big opportunity or a company searching for the perfect candidate, JobOrbit is here to help.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Our mission is to <span className="font-medium">simplify the hiring process</span> by providing a <span className="font-medium">seamless and efficient platform</span> where companies and job seekers can connect effortlessly.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">What We Offer</h2>
        <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
          <li>
            <span className="font-medium">For Job Seekers:</span> Explore jobs, apply easily, and connect with top companies.
          </li>
          <li>
            <span className="font-medium">For Employers:</span> Post jobs, manage applicants, and find the perfect candidate quickly.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">Why Choose JobOrbit?</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><span className="font-medium">User-Friendly Interface</span> — Simple, clean, and responsive design.</li>
          <li><span className="font-medium">Fast & Secure</span> — Your data and privacy are protected.</li>
          <li><span className="font-medium">All Industries, All Roles</span> — From tech to finance and creative roles.</li>
        </ul>

        <p className="text-center text-gray-800 font-semibold mt-8">
          At <span className="text-blue-600">JobOrbit</span>, we believe the right job or candidate should never be out of reach. 
          <br />
          <span className="text-blue-600">Join us today</span> and experience a smarter way to search and hire!
        </p>
      </div>
    </section>
  );
};

export default AboutJobOrbit;
