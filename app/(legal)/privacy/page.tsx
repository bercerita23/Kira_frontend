"use client";

import { motion, Variants } from "framer-motion";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

export default function PrivacyPolicy() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="font-lato flex flex-col min-h-screen bg-gray-50">
      <LandingHeader />
      <div className="w-full bg-[#113604]">
        <section className="flex items-center justify-center py-12 md:py-20">
          <motion.h1
            className="font-medium text-2xl md:text-4xl text-white leading-[100%] tracking-[-0.02em] text-center uppercase px-4"
            variants={titleVariants}
            initial="hidden"
            animate="visible"
          >
            PRIVACY POLICY
          </motion.h1>
        </section>
      </div>

      <motion.div
        className="py-12 md:py-20 px-4 md:px-8 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p className="text-gray-600 mb-8" variants={contentVariants}>
          Effective from September 19, 2025
        </motion.p>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">1. Information We Collect</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              1.1 Personal Information
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect information you provide directly to us, such as when
              you create an account, make a purchase, subscribe to our
              newsletter, or contact us for support. This may include your name,
              email address, postal address, phone number, payment information,
              and any other information you choose to provide.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              We also collect information about your use of our services,
              including your IP address, browser type, operating system,
              referring URLs, access times, and pages viewed. We may also
              collect location information if you enable location services.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              1.2 Cookies and Similar Technologies
            </h3>
            <p className="text-gray-700 leading-relaxed">
              We use cookies, web beacons, and similar technologies to collect
              information about your browsing activities and to personalize your
              experience. You can control cookies through your browser settings,
              but disabling cookies may affect the functionality of our
              services.
            </p>
          </div>
        </motion.section>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">
            2. How We Use Your Information
          </h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              2.1 Service Provision
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect to provide, maintain, and
              improve our services, process transactions, send you technical
              notices and support messages, and respond to your comments and
              questions.
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
              <li>To create and manage your account</li>
              <li>To process payments and fulfill orders</li>
              <li>To provide customer support</li>
              <li>To send important service-related communications</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              2.2 Marketing and Communications
            </h3>
            <p className="text-gray-700 leading-relaxed">
              With your consent, we may use your information to send you
              marketing communications about our products and services. You can
              opt out of these communications at any time by following the
              unsubscribe instructions in our emails or contacting us directly.
            </p>
          </div>
        </motion.section>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">
            3. Information Sharing and Disclosure
          </h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              3.1 Third-Party Service Providers
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share your information with third-party service providers
              who perform services on our behalf, such as payment processing,
              data analysis, email delivery, hosting services, and customer
              service. These providers are contractually obligated to protect
              your information and use it only for the specified purposes.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              3.2 Legal Requirements
            </h3>
            <p className="text-gray-700 leading-relaxed">
              We may disclose your information if required to do so by law or if
              we believe such action is necessary to comply with legal process,
              protect our rights or property, or ensure the safety of our users
              or the public.
            </p>
          </div>
        </motion.section>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">4. Data Security</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We implement appropriate technical and organizational security
            measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction. However, no method
            of transmission over the internet or electronic storage is 100%
            secure.
          </p>
        </motion.section>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">5. Your Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You have certain rights regarding your personal information,
            including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
            <li>
              The right to access and receive a copy of your personal
              information
            </li>
            <li>The right to rectify inaccurate personal information</li>
            <li>
              The right to erase your personal information in certain
              circumstances
            </li>
            <li>
              The right to restrict processing of your personal information
            </li>
            <li>The right to data portability</li>
            <li>
              The right to object to processing based on legitimate interests
            </li>
          </ul>
        </motion.section>
      </motion.div>

      <LandingFooter />
    </div>
  );
}
