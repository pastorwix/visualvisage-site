# Payment Integration Guide for Visual Visage

## 💳 **Payment Processing Options**

### **Option 1: Stripe (Recommended)**
Stripe is the most popular and easiest to integrate:

1. **Sign up for Stripe**:
   - Go to [stripe.com](https://stripe.com)
   - Create an account
   - Get your API keys

2. **Install Stripe**:
   ```bash
   cd blog-server
   npm install stripe
   ```

3. **Update server.js** to handle payments:
   ```javascript
   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
   
   // Create payment intent
   app.post('/api/create-payment-intent', async (req, res) => {
     try {
       const { amount, package } = req.body;
       
       const paymentIntent = await stripe.paymentIntents.create({
         amount: amount * 100, // Stripe uses cents
         currency: 'usd',
         metadata: { package }
       });
       
       res.json({ clientSecret: paymentIntent.client_secret });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   ```

4. **Update pricing.html** to use Stripe:
   ```javascript
   // Replace the current form submission with Stripe
   const stripe = Stripe('your_publishable_key');
   const elements = stripe.elements();
   
   // Create payment element
   const paymentElement = elements.create('payment');
   paymentElement.mount('#payment-element');
   
   // Handle form submission
   form.addEventListener('submit', async (e) => {
     e.preventDefault();
     
     const { error } = await stripe.confirmPayment({
       elements,
       confirmParams: {
         return_url: `${window.location.origin}/success.html`,
       },
     });
   });
   ```

### **Option 2: PayPal**
PayPal is also popular and easy to integrate:

1. **Sign up for PayPal Business**:
   - Go to [paypal.com/business](https://paypal.com/business)
   - Create a business account

2. **Install PayPal SDK**:
   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD"></script>
   ```

3. **Add PayPal buttons** to pricing.html:
   ```javascript
   paypal.Buttons({
     createOrder: function(data, actions) {
       return actions.order.create({
         purchase_units: [{
           amount: {
             value: packagePrice
           },
           description: packageName
         }]
       });
     },
     onApprove: function(data, actions) {
       return actions.order.capture().then(function(details) {
         // Payment completed
         alert('Payment completed!');
       });
     }
   }).render('#paypal-button-container');
   ```

### **Option 3: Square**
Square is great for small businesses:

1. **Sign up for Square**:
   - Go to [squareup.com](https://squareup.com)
   - Create an account

2. **Install Square SDK**:
   ```html
   <script src="https://sandbox.web.squarecdn.com/v1/square.js"></script>
   ```

## 🛠️ **Quick Implementation Steps**

### **Step 1: Choose Your Payment Processor**
- **Stripe**: Best for online businesses, great developer experience
- **PayPal**: Most recognized, good for international customers
- **Square**: Great for small businesses, good rates

### **Step 2: Update Environment Variables**
Add to your hosting platform:
```bash
# For Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# For PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
```

### **Step 3: Test the Integration**
1. Use test/sandbox mode first
2. Test with test credit cards
3. Verify payments are received
4. Go live when ready

## 📱 **Mobile Payment Options**

### **Apple Pay / Google Pay**
Both Stripe and PayPal support these:
- Better user experience
- Higher conversion rates
- Built-in security

### **Digital Wallets**
- Venmo (US)
- Cash App
- Zelle

## 🔒 **Security Considerations**

1. **Never store credit card data** on your server
2. **Use HTTPS** for all payment pages
3. **Validate payments** on your server
4. **Keep API keys secure** in environment variables
5. **Follow PCI compliance** guidelines

## 💰 **Fee Structure**

### **Stripe**
- 2.9% + 30¢ per successful charge
- No monthly fees
- No setup fees

### **PayPal**
- 2.9% + fixed fee per transaction
- No monthly fees
- International fees may apply

### **Square**
- 2.6% + 10¢ per transaction
- No monthly fees
- Good for small businesses

## 🚀 **Deployment Checklist**

- [ ] Choose payment processor
- [ ] Sign up for business account
- [ ] Get API keys
- [ ] Update environment variables
- [ ] Test in sandbox mode
- [ ] Deploy to production
- [ ] Test live payments
- [ ] Set up webhook notifications

## 📞 **Support Resources**

- **Stripe**: [stripe.com/docs](https://stripe.com/docs)
- **PayPal**: [developer.paypal.com](https://developer.paypal.com)
- **Square**: [developer.squareup.com](https://developer.squareup.com)

---

**Recommendation**: Start with Stripe for the best developer experience and comprehensive features.
