// Stripe Integration for Visual Visage Pricing Page
// This file shows how to integrate Stripe payments with your existing pricing page

// 1. Install Stripe: npm install stripe
// 2. Add your Stripe publishable key to pricing.html
// 3. Add this JavaScript to handle payments

class StripePaymentHandler {
  constructor() {
    this.stripe = Stripe('pk_test_your_publishable_key_here'); // Replace with your key
    this.elements = this.stripe.elements();
    this.paymentElement = null;
    this.clientSecret = null;
  }

  // Initialize payment form
  async initializePayment(amount, packageName) {
    try {
      // Create payment intent on your server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          package: packageName
        })
      });

      const data = await response.json();
      this.clientSecret = data.clientSecret;

      // Create payment element
      this.paymentElement = this.elements.create('payment');
      this.paymentElement.mount('#payment-element');

      return true;
    } catch (error) {
      console.error('Error initializing payment:', error);
      return false;
    }
  }

  // Handle form submission
  async handlePayment() {
    if (!this.clientSecret) {
      alert('Payment not initialized. Please try again.');
      return;
    }

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: `${window.location.origin}/success.html`,
      },
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        alert(error.message);
      } else {
        alert('An unexpected error occurred.');
      }
    }
  }

  // Get payment status
  async getPaymentStatus() {
    if (!this.clientSecret) return null;

    const { paymentIntent } = await this.stripe.retrievePaymentIntent(this.clientSecret);
    return paymentIntent.status;
  }
}

// Usage example for your pricing page:
/*
document.addEventListener('DOMContentLoaded', function() {
  const paymentHandler = new StripePaymentHandler();
  
  // When a package is selected
  document.querySelectorAll('.book-button').forEach(button => {
    button.addEventListener('click', async function() {
      const packageName = this.getAttribute('data-package');
      const price = this.getAttribute('data-price');
      
      // Initialize payment
      const success = await paymentHandler.initializePayment(price, packageName);
      
      if (success) {
        // Show payment form
        document.getElementById('checkoutModal').style.display = 'flex';
      }
    });
  });
  
  // Handle payment form submission
  document.getElementById('checkoutForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading state
    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.textContent = 'Processing Payment...';
    submitButton.disabled = true;
    
    try {
      await paymentHandler.handlePayment();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      submitButton.textContent = 'Send Booking Request';
      submitButton.disabled = false;
    }
  });
});
*/

// Alternative: Simple PayPal integration
function initializePayPal(amount, packageName) {
  paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: amount.toString()
          },
          description: packageName
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        // Payment completed successfully
        alert('Payment completed! Thank you for your purchase.');
        
        // You can redirect to a success page or close the modal
        // window.location.href = '/success.html';
      });
    },
    onError: function(err) {
      console.error('PayPal error:', err);
      alert('Payment failed. Please try again.');
    }
  }).render('#paypal-button-container');
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StripePaymentHandler, initializePayPal };
}
