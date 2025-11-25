"use client";

import { motion, Variants } from "framer-motion";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

export default function TermsOfService() {
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
            TERMS OF SERVICE
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
          <h2 className="text-2xl font-bold mb-6">1. Acceptance of Terms</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">1.1 Agreement to Terms</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing or using our services, you agree to be bound by these Terms of Service
              and all applicable laws and regulations. If you do not agree with any of these terms,
              you are prohibited from using or accessing our services.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">1.2 Changes to Terms</h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective
              immediately upon posting. Your continued use of our services after any changes
              constitutes acceptance of the new terms.
            </p>
          </div>
        </motion.section>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">2. Use of Services</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">2.1 Permitted Use</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may use our services only for lawful purposes and in accordance with these terms.
              You agree not to use the services in any way that could damage, disable, overburden,
              or impair our servers or networks, or interfere with any other party's use of the services.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">2.2 Prohibited Activities</h3>
            <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
              <li>Use the services for any illegal or unauthorized purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit any harmful or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Collect or harvest personal information of other users</li>
            </ul>
          </div>
        </motion.section>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">3. Intellectual Property Rights</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">3.1 Our Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              All content, features, and functionality of our services, including but not limited to
              text, graphics, logos, images, and software, are owned by us or our licensors and are
              protected by copyright, trademark, and other intellectual property laws.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">3.2 User Content</h3>
            <p className="text-gray-700 leading-relaxed">
              By submitting content to our services, you grant us a worldwide, non-exclusive,
              royalty-free license to use, reproduce, modify, and distribute such content in
              connection with our services. You represent that you have all necessary rights
              to grant this license.
            </p>
          </div>
        </motion.section>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">4. Payment Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you purchase services from us, you agree to pay all applicable fees and taxes.
            Payment is due immediately upon purchase unless otherwise specified. We reserve the
            right to suspend or terminate your access for non-payment.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            All sales are final unless otherwise specified in our refund policy. We reserve the
            right to change our pricing at any time.
          </p>
        </motion.section>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">5. Disclaimers and Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our services are provided "as is" without warranties of any kind. We disclaim all
            warranties, express or implied, including but not limited to merchantability, fitness
            for a particular purpose, and non-infringement.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            To the maximum extent permitted by law, we shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of
            our services.
          </p>
        </motion.section>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">6. Termination</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may terminate or suspend your account and access to our services immediately,
            without prior notice, for any reason, including breach of these terms.
          </p>
        </motion.section>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">7. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These terms shall be governed by and construed in accordance with the laws of the
            jurisdiction in which our company is incorporated, without regard to conflict of law principles.
          </p>
        </motion.section>
      </motion.div>

      <LandingFooter />
    </div>
  );
}
