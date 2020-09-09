import React, { Component } from "react";
import CheckoutPage from "./Checkout";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe("pk_test_Hd8AKmjGj4yk4Rl6r1vRLE3C00Zo2UqTiL");

class Checkout extends Component {
  render() {
    return (
      <Elements stripe={stripePromise}>
        <CheckoutPage />
      </Elements>
    );
  }
}

export default Checkout;
