import { Accordian } from "./Accordian";
import { FiMessageCircle } from "react-icons/fi";
export const FrequentlyAsked = () => {
  const faqs = {
    companies: [
      {
        question: "How do I post jobs on ZipJob?",
        answer:
          "You can create a company profile by signing up as a 'Company' and then create a job post under the 'Jobs' dashboard referring to any company you registered.",
      },
      {
        question: "Is posting a job free?",
        answer:
          "Yes! You can post a job for free with limited visibility, or choose a premium option for more reach.",
      },
      {
        question: "How do I edit my job post?",
        answer:
          "You can go to your dashboard, find your job listing, and click on the 'Edit' button.",
      },
      {
        question: "Can I delete a job post?",
        answer:
          "Yes, you can delete your job post anytime from your company dashboard.",
      },
    ],
    jobSeekers: [
      {
        question: "How do I apply for a job?",
        answer:
          "Simply go to the job listing and click the 'Apply' button. Follow the instructions to submit your application.",
      },
      {
        question: "Can I track my applications?",
        answer:
          "Yes! You can track your applications from the 'My Applications' section in your dashboard.",
      },
      {
        question: "Is my profile visible to employers?",
        answer:
          "By default, your profile is visible to employers. However, you can manage your privacy settings from your account.",
      },
      {
        question: "How do I get job recommendations?",
        answer:
          "Our system suggests jobs based on your skills, experience, and preferences set in your profile.",
      },
    ],
  };

  return (
    <section className="py-12">
      {/* Heading */}
       <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <FiMessageCircle className="w-6 h-6 text-blue-600" />

          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Frequently Asked
            <span className="block md:inline text-blue-600"> Questions</span>
          </h1>
          </div>

      {/* FAQ Sections */}
      <div className="grid grid-cols-1 gap-10 max-w-6xl md:grid-cols-2 mx-auto px-5">
        {/* Companies Section */}
        <div className="space-y-4">
          <h2 className="text-2xl text-gray-950 font-semibold">For Companies</h2>
          <div className="space-y-3">
            {faqs.companies.map((faq, index) => (
              <Accordian key={index} title={faq.question} content={faq.answer} />
            ))}
          </div>
        </div>

        {/* Job-Seekers Section */}
        <div className="space-y-4">
          <h2 className="text-2xl text-gray-950 font-semibold">For Job-Seekers</h2>
          <div className="space-y-3">
            {faqs.jobSeekers.map((faq, index) => (
              <Accordian key={index} title={faq.question} content={faq.answer} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
