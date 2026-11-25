import React from 'react';
import { Link } from 'react-router-dom';

export default function ReturnExchangePolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs text-luxury-gold uppercase tracking-widest font-bold">Store Policies</span>
        <h1 className="text-3xl sm:text-4xl font-serif text-luxury-charcoal">Return & Exchange Policy</h1>
        <div className="h-0.5 w-16 bg-luxury-gold mx-auto mt-2"></div>
        <p className="text-xs text-luxury-gray pt-2">Last updated: October 2026</p>
      </div>

      <div className="bg-white border border-luxury-border p-6 sm:p-10 space-y-8 text-sm text-luxury-charcoal font-light leading-relaxed shadow-xs">

        {/* Notice Banner */}
        <div className="bg-amber-50 border-l-4 border-luxury-gold p-4 text-xs sm:text-sm text-amber-900 font-medium">
          <p className="font-serif font-bold text-base mb-1">Important Notice: No Return & No Exchange Policy</p>
          <p>
            Please read our policy carefully before completing your purchase. Lumera Jewellery maintains a strict <strong>No Return and No Exchange Policy</strong> on all items sold through our online boutique.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            1. Overview of Policy
          </h2>
          <p>
            At Lumera Jewellery, we take utmost care in crafting, inspecting, and securely packaging our exquisite imitation jewellery collections—including necklaces, rings, earrings, and bangles. Due to hygiene, quality assurance, and the delicate nature of fine imitation plating, <strong>all sales are final</strong>.
          </p>
          <p>
            Products purchased from Lumera are <strong>not eligible for customer-requested returns</strong> and are <strong>not eligible for customer-requested exchanges</strong>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            2. Customer Responsibilities Before Purchase
          </h2>
          <p>
            To ensure complete satisfaction with your jewellery selection, we strongly advise all customers to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-luxury-charcoal/90">
            <li>Carefully review product descriptions, stone specifications, sizing details, and material finishes on the product page.</li>
            <li>Examine all high-resolution product photographs and zoom views.</li>
            <li>Verify your precise ring size, necklace length, or earring dimensions prior to adding items to your cart.</li>
            <li>Double-check your shipping address and contact details during checkout to ensure seamless courier delivery.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            3. Damaged, Defective, or Incorrect Products
          </h2>
          <p>
            While we conduct rigorous multi-stage quality checks before dispatch, we understand that transit issues or rare fulfillment discrepancies can occur.
          </p>
          <p>
            If you receive a product that is demonstrably damaged, structurally defective, or incorrect (different from the item ordered), please contact our customer support team immediately through our <Link to="/contact" className="text-luxury-gold underline font-medium">Contact Page</Link> within 48 hours of delivery, providing photographic or video evidence of the issue.
          </p>
          <p>
            Our support team will review your case to verify the reported issue and determine the appropriate resolution in accordance with applicable consumer protection guidelines and store operating standards.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            4. Order Cancellations
          </h2>
          <p>
            Orders may be canceled prior to dispatch and fulfillment by contacting customer support promptly. Once an order has been packed, shipped, or handed over to our courier partners, it can no longer be cancelled or intercepted.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif text-luxury-charcoal font-medium border-b border-luxury-border/50 pb-2">
            5. Questions and Support
          </h2>
          <p>
            If you have any questions regarding product specifications before ordering or require assistance with an active delivery, please reach out via our <Link to="/contact" className="text-luxury-gold underline hover:text-luxury-charcoal">Contact Page</Link>. Our team is dedicated to assisting you with care and professionalism.
          </p>
        </section>

      </div>

      <div className="text-center pt-4">
        <Link to="/shop" className="bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] hover:text-white px-8 py-3.5 text-xs uppercase tracking-widest font-semibold transition duration-300">
          Explore Jewellery Collections
        </Link>
      </div>
    </div>
  );
}
