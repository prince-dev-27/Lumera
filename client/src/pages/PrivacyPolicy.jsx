import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs text-luxury-gold uppercase tracking-widest font-bold">Privacy & Data Protection</span>
        <h1 className="text-3xl sm:text-4xl font-serif text-luxury-charcoal">Privacy Policy</h1>
        <div className="h-0.5 w-16 bg-luxury-gold mx-auto mt-2"></div>
        <p className="text-xs text-luxury-gray pt-2">Last updated: October 2026</p>
      </div>

      <div className="bg-white border border-luxury-border p-6 sm:p-10 space-y-8 text-sm text-luxury-charcoal font-light leading-relaxed shadow-xs">

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            1. Introduction
          </h2>
          <p>
            Welcome to <strong>Lumera Jewellery</strong> ("Lumera", "we", "our", or "us"). We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, create an account, purchase our products, or interact with our customer services.
          </p>
          <p>
            By accessing or using our platform, you agree to the collection and use of information in accordance with this policy. If you disagree with any part of this policy, please discontinue use of our website immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            2. Information We Collect
          </h2>
          <p>
            We collect information that identifies, relates to, describes, references, or is reasonably capable of being associated with you ("Personal Information"). The categories of information we collect depend on how you interact with our e-commerce platform.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            3. Personal Information Provided by Customers
          </h2>
          <p>
            When you register an account, update your profile, place an order, apply coupons, submit product reviews, or contact our support team, we may collect:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-luxury-charcoal/90">
            <li><strong>Identity Data:</strong> Full name and username.</li>
            <li><strong>Contact Data:</strong> Email address and telephone/mobile number.</li>
            <li><strong>Shipping & Billing Data:</strong> Street address, city, state, postal code, and country.</li>
            <li><strong>User-Generated Content:</strong> Product reviews, ratings, and feedback messages.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            4. Account and Order Information
          </h2>
          <p>
            To facilitate secure shopping and order fulfillment, our database securely maintains records of your account credentials (passwords stored using industry-standard cryptographic hashing), order history, purchased items, quantities, total order values, discount codes applied, and current order fulfillment statuses.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            5. How We Use Customer Information
          </h2>
          <p>
            We use the information collected for legitimate business and operational purposes, including:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-luxury-charcoal/90">
            <li>Processing, verifying, and fulfilling your jewellery orders.</li>
            <li>Managing your customer account, wishlist items, and saved addresses.</li>
            <li>Communicating order confirmations, tracking updates, and support responses.</li>
            <li>Enforcing inventory stock constraints and preventing fraudulent transactions.</li>
            <li>Moderating product reviews and improving our jewellery collections and website UX.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            6. Payment Information and Payment Processing
          </h2>
          <p>
            Lumera does not directly store complete credit card numbers, debit card PINs, or sensitive banking credentials on our primary servers. Payment transactions during checkout are securely processed through authorized payment gateway partners adhering to PCI-DSS security standards. We retain only transaction references, payment confirmation statuses, and order totals required for accounting and auditing.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            7. Cookies and Similar Technologies
          </h2>
          <p>
            Our website utilizes browser Local Storage and essential session cookies to maintain your authentication state (JSON Web Tokens), shopping cart contents, wishlist preferences, and interface settings across browsing sessions. You can configure your browser to refuse cookies, though certain storefront features may not function optimally.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            8. Data Sharing and Third-Party Services
          </h2>
          <p>
            We do not sell, rent, or trade your personal information to third parties. We share data only with trusted service providers who assist us in operating our website, conducting our business, or servicing you, provided those parties agree to keep this information confidential.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            9. Cloudinary and Product Image Services
          </h2>
          <p>
            To deliver high-resolution imagery of our jewellery collections efficiently, our platform integrates with Cloudinary for product image hosting and media optimization. Cloudinary processes image assets securely in accordance with enterprise data protection standards.
          </p>
        </section>

        {/* Section 10 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            10. Data Security
          </h2>
          <p>
            We implement robust administrative, technical, and physical security measures—including HTTPS encryption, bcrypt password hashing, JWT authentication validation, MongoDB access controls, and server-side price recalculation—to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        {/* Section 11 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            11. Data Retention
          </h2>
          <p>
            We retain your personal information and order records for as long as your account remains active or as needed to provide you services, comply with legal obligations, resolve disputes, and enforce our agreements. You may request account deletion by contacting our support team.
          </p>
        </section>

        {/* Section 12 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            12. Customer Privacy Rights
          </h2>
          <p>
            Depending on your jurisdiction, you possess rights regarding your personal data, including the right to access, correct, or request deletion of your personal information, as well as the right to object to or restrict certain data processing activities.
          </p>
        </section>

        {/* Section 13 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            13. Children's Privacy
          </h2>
          <p>
            Our website and services are intended for general audiences and are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors.
          </p>
        </section>

        {/* Section 14 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            14. Changes to This Privacy Policy
          </h2>
          <p>
            We may update our Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this Privacy Policy periodically for any updates.
          </p>
        </section>

        {/* Section 15 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            15. Contact Information
          </h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please reach out to us through our <Link to="/contact" className="text-luxury-gold underline hover:text-luxury-charcoal">Contact Page</Link>.
          </p>
        </section>

      </div>

      <div className="text-center pt-4">
        <Link to="/shop" className="bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] hover:text-white px-8 py-3.5 text-xs uppercase tracking-widest font-semibold transition duration-300">
          Return to Shop
        </Link>
      </div>
    </div>
  );
}
