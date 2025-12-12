"use client";

import { motion, Variants } from "framer-motion";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

export default function CookiePolicy() {
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
            COOKIE POLICY
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
          <h2 className="text-2xl font-bold mb-6">1. What Are Cookies</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              1.1 Cookie Definition
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files that are placed on your computer or
              mobile device when you visit our website. They are widely used to
              make websites work more efficiently and to provide information to
              website owners about how users interact with their sites.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              1.2 How We Use Cookies
            </h3>
            <p className="text-gray-700 leading-relaxed">
              We use cookies to enhance your browsing experience, analyze
              website traffic, personalize content, and remember your
              preferences. Cookies help us understand which parts of our website
              are most popular and how users navigate through our site.
            </p>
          </div>
        </motion.section>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">
            2. Types of Cookies We Use
          </h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              2.1 Essential Cookies
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies are necessary for the website to function properly.
              They enable core functionality such as security, network
              management, and accessibility. You cannot opt out of these cookies
              as they are essential for the website to work.
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
              <li>Authentication cookies to verify user identity</li>
              <li>Security cookies to protect against fraud</li>
              <li>Session cookies to maintain your login state</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              2.2 Analytics Cookies
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies help us understand how visitors interact with our
              website by collecting and reporting information anonymously. We
              use this information to improve our website and user experience.
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
              <li>Google Analytics for website usage statistics</li>
              <li>Performance monitoring cookies</li>
              <li>Heatmap and user behavior tracking</li>
            </ul>
          </div>
        </motion.section>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">
            3. Managing Your Cookie Preferences
          </h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">3.1 Browser Settings</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can control and manage cookies through your browser settings.
              Most browsers allow you to block or delete cookies, or to be
              notified when cookies are being set. Please note that blocking
              certain cookies may impact your user experience.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Here's how to manage cookies in popular browsers:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
              <li>
                <strong>Chrome:</strong> Settings → Privacy and Security →
                Cookies and other site data
              </li>
              <li>
                <strong>Firefox:</strong> Preferences → Privacy & Security →
                Cookies and Site Data
              </li>
              <li>
                <strong>Safari:</strong> Preferences → Privacy → Manage Website
                Data
              </li>
              <li>
                <strong>Edge:</strong> Settings → Cookies and site permissions
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">3.2 Cookie Consent</h3>
            <p className="text-gray-700 leading-relaxed">
              When you first visit our website, you'll see a cookie banner that
              allows you to accept or decline non-essential cookies. You can
              change your preferences at any time by clicking the "Cookie
              Settings" link in our website footer.
            </p>
          </div>
        </motion.section>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">4. Third-Party Cookies</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may also use third-party cookies from trusted partners to help us
            analyze website traffic, provide social media features, and deliver
            targeted advertising. These third parties have their own privacy
            policies governing their use of cookies.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Third-party services we use include:
          </p>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
            <li>Google Analytics for website analytics</li>
            <li>Social media platforms for sharing buttons</li>
            <li>Advertising networks for targeted ads</li>
          </ul>
        </motion.section>

        <motion.section className="mb-12" variants={contentVariants}>
          <h2 className="text-2xl font-bold mb-6">5. Updates to This Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may update this Cookie Policy from time to time to reflect
            changes in our practices or applicable laws. We will post any
            updates on this page and indicate the date of the last revision.
          </p>
        </motion.section>
      </motion.div>

      <LandingFooter />
    </div>
  );
}
